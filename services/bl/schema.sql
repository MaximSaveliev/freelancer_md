-- ============================================================
-- freelancer.md — Database Schema
-- ============================================================

-- ============================================================
-- EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE user_role         AS ENUM ('CLIENT', 'FREELANCER', 'ADMIN');
CREATE TYPE proficiency_level AS ENUM ('JUNIOR', 'MIDDLE', 'SENIOR');
-- proficiency_level: JUNIOR = beginner, MIDDLE = intermediate, SENIOR = expert

CREATE TYPE payment_type      AS ENUM ('FIXED', 'HOURLY', 'AUCTION');
CREATE TYPE project_status    AS ENUM ('OPEN', 'IN_PROGRESS', 'COMPLETED', 'DISPUTED', 'CANCELLED');
CREATE TYPE bid_status        AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');
CREATE TYPE invitation_status AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED');

-- ============================================================
-- USERS
-- One account, one permanent role
-- ============================================================
CREATE TABLE users (
    id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    email         VARCHAR(255) NOT NULL UNIQUE,
    phone         VARCHAR(20)  UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role          user_role    NOT NULL,
    is_verified   BOOLEAN      NOT NULL DEFAULT false,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_email ON users (email);

-- ============================================================
-- PROFILES
-- One profile per user (1:1 with users)
-- ============================================================
CREATE TABLE profiles (
    id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID         NOT NULL UNIQUE REFERENCES users (id) ON DELETE CASCADE,

    -- Common
    first_name    VARCHAR(100) NOT NULL,
    last_name     VARCHAR(100) NOT NULL,
    avatar_url    VARCHAR(500),
    bio           TEXT,
    location      VARCHAR(150),
    is_verified   BOOLEAN      NOT NULL DEFAULT false,  -- "Официальный заказчик" / verified freelancer

    -- Aggregated stats (recalculated on review create)
    rating        DECIMAL(3,2) NOT NULL DEFAULT 0,
    review_count  INTEGER      NOT NULL DEFAULT 0,

    -- Freelancer-specific
    grade         proficiency_level,
    hourly_rate   INTEGER,                              -- $/hr
    total_earned  INTEGER      NOT NULL DEFAULT 0,
    completed_count INTEGER    NOT NULL DEFAULT 0,
    success_rate  DECIMAL(5,2) NOT NULL DEFAULT 0,      -- %

    -- Client-specific
    company_name  VARCHAR(150),
    company_size  VARCHAR(50),                          -- e.g. "50-100"
    founded_year  SMALLINT,
    website_url   VARCHAR(500),
    position      VARCHAR(100),
    industry      VARCHAR(100),

    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_profiles_rating ON profiles (rating DESC);

-- ============================================================
-- SKILLS  (shared dictionary)
-- ============================================================
CREATE TABLE skills (
    id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    name       VARCHAR(100) NOT NULL UNIQUE,
    slug       VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- Freelancer skills with proficiency level
CREATE TABLE profile_skills (
    user_id     UUID              NOT NULL REFERENCES users (id)  ON DELETE CASCADE,
    skill_id    UUID              NOT NULL REFERENCES skills (id) ON DELETE CASCADE,
    proficiency proficiency_level,
    created_at  TIMESTAMPTZ       NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ       NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, skill_id)
);

CREATE INDEX idx_profile_skills_user ON profile_skills (user_id);

-- ============================================================
-- PORTFOLIO
-- ============================================================
CREATE TABLE portfolio_items (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID         NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    title       VARCHAR(200) NOT NULL,
    description TEXT,
    project_url VARCHAR(500),
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_portfolio_user ON portfolio_items (user_id);

-- Multiple images per portfolio item
CREATE TABLE portfolio_images (
    id                UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_item_id UUID         NOT NULL REFERENCES portfolio_items (id) ON DELETE CASCADE,
    url               VARCHAR(500) NOT NULL,
    sort_order        SMALLINT     NOT NULL DEFAULT 0,
    created_at        TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_portfolio_images_item ON portfolio_images (portfolio_item_id);

-- ============================================================
-- AVAILABILITY  (freelancer calendar)
-- ============================================================
CREATE TABLE availability (
    user_id      UUID        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    date         DATE        NOT NULL,
    is_available BOOLEAN     NOT NULL DEFAULT true,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, date)
);

-- ============================================================
-- CATEGORIES
-- ============================================================
CREATE TABLE categories (
    id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    name       VARCHAR(100) NOT NULL,
    slug       VARCHAR(100) NOT NULL UNIQUE,
    parent_id  UUID         REFERENCES categories (id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- ============================================================
-- PROJECTS
-- ============================================================
CREATE TABLE projects (
    id             UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id        UUID           NOT NULL REFERENCES users (id) ON DELETE RESTRICT,  -- client
    category_id    UUID           REFERENCES categories (id) ON DELETE SET NULL,

    title          VARCHAR(300)   NOT NULL,
    description    TEXT           NOT NULL,
    payment_type   payment_type   NOT NULL,

    -- budget: {"amount": 500} for fixed, {"min": 200, "max": 800} for range
    budget         JSONB          NOT NULL,
    is_fixed_price BOOLEAN        NOT NULL DEFAULT true,

    required_grade proficiency_level,
    deadline       TIMESTAMPTZ,
    is_urgent      BOOLEAN        NOT NULL DEFAULT false,
    status         project_status NOT NULL DEFAULT 'OPEN',

    -- Denormalized counters (updated on bid operations)
    bid_count      INTEGER        NOT NULL DEFAULT 0,
    avg_bid        INTEGER,                             -- exposed to Premium users only (API layer)

    created_at     TIMESTAMPTZ    NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ    NOT NULL DEFAULT now()
);

CREATE INDEX idx_projects_status       ON projects (status);
CREATE INDEX idx_projects_user_id      ON projects (user_id);
CREATE INDEX idx_projects_category     ON projects (category_id);
CREATE INDEX idx_projects_payment_type ON projects (payment_type);
CREATE INDEX idx_projects_created_at   ON projects (created_at DESC);
CREATE INDEX idx_projects_budget       ON projects USING GIN (budget);

-- Required skills per project
CREATE TABLE project_skills (
    project_id UUID        NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
    skill_id   UUID        NOT NULL REFERENCES skills (id)   ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (project_id, skill_id)
);

CREATE INDEX idx_project_skills_skill ON project_skills (skill_id);

-- ============================================================
-- BIDS
-- ============================================================
CREATE TABLE bids (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id    UUID        NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
    user_id       UUID        NOT NULL REFERENCES users (id)    ON DELETE CASCADE,  -- freelancer
    amount        INTEGER     NOT NULL,
    delivery_days INTEGER     NOT NULL,
    cover_letter  TEXT,
    status        bid_status  NOT NULL DEFAULT 'PENDING',
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

    UNIQUE (project_id, user_id)
);

CREATE INDEX idx_bids_project ON bids (project_id);
CREATE INDEX idx_bids_user    ON bids (user_id);
CREATE INDEX idx_bids_status  ON bids (status);

-- ============================================================
-- PROJECT INVITATIONS  (client → freelancer)
-- ============================================================
CREATE TABLE project_invitations (
    id            UUID              PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id    UUID              NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
    client_id     UUID              NOT NULL REFERENCES users (id)    ON DELETE CASCADE,
    freelancer_id UUID              NOT NULL REFERENCES users (id)    ON DELETE CASCADE,
    message       TEXT,
    status        invitation_status NOT NULL DEFAULT 'PENDING',
    created_at    TIMESTAMPTZ       NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ       NOT NULL DEFAULT now(),

    UNIQUE (project_id, freelancer_id)
);

CREATE INDEX idx_invitations_freelancer ON project_invitations (freelancer_id);
CREATE INDEX idx_invitations_project    ON project_invitations (project_id);

-- ============================================================
-- REVIEWS
-- ============================================================
CREATE TABLE reviews (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID        NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
    author_id  UUID        NOT NULL REFERENCES users (id)    ON DELETE CASCADE,
    target_id  UUID        NOT NULL REFERENCES users (id)    ON DELETE CASCADE,
    score      SMALLINT    NOT NULL CHECK (score BETWEEN 1 AND 5),
    text       TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    UNIQUE (project_id, author_id)
);

CREATE INDEX idx_reviews_target  ON reviews (target_id);
CREATE INDEX idx_reviews_project ON reviews (project_id);

-- ============================================================
-- BOOKMARKS
-- ============================================================
CREATE TABLE bookmarks (
    user_id    UUID        NOT NULL REFERENCES users (id)    ON DELETE CASCADE,
    project_id UUID        NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, project_id)
);

CREATE INDEX idx_bookmarks_user ON bookmarks (user_id);

-- ============================================================
-- USER DOCUMENTS
-- ============================================================
CREATE TABLE user_documents (
    id                UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           UUID         NOT NULL REFERENCES users (id)           ON DELETE CASCADE,
    project_id        UUID         REFERENCES projects (id)                 ON DELETE SET NULL,
    portfolio_item_id UUID         REFERENCES portfolio_items (id)          ON DELETE SET NULL,
    filename          VARCHAR(500) NOT NULL,
    url               VARCHAR(500) NOT NULL,
    content_type      VARCHAR(100) NOT NULL,
    created_at        TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_user_documents_user      ON user_documents (user_id);
CREATE INDEX idx_user_documents_project   ON user_documents (project_id);
CREATE INDEX idx_user_documents_portfolio ON user_documents (portfolio_item_id);

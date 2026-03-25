# BL Service — Request Flow

Full end-to-end request sequence tested against the live service.

**Chuck Norris** (FREELANCER) — `7ce30117-f275-44e7-a021-4f6191d22ad2`  
**John Doe** (CLIENT) — `11111111-1111-1111-1111-111111111111`


---

## 1. Create Users (gateway → BL sync)

### 1. Create user — Chuck Norris (FREELANCER)

**`POST /users`** → `201`

**Request:**
```json
{
  "id": "7ce30117-f275-44e7-a021-4f6191d22ad2",
  "email": "chuck.norris@gmail.com",
  "role": "FREELANCER",
  "is_verified": true
}
```

### 2. Create user — John Doe (CLIENT)

**`POST /users`** → `201`

**Request:**
```json
{
  "id": "11111111-1111-1111-1111-111111111111",
  "email": "john.doe@gmail.com",
  "role": "CLIENT",
  "is_verified": true
}
```


---

## 2. Categories

### 3. Create category — Web Development

**`POST /categories`** → `201`

**Request:**
```json
{
  "name": "Web Development",
  "slug": "web-development"
}
```

**Response:**
```json
{
  "id": "1eb75512-281b-4cc9-851d-114c8e3ba97f"
}
```


---

## 3. Skills

### 4. Create skill — Python

**`POST /skills`** → `201`

**Request:**
```json
{
  "name": "Python",
  "slug": "python"
}
```

**Response:**
```json
{
  "id": "ab210f1c-d25e-4a00-85ea-21a5e1d45b49"
}
```


---

## 4. Profiles — Create

### 5. Create Chuck's profile

**`POST /profiles`** → `201`

**Request:**
```json
{
  "user_id": "7ce30117-f275-44e7-a021-4f6191d22ad2",
  "first_name": "Chuck",
  "last_name": "Norris"
}
```

### 6. Create John's profile

**`POST /profiles`** → `201`

**Request:**
```json
{
  "user_id": "11111111-1111-1111-1111-111111111111",
  "first_name": "John",
  "last_name": "Doe"
}
```

### 7. Create project

**`POST /projects`** → `201`

**Request:**
```json
{
  "user_id": "11111111-1111-1111-1111-111111111111",
  "title": "Build a REST API"
}
```

**Response:**
```json
{
  "id": "9611fac2-f9aa-4d81-9974-87c7172a8be1"
}
```


---

## 5. Get User

### 8. GET user — Chuck

**`GET /users/7ce30117-f275-44e7-a021-4f6191d22ad2`** → `200`

**Response:**
```json
{
  "id": "7ce30117-f275-44e7-a021-4f6191d22ad2",
  "email": "chuck.norris@gmail.com",
  "phone": null,
  "role": "FREELANCER",
  "is_verified": true,
  "created_at": "2026-03-25T00:31:32.453974Z",
  "updated_at": "2026-03-25T00:31:32.453974Z"
}
```


---

## 6. Categories — Read

### 9. GET categories

**`GET /categories`** → `200`

**Response:**
```json
[
  {
    "id": "1eb75512-281b-4cc9-851d-114c8e3ba97f",
    "name": "Web Development",
    "slug": "web-development",
    "parent_id": null,
    "created_at": "2026-03-25T00:31:33.817371Z",
    "updated_at": "2026-03-25T00:31:33.817371Z"
  }
]
```

### 10. GET category by ID

**`GET /categories/1eb75512-281b-4cc9-851d-114c8e3ba97f`** → `200`

**Response:**
```json
{
  "id": "1eb75512-281b-4cc9-851d-114c8e3ba97f",
  "name": "Web Development",
  "slug": "web-development",
  "parent_id": null,
  "created_at": "2026-03-25T00:31:33.817371Z",
  "updated_at": "2026-03-25T00:31:33.817371Z"
}
```


---

## 7. Skills — Read

### 11. GET skills

**`GET /skills`** → `200`

**Response:**
```json
[
  {
    "id": "ab210f1c-d25e-4a00-85ea-21a5e1d45b49",
    "name": "Python",
    "slug": "python",
    "created_at": "2026-03-25T00:31:34.974158Z",
    "updated_at": "2026-03-25T00:31:34.974158Z"
  }
]
```

### 12. GET skills with search

**`GET /skills?q=py`** → `200`

**Response:**
```json
[
  {
    "id": "ab210f1c-d25e-4a00-85ea-21a5e1d45b49",
    "name": "Python",
    "slug": "python",
    "created_at": "2026-03-25T00:31:34.974158Z",
    "updated_at": "2026-03-25T00:31:34.974158Z"
  }
]
```

### 13. GET skill by ID

**`GET /skills/ab210f1c-d25e-4a00-85ea-21a5e1d45b49`** → `200`

**Response:**
```json
{
  "id": "ab210f1c-d25e-4a00-85ea-21a5e1d45b49",
  "name": "Python",
  "slug": "python",
  "created_at": "2026-03-25T00:31:34.974158Z",
  "updated_at": "2026-03-25T00:31:34.974158Z"
}
```


---

## 8. Profiles — Read & Update

### 14. GET Chuck's profile

**`GET /profiles/7ce30117-f275-44e7-a021-4f6191d22ad2`** → `200`

**Response:**
```json
{
  "id": "565f7cf4-d9bf-40c0-a091-eef6717113f6",
  "user_id": "7ce30117-f275-44e7-a021-4f6191d22ad2",
  "first_name": "Chuck",
  "last_name": "Norris",
  "avatar_url": null,
  "bio": "Roundhouse kicks bugs out of production.",
  "location": "Texas, USA",
  "is_verified": false,
  "rating": 0.0,
  "review_count": 0,
  "grade": "SENIOR",
  "hourly_rate": 150,
  "total_earned": 0,
  "completed_count": 0,
  "success_rate": 0.0,
  "company_name": null,
  "company_size": null,
  "founded_year": null,
  "website_url": null,
  "position": null,
  "industry": null,
  "created_at": "2026-03-25T00:31:36.409154Z",
  "updated_at": "2026-03-25T00:31:36.409154Z"
}
```

### 15. PATCH Chuck's profile

**`PATCH /profiles/7ce30117-f275-44e7-a021-4f6191d22ad2?requester_id=7ce30117-f275-44e7-a021-4f6191d22ad2`** → `200`

**Request:**
```json
{
  "bio": "Roundhouse kicks bugs out of production."
}
```

**Response:**
```json
{
  "id": "565f7cf4-d9bf-40c0-a091-eef6717113f6",
  "user_id": "7ce30117-f275-44e7-a021-4f6191d22ad2",
  "first_name": "Chuck",
  "last_name": "Norris",
  "avatar_url": null,
  "bio": "Roundhouse kicks bugs out of production.",
  "location": "Texas, USA",
  "is_verified": false,
  "rating": 0.0,
  "review_count": 0,
  "grade": "SENIOR",
  "hourly_rate": 150,
  "total_earned": 0,
  "completed_count": 0,
  "success_rate": 0.0,
  "company_name": null,
  "company_size": null,
  "founded_year": null,
  "website_url": null,
  "position": null,
  "industry": null,
  "created_at": "2026-03-25T00:31:36.409154Z",
  "updated_at": "2026-03-25T00:31:36.409154Z"
}
```


---

## 9. Skills on Profile

### 16. Add Python skill to Chuck's profile

**`POST /skills/profile`** → `409`

**Request:**
```json
{
  "user_id": "7ce30117-f275-44e7-a021-4f6191d22ad2",
  "skill_id": "ab210f1c-d25e-4a00-85ea-21a5e1d45b49",
  "proficiency": "SENIOR"
}
```

**Response:**
```json
{
  "detail": "Skill already added to profile"
}
```

### 17. GET Chuck's profile skills

**`GET /skills/profile/7ce30117-f275-44e7-a021-4f6191d22ad2`** → `200`

**Response:**
```json
[
  {
    "user_id": "7ce30117-f275-44e7-a021-4f6191d22ad2",
    "skill_id": "ab210f1c-d25e-4a00-85ea-21a5e1d45b49",
    "proficiency": "SENIOR",
    "created_at": "2026-03-25T00:31:37.954388Z",
    "updated_at": "2026-03-25T00:31:37.954388Z"
  }
]
```


---

## 10. Portfolio

### 18. GET Chuck's portfolio

**`GET /portfolio/7ce30117-f275-44e7-a021-4f6191d22ad2`** → `200`

**Response:**
```json
[
  {
    "id": "7c6a1149-a9ed-49e5-9087-801ad9464eff",
    "user_id": "7ce30117-f275-44e7-a021-4f6191d22ad2",
    "title": "Roundhouse CRM",
    "description": "A CRM system that deletes bugs by itself.",
    "project_url": "https://github.com/chucknorris/roundhouse-crm",
    "created_at": "2026-03-25T00:31:38.720515Z",
    "updated_at": "2026-03-25T00:31:38.720515Z"
  }
]
```

### 19. GET portfolio images

**`GET /portfolio/7c6a1149-a9ed-49e5-9087-801ad9464eff/images`** → `200`

**Response:**
```json
[
  {
    "id": "dc209855-6ec4-4adf-a74e-a937a359778a",
    "portfolio_item_id": "7c6a1149-a9ed-49e5-9087-801ad9464eff",
    "url": "https://example.com/crm-screenshot.png",
    "sort_order": 0,
    "created_at": "2026-03-25T00:31:39.577859Z"
  }
]
```


---

## 11. Availability

### 20. Set availability — 2026-04-01 available

**`POST /availability`** → `200`

**Request:**
```json
{
  "user_id": "7ce30117-f275-44e7-a021-4f6191d22ad2",
  "date": "2026-04-01",
  "is_available": true
}
```

**Response:**
```json
{
  "user_id": "7ce30117-f275-44e7-a021-4f6191d22ad2",
  "date": "2026-04-01",
  "is_available": true
}
```

### 21. Set availability — 2026-04-02 available

**`POST /availability`** → `200`

**Request:**
```json
{
  "user_id": "7ce30117-f275-44e7-a021-4f6191d22ad2",
  "date": "2026-04-02",
  "is_available": true
}
```

**Response:**
```json
{
  "user_id": "7ce30117-f275-44e7-a021-4f6191d22ad2",
  "date": "2026-04-02",
  "is_available": true
}
```

### 22. Set availability — 2026-04-05 unavailable

**`POST /availability`** → `200`

**Request:**
```json
{
  "user_id": "7ce30117-f275-44e7-a021-4f6191d22ad2",
  "date": "2026-04-05",
  "is_available": false
}
```

**Response:**
```json
{
  "user_id": "7ce30117-f275-44e7-a021-4f6191d22ad2",
  "date": "2026-04-05",
  "is_available": false
}
```

### 23. GET Chuck's availability

**`GET /availability/7ce30117-f275-44e7-a021-4f6191d22ad2`** → `200`

**Response:**
```json
[
  {
    "user_id": "7ce30117-f275-44e7-a021-4f6191d22ad2",
    "date": "2026-04-01",
    "is_available": true
  },
  {
    "user_id": "7ce30117-f275-44e7-a021-4f6191d22ad2",
    "date": "2026-04-02",
    "is_available": true
  },
  {
    "user_id": "7ce30117-f275-44e7-a021-4f6191d22ad2",
    "date": "2026-04-05",
    "is_available": false
  }
]
```


---

## 12. Projects

### 24. GET projects (basic — avg_bid hidden)

**`GET /projects?user_plan=basic`** → `200`

**Response:**
```json
[
  {
    "id": "9611fac2-f9aa-4d81-9974-87c7172a8be1",
    "user_id": "11111111-1111-1111-1111-111111111111",
    "category_id": "1eb75512-281b-4cc9-851d-114c8e3ba97f",
    "title": "Updated title",
    "description": "We need a senior Python developer to build a FastAPI service.",
    "payment_type": "FIXED",
    "budget": {
      "amount": 3000
    },
    "is_fixed_price": true,
    "required_grade": "SENIOR",
    "deadline": null,
    "is_urgent": true,
    "status": "OPEN",
    "bid_count": 0,
    "avg_bid": null,
    "created_at": "2026-03-25T00:31:41.903770Z",
    "updated_at": "2026-03-25T00:31:41.903770Z"
  }
]
```

### 25. GET projects (premium — avg_bid visible)

**`GET /projects?user_plan=premium`** → `200`

**Response:**
```json
[
  {
    "id": "9611fac2-f9aa-4d81-9974-87c7172a8be1",
    "user_id": "11111111-1111-1111-1111-111111111111",
    "category_id": "1eb75512-281b-4cc9-851d-114c8e3ba97f",
    "title": "Updated title",
    "description": "We need a senior Python developer to build a FastAPI service.",
    "payment_type": "FIXED",
    "budget": {
      "amount": 3000
    },
    "is_fixed_price": true,
    "required_grade": "SENIOR",
    "deadline": null,
    "is_urgent": true,
    "status": "OPEN",
    "bid_count": 0,
    "avg_bid": null,
    "created_at": "2026-03-25T00:31:41.903770Z",
    "updated_at": "2026-03-25T00:31:41.903770Z"
  }
]
```

### 26. GET project by ID

**`GET /projects/9611fac2-f9aa-4d81-9974-87c7172a8be1?user_plan=basic`** → `200`

**Response:**
```json
{
  "id": "9611fac2-f9aa-4d81-9974-87c7172a8be1",
  "user_id": "11111111-1111-1111-1111-111111111111",
  "category_id": "1eb75512-281b-4cc9-851d-114c8e3ba97f",
  "title": "Updated title",
  "description": "We need a senior Python developer to build a FastAPI service.",
  "payment_type": "FIXED",
  "budget": {
    "amount": 3000
  },
  "is_fixed_price": true,
  "required_grade": "SENIOR",
  "deadline": null,
  "is_urgent": true,
  "status": "OPEN",
  "bid_count": 0,
  "avg_bid": null,
  "created_at": "2026-03-25T00:31:41.903770Z",
  "updated_at": "2026-03-25T00:31:41.903770Z"
}
```

### 27. PATCH project — set deadline

**`PATCH /projects/9611fac2-f9aa-4d81-9974-87c7172a8be1?user_id=11111111-1111-1111-1111-111111111111`** → `200`

**Request:**
```json
{
  "deadline": "2026-05-01T00:00:00Z"
}
```

**Response:**
```json
{
  "id": "9611fac2-f9aa-4d81-9974-87c7172a8be1",
  "user_id": "11111111-1111-1111-1111-111111111111",
  "category_id": "1eb75512-281b-4cc9-851d-114c8e3ba97f",
  "title": "Updated title",
  "description": "We need a senior Python developer to build a FastAPI service.",
  "payment_type": "FIXED",
  "budget": {
    "amount": 3000
  },
  "is_fixed_price": true,
  "required_grade": "SENIOR",
  "deadline": "2026-05-01T00:00:00Z",
  "is_urgent": true,
  "status": "OPEN",
  "bid_count": 0,
  "avg_bid": null,
  "created_at": "2026-03-25T00:31:41.903770Z",
  "updated_at": "2026-03-25T00:31:41.903770Z"
}
```


---

## 13. Bids

### 28. POST bid — Chuck bids on project

**`POST /projects/9611fac2-f9aa-4d81-9974-87c7172a8be1/bids`** → `201`

**Request:**
```json
{
  "user_id": "7ce30117-f275-44e7-a021-4f6191d22ad2",
  "amount": 2800,
  "delivery_days": 14,
  "cover_letter": "I have roundhouse-kicked worse problems. This is nothing."
}
```

**Response:**
```json
{
  "id": "a226bdad-d53a-4c35-9c46-979584494f00",
  "project_id": "9611fac2-f9aa-4d81-9974-87c7172a8be1",
  "user_id": "7ce30117-f275-44e7-a021-4f6191d22ad2",
  "amount": 2800,
  "delivery_days": 14,
  "cover_letter": "I have roundhouse-kicked worse problems. This is nothing.",
  "status": "PENDING",
  "created_at": "2026-03-25T00:35:36.440695Z",
  "updated_at": "2026-03-25T00:35:36.440695Z"
}
```

### 29. GET bids on project

**`GET /projects/9611fac2-f9aa-4d81-9974-87c7172a8be1/bids`** → `200`

**Response:**
```json
[
  {
    "id": "a226bdad-d53a-4c35-9c46-979584494f00",
    "project_id": "9611fac2-f9aa-4d81-9974-87c7172a8be1",
    "user_id": "7ce30117-f275-44e7-a021-4f6191d22ad2",
    "amount": 2800,
    "delivery_days": 14,
    "cover_letter": "I have roundhouse-kicked worse problems. This is nothing.",
    "status": "PENDING",
    "created_at": "2026-03-25T00:35:36.440695Z",
    "updated_at": "2026-03-25T00:35:36.440695Z"
  }
]
```

### 30. GET bid by ID

**`GET /projects/9611fac2-f9aa-4d81-9974-87c7172a8be1/bids/a226bdad-d53a-4c35-9c46-979584494f00`** → `200`

**Response:**
```json
{
  "id": "a226bdad-d53a-4c35-9c46-979584494f00",
  "project_id": "9611fac2-f9aa-4d81-9974-87c7172a8be1",
  "user_id": "7ce30117-f275-44e7-a021-4f6191d22ad2",
  "amount": 2800,
  "delivery_days": 14,
  "cover_letter": "I have roundhouse-kicked worse problems. This is nothing.",
  "status": "PENDING",
  "created_at": "2026-03-25T00:35:36.440695Z",
  "updated_at": "2026-03-25T00:35:36.440695Z"
}
```

### 31. PATCH bid status — John accepts

**`PATCH /projects/9611fac2-f9aa-4d81-9974-87c7172a8be1/bids/a226bdad-d53a-4c35-9c46-979584494f00/status?user_id=11111111-1111-1111-1111-111111111111`** → `200`

**Request:**
```json
{
  "status": "ACCEPTED"
}
```

**Response:**
```json
{
  "id": "a226bdad-d53a-4c35-9c46-979584494f00",
  "project_id": "9611fac2-f9aa-4d81-9974-87c7172a8be1",
  "user_id": "7ce30117-f275-44e7-a021-4f6191d22ad2",
  "amount": 2800,
  "delivery_days": 14,
  "cover_letter": "I have roundhouse-kicked worse problems. This is nothing.",
  "status": "ACCEPTED",
  "created_at": "2026-03-25T00:35:36.440695Z",
  "updated_at": "2026-03-25T00:35:36.440695Z"
}
```


---

## 14. Invitations

### 32. POST invitation — John invites Chuck

**`POST /projects/9611fac2-f9aa-4d81-9974-87c7172a8be1/invitations`** → `201`

**Request:**
```json
{
  "client_id": "11111111-1111-1111-1111-111111111111",
  "freelancer_id": "7ce30117-f275-44e7-a021-4f6191d22ad2",
  "message": "Chuck, we'd love to have you on another project too."
}
```

**Response:**
```json
{
  "id": "933f84b0-bec0-4151-b9d0-554aa47a4033",
  "project_id": "9611fac2-f9aa-4d81-9974-87c7172a8be1",
  "client_id": "11111111-1111-1111-1111-111111111111",
  "freelancer_id": "7ce30117-f275-44e7-a021-4f6191d22ad2",
  "message": "Chuck, we'd love to have you on another project too.",
  "status": "PENDING",
  "created_at": "2026-03-25T00:35:38.832262Z",
  "updated_at": "2026-03-25T00:35:38.832262Z"
}
```

### 33. GET invitations — Chuck's (freelancer view)

**`GET /invitations?user_id=7ce30117-f275-44e7-a021-4f6191d22ad2&role=freelancer`** → `200`

**Response:**
```json
[
  {
    "id": "933f84b0-bec0-4151-b9d0-554aa47a4033",
    "project_id": "9611fac2-f9aa-4d81-9974-87c7172a8be1",
    "client_id": "11111111-1111-1111-1111-111111111111",
    "freelancer_id": "7ce30117-f275-44e7-a021-4f6191d22ad2",
    "message": "Chuck, we'd love to have you on another project too.",
    "status": "PENDING",
    "created_at": "2026-03-25T00:35:38.832262Z",
    "updated_at": "2026-03-25T00:35:38.832262Z"
  }
]
```

### 34. GET invitations — John's (client view)

**`GET /invitations?user_id=11111111-1111-1111-1111-111111111111&role=client`** → `200`

**Response:**
```json
[
  {
    "id": "933f84b0-bec0-4151-b9d0-554aa47a4033",
    "project_id": "9611fac2-f9aa-4d81-9974-87c7172a8be1",
    "client_id": "11111111-1111-1111-1111-111111111111",
    "freelancer_id": "7ce30117-f275-44e7-a021-4f6191d22ad2",
    "message": "Chuck, we'd love to have you on another project too.",
    "status": "PENDING",
    "created_at": "2026-03-25T00:35:38.832262Z",
    "updated_at": "2026-03-25T00:35:38.832262Z"
  }
]
```

### 35. PATCH invitation — Chuck accepts

**`PATCH /invitations/933f84b0-bec0-4151-b9d0-554aa47a4033/respond?user_id=7ce30117-f275-44e7-a021-4f6191d22ad2`** → `200`

**Request:**
```json
{
  "status": "ACCEPTED"
}
```

**Response:**
```json
{
  "id": "933f84b0-bec0-4151-b9d0-554aa47a4033",
  "project_id": "9611fac2-f9aa-4d81-9974-87c7172a8be1",
  "client_id": "11111111-1111-1111-1111-111111111111",
  "freelancer_id": "7ce30117-f275-44e7-a021-4f6191d22ad2",
  "message": "Chuck, we'd love to have you on another project too.",
  "status": "ACCEPTED",
  "created_at": "2026-03-25T00:35:38.832262Z",
  "updated_at": "2026-03-25T00:35:38.832262Z"
}
```


---

## 15. Reviews

### 36. POST review — John reviews Chuck (5/5)

**`POST /projects/9611fac2-f9aa-4d81-9974-87c7172a8be1/reviews`** → `201`

**Request:**
```json
{
  "author_id": "11111111-1111-1111-1111-111111111111",
  "target_id": "7ce30117-f275-44e7-a021-4f6191d22ad2",
  "score": 5,
  "text": "Chuck delivered before the deadline and the code had no bugs. Literally impossible, yet he did it."
}
```

**Response:**
```json
{
  "id": "4b790acd-e08f-41f3-95b0-a05ce84e2b59",
  "project_id": "9611fac2-f9aa-4d81-9974-87c7172a8be1",
  "author_id": "11111111-1111-1111-1111-111111111111",
  "target_id": "7ce30117-f275-44e7-a021-4f6191d22ad2",
  "score": 5,
  "text": "Chuck delivered before the deadline and the code had no bugs. Literally impossible, yet he did it.",
  "created_at": "2026-03-25T00:35:40.739002Z",
  "updated_at": "2026-03-25T00:35:40.739002Z"
}
```

### 37. GET reviews for Chuck

**`GET /reviews/7ce30117-f275-44e7-a021-4f6191d22ad2`** → `200`

**Response:**
```json
[
  {
    "id": "4b790acd-e08f-41f3-95b0-a05ce84e2b59",
    "project_id": "9611fac2-f9aa-4d81-9974-87c7172a8be1",
    "author_id": "11111111-1111-1111-1111-111111111111",
    "target_id": "7ce30117-f275-44e7-a021-4f6191d22ad2",
    "score": 5,
    "text": "Chuck delivered before the deadline and the code had no bugs. Literally impossible, yet he did it.",
    "created_at": "2026-03-25T00:35:40.739002Z",
    "updated_at": "2026-03-25T00:35:40.739002Z"
  }
]
```

### 38. GET reviews for project

**`GET /projects/9611fac2-f9aa-4d81-9974-87c7172a8be1/reviews`** → `200`

**Response:**
```json
[
  {
    "id": "4b790acd-e08f-41f3-95b0-a05ce84e2b59",
    "project_id": "9611fac2-f9aa-4d81-9974-87c7172a8be1",
    "author_id": "11111111-1111-1111-1111-111111111111",
    "target_id": "7ce30117-f275-44e7-a021-4f6191d22ad2",
    "score": 5,
    "text": "Chuck delivered before the deadline and the code had no bugs. Literally impossible, yet he did it.",
    "created_at": "2026-03-25T00:35:40.739002Z",
    "updated_at": "2026-03-25T00:35:40.739002Z"
  }
]
```

### 39. GET Chuck's profile — rating recalculated

**`GET /profiles/7ce30117-f275-44e7-a021-4f6191d22ad2`** → `200`

**Response:**
```json
{
  "id": "565f7cf4-d9bf-40c0-a091-eef6717113f6",
  "user_id": "7ce30117-f275-44e7-a021-4f6191d22ad2",
  "first_name": "Chuck",
  "last_name": "Norris",
  "avatar_url": null,
  "bio": "Roundhouse kicks bugs out of production.",
  "location": "Texas, USA",
  "is_verified": false,
  "rating": 5.0,
  "review_count": 1,
  "grade": "SENIOR",
  "hourly_rate": 150,
  "total_earned": 0,
  "completed_count": 0,
  "success_rate": 0.0,
  "company_name": null,
  "company_size": null,
  "founded_year": null,
  "website_url": null,
  "position": null,
  "industry": null,
  "created_at": "2026-03-25T00:31:36.409154Z",
  "updated_at": "2026-03-25T00:31:36.409154Z"
}
```


---

## 16. Bookmarks

### 40. POST bookmark — Chuck bookmarks project

**`POST /bookmarks/9611fac2-f9aa-4d81-9974-87c7172a8be1?user_id=7ce30117-f275-44e7-a021-4f6191d22ad2`** → `201`

**Response:**
```json
{
  "user_id": "7ce30117-f275-44e7-a021-4f6191d22ad2",
  "project_id": "9611fac2-f9aa-4d81-9974-87c7172a8be1",
  "created_at": "2026-03-25T00:35:42.447971Z"
}
```

### 41. GET Chuck's bookmarks

**`GET /bookmarks?user_id=7ce30117-f275-44e7-a021-4f6191d22ad2`** → `200`

**Response:**
```json
[
  {
    "id": "9611fac2-f9aa-4d81-9974-87c7172a8be1",
    "user_id": "11111111-1111-1111-1111-111111111111",
    "category_id": "1eb75512-281b-4cc9-851d-114c8e3ba97f",
    "title": "Updated title",
    "description": "We need a senior Python developer to build a FastAPI service.",
    "payment_type": "FIXED",
    "budget": {
      "amount": 3000
    },
    "is_fixed_price": true,
    "required_grade": "SENIOR",
    "deadline": "2026-05-01T00:00:00Z",
    "is_urgent": true,
    "status": "OPEN",
    "bid_count": 1,
    "avg_bid": 2800,
    "created_at": "2026-03-25T00:31:41.903770Z",
    "updated_at": "2026-03-25T00:31:41.903770Z"
  }
]
```

### 42. DELETE bookmark

**`DELETE /bookmarks/9611fac2-f9aa-4d81-9974-87c7172a8be1?user_id=7ce30117-f275-44e7-a021-4f6191d22ad2`** → `204`

### 43. GET bookmarks — verify removed

**`GET /bookmarks?user_id=7ce30117-f275-44e7-a021-4f6191d22ad2`** → `200`

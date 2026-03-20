# Backend Business Logic & Technical Specification
**Проект:** freelancer.md
**Версия:** 1.0.0
**Автор:** Senior System Architect & Product Manager
**Дата:** 20 Март 2026

---

## 1. Архитектура базы данных (ERD Schema)

База данных спроектирована с учетом нормализации и разделения сущностей для поддержки мультиролевой модели (один пользователь может быть и заказчиком, и фрилансером).

### 1.1. Таблица `Users`
Центральная таблица аутентификации и базовых настроек.
* `id` (UUID, PK)
* `email` (String, Unique)
* `phone` (String, Unique, Nullable)
* `password_hash` (String)
* `active_role` (Enum: `CLIENT`, `FREELANCER`) — текущая активная роль в сессии.
* `is_verified` (Boolean) — подтвержден ли email/телефон.
* `created_at`, `updated_at` (Timestamp)

### 1.2. Таблица `Profiles`
Хранит специфичные данные для каждой роли. У одного `user_id` может быть до двух записей (одна для `CLIENT`, одна для `FREELANCER`).
* `id` (UUID, PK)
* `user_id` (UUID, FK -> Users.id)
* `role_type` (Enum: `CLIENT`, `FREELANCER`)
* `first_name`, `last_name` (String)
* `avatar_url` (String)
* `rating` (Decimal 2,1)
* **Freelancer Specific (JSONB или отдельные поля):**
  * `skills` (Array of Strings)
  * `grade` (Enum: `JUNIOR`, `MIDDLE`, `SENIOR`)
  * `hourly_rate` (Decimal)
  * `portfolio` (JSONB: ссылки на работы, картинки)
* **Client Specific:**
  * `company_name` (String, Nullable)
  * `position` (String, Nullable)
  * `industry` (String, Nullable)

### 1.3. Таблица `Projects` (Jobs)
Тендеры и заказы, создаваемые клиентами.
* `id` (UUID, PK)
* `client_profile_id` (UUID, FK -> Profiles.id)
* `title` (String)
* `description` (Text)
* `budget_min`, `budget_max` (Decimal)
* `status` (Enum: `OPEN`, `IN_PROGRESS`, `COMPLETED`, `DISPUTED`, `CANCELLED`)
* `deadline` (Timestamp)
* `created_at`, `updated_at` (Timestamp)

### 1.4. Таблица `Bids`
Скрытые предложения (sealed bids) от фрилансеров.
* `id` (UUID, PK)
* `project_id` (UUID, FK -> Projects.id)
* `freelancer_profile_id` (UUID, FK -> Profiles.id)
* `amount` (Decimal) — предложенная цена.
* `delivery_days` (Integer) — срок выполнения в днях.
* `cover_letter` (Text)
* `status` (Enum: `PENDING`, `ACCEPTED`, `REJECTED`)
* `created_at` (Timestamp)

### 1.5. Таблица `Subscriptions`
Управление подписками пользователей.
* `id` (UUID, PK)
* `user_id` (UUID, FK -> Users.id)
* `plan` (Enum: `FREE`, `PRO`, `PREMIUM`)
* `status` (Enum: `ACTIVE`, `EXPIRED`, `CANCELLED`)
* `expires_at` (Timestamp)
* `bids_used` (Integer) — счетчик использованных откликов в текущем биллинговом цикле.
* `created_at`, `updated_at` (Timestamp)

---

## 2. Бизнес-логика ключевых модулей

### 2.1. Tender Logic (Логика скрытых ставок)
* **Sealed Bids:** Ставки фрилансеров скрыты друг от друга для предотвращения демпинга.
* **Права доступа (Access Control):**
  * *Фрилансер* при запросе `GET /projects/:id/bids` получает только метаданные: `count` (общее количество ставок), `avg_bid` (средняя ставка, доступно только для Premium), и данные своей собственной ставки (если он ее оставлял).
  * *Заказчик* (автор проекта) при запросе `GET /projects/:id/bids` получает `full_data` — полный массив всех ставок с текстами, суммами и профилями фрилансеров.

### 2.2. Role Switcher (Переключение ролей)
* Система использует единый аккаунт (`user_id`).
* В JWT токене зашивается `active_role` (`CLIENT` или `FREELANCER`) и `profile_id` для этой роли.
* При вызове эндпоинта `/auth/role/toggle`:
  1. Бэкенд проверяет наличие профиля для запрашиваемой роли (если нет — создает пустой).
  2. Обновляет поле `active_role` в таблице `Users`.
  3. Генерирует и возвращает новый JWT токен с обновленными claims.
* Все эндпоинты (например, создание проекта) строго проверяют `active_role` из токена.

### 2.3. Subscription Engine
* **Логика расчета комиссии сервиса:**
  * Базовая комиссия (Free): 10% от суммы сделки.
  * PRO ($9.99/мес): 7% от суммы сделки.
  * Premium ($19.99/мес): 5% от суммы сделки.
  * *Комиссия удерживается при выплате (Withdrawal) или при холдировании в Escrow.*
* **Логика лимитов откликов (Bids Limits):**
  * Free: 5 откликов в месяц.
  * PRO: 50 откликов в месяц.
  * Premium: Безлимитно.
  * При создании ставки (`POST /bids`) проверяется `Subscriptions.bids_used < limit`. Если лимит исчерпан, возвращается `403 Payment Required`.
* **Алгоритм ранжирования в поиске (Subscription Weight):**
  * При поиске фрилансеров (`GET /freelancers`) используется формула сортировки: `Score = (Rating * 10) + Subscription_Weight`.
  * Веса: Premium = +50, PRO = +20, Free = 0.
  * Это гарантирует, что Premium пользователи всегда находятся в топе выдачи при прочих равных.
* **Escrow System (Safe Deal):**
  * Принятие ставки (`POST /bids/:id/accept`) переводит проект в статус `IN_PROGRESS` только после успешного резервирования средств (Deposit) со счета клиента.
  * Средства хранятся на транзитном счету платформы.
  * При закрытии проекта (`PATCH /projects/:id/close` со статусом `COMPLETED`), средства за вычетом комиссии автоматически переводятся на баланс фрилансера.
  * При статусе `DISPUTED` средства замораживаются до решения арбитража.

---

## 3. RESTful API Endpoints

### 3.1. Auth & Identity (`/auth`)
| Path | Method | Description | Payload (Body) |
|------|--------|-------------|----------------|
| `/auth/otp/send` | POST | Отправка одноразового кода на email/телефон | `{ "email": "user@ex.com" }` |
| `/auth/otp/verify` | POST | Проверка OTP и выдача JWT | `{ "email": "user@ex.com", "code": "123456" }` |
| `/auth/register` | POST | Регистрация нового пользователя | `{ "email": "...", "password": "...", "role": "FREELANCER" }` |
| `/auth/role/toggle`| POST | Переключение активной роли | `{ "target_role": "CLIENT" }` |

### 3.2. Projects (`/projects`)
| Path | Method | Description | Payload (Body) |
|------|--------|-------------|----------------|
| `/projects` | POST | Создание нового тендера (только CLIENT) | `{ "title": "...", "description": "...", "budget_min": 100, "budget_max": 500, "deadline": "2026-04-01T00:00:00Z" }` |
| `/projects` | GET | Список проектов с фильтрацией | Query: `?skills=react&min_budget=100&status=OPEN` |
| `/projects/:id/close` | PATCH | Завершение проекта (перевод средств) | `{ "status": "COMPLETED", "review_score": 5, "review_text": "..." }` |

### 3.3. Bids (`/bids`)
| Path | Method | Description | Payload (Body) |
|------|--------|-------------|----------------|
| `/bids` | POST | Отправка ставки (только FREELANCER) | `{ "project_id": "uuid", "amount": 450, "delivery_days": 14, "cover_letter": "..." }` |
| `/bids/:id/accept` | POST | Принятие ставки клиентом (инициация Escrow) | `{}` |

### 3.4. Profile (`/profile`)
| Path | Method | Description | Payload (Body) |
|------|--------|-------------|----------------|
| `/profile` | PUT | Обновление данных текущего профиля | `{ "first_name": "...", "skills": ["..."], "hourly_rate": 25 }` |
| `/profile/:id` | GET | Получение публичного профиля | - |
| `/profile/portfolio` | POST | Загрузка элемента портфолио | `multipart/form-data` (file, title, description) |

### 3.5. Payments & Subscriptions (`/payments`)
| Path | Method | Description | Payload (Body) |
|------|--------|-------------|----------------|
| `/payments/subscribe` | POST | Оформление/смена подписки | `{ "plan": "PREMIUM", "payment_method_id": "pm_123" }` |
| `/payments/deposit` | POST | Пополнение баланса (для Escrow) | `{ "amount": 500, "currency": "USD" }` |
| `/payments/withdraw` | POST | Вывод средств фрилансером | `{ "amount": 400, "destination_account": "iban_..." }` |

---

## 4. Безопасность и Валидация

### 4.1. Логика OTP (One-Time Password)
* **Генерация:** 6-значный цифровой код, криптографически стойкий (CSPRNG).
* **Время жизни (TTL):** Код действителен ровно 3 минуты с момента генерации. Хранится в Redis с ключом `otp:{email}` и TTL 180 секунд.
* **Rate Limiting (Количество попыток):**
  * Максимум 3 попытки ввода неверного кода. После 3 неудачных попыток код инвалидируется, ключ удаляется из Redis.
  * Ограничение на запрос нового кода: не чаще 1 раза в 60 секунд (Throttle).
  * Максимум 5 запросов кода на один email/IP в течение 15 минут.

### 4.2. Валидация полей (Data Validation)
* **Логины / Никнеймы:** Строгая валидация регулярным выражением `^[a-zA-Z0-9_]{3,20}$` (только латиница, цифры и подчеркивания, от 3 до 20 символов). Запрет на использование зарезервированных слов (admin, support и т.д.).
* **Форматы сумм (Money):**
  * Все денежные суммы передаются и хранятся в формате `Decimal(10, 2)` на уровне БД.
  * На уровне API валидация: `amount > 0`, максимальное значение ограничено бизнес-логикой (например, $1,000,000).
  * При расчетах комиссий используется банковское округление (Round half to even) для предотвращения потери копеек.
* **Безопасность загрузки файлов (File Uploads):**
  * **MIME-Type Validation:** Проверка не только по расширению, но и по "magic bytes" (сигнатуре файла). Разрешены только `image/jpeg`, `image/png`, `image/webp`, `application/pdf`.
  * **Запрет исполняемых файлов:** Строгий отказ для `.exe`, `.sh`, `.js`, `.php`, `.svg` (SVG может содержать XSS).
  * **Размер:** Максимальный размер файла — 5 MB.
  * **Хранение:** Файлы загружаются в изолированный S3-совместимый бакет. Оригинальное имя файла отбрасывается, генерируется случайный UUID v4 (например, `a1b2c3d4.jpg`).
  * **Доставка:** Файлы раздаются через CDN с заголовками `Content-Security-Policy: default-src 'none'` и `X-Content-Type-Options: nosniff`.

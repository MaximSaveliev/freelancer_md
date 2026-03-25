# AuthController endpoints (technical documentation)

Base route: `v1/api/auth`

Controller: `PL/Controllers/AuthController.cs`

## Overview
This controller exposes endpoints for:
- User login (issues access + refresh tokens)
- User registration
- Token refresh (rotates tokens)
- Email confirmation via a **6-digit code**
- Resending the email confirmation code

> Notes
> - All endpoints in this controller are **public** (no auth required) based on the current code.
> - Responses are JSON.
> - Login/refresh also set cookies (`accessToken`, `refreshToken`).

---

## 1) POST `/v1/api/auth/login`
Authenticate a user and issue tokens.

### Request
**Body** (`application/json`): `LoginUserDTO`
```json
{
  "email": "user@example.com",
  "password": "secret"
}
```

### Response
#### 200 OK
Returns `TokensDTO`:
```json
{
  "accessToken": "<jwt>",
  "refreshToken": "<refresh-token>"
}
```
Also sets cookies:
- `accessToken`
- `refreshToken`

Cookie options (as currently implemented):
- `HttpOnly = false`
- `Secure = true`
- `SameSite = Strict`
- `Expires` based on `JwtSettings` (`AccessTokenExpirationMinutes`, `RefreshTokenExpirationDays`)

#### 401 Unauthorized
- When credentials are invalid (`BadCredentialsException`)
- Body: error message string

#### 500 Internal Server Error
- Unexpected exception
- Body: exception message string

---

## 2) POST `/v1/api/auth/register`
Create a new user account.

### Request
**Body** (`application/json`): `CreateUserDto`
```json
{
  "email": "user@example.com",
  "password": "secret"
}
```

### Response
#### 200 OK
Returns `UserViewDTO`:
```json
{
  "id": 123,
  "email": "user@example.com"
}
```

#### 400 Bad Request
- If user already exists (`UserAlreadyExistsException`)
- Body: error message string

#### 500 Internal Server Error
- Unexpected exception
- Body: `"An unexpected error occurred."`

---

## 3) POST `/v1/api/auth/refresh`
Refresh access/refresh tokens.

### Request
**Body** (`application/json`): `RefreshRequestDto` (optional)
```json
{
  "refreshToken": "<refresh-token>"
}
```

If body is missing or `refreshToken` is null/empty, the controller currently calls:
- `_authContracts.Refresh(refreshToken ?? string.Empty)`

> Important: despite comments in `RefreshRequestDto`, **this controller does not read refresh token from cookies** right now. It only uses the body value (or empty string).

### Response
#### 200 OK
Returns `TokensDTO`:
```json
{
  "accessToken": "<jwt>",
  "refreshToken": "<refresh-token>"
}
```
Also updates cookies `accessToken` and `refreshToken` (same options as login).

#### 401 Unauthorized
- If refresh token is invalid (`InvalidRefreshTokenException`)
- Body: error message string

#### 500 Internal Server Error
- Unexpected exception
- Body: exception message string

---

## 4) POST `/v1/api/auth/confirm-email`
Confirm a user’s email using a **6-digit code**.

### Request
**Body** (`application/json`): `ConfirmEmailDto`
```json
{
  "email": "user@example.com",
  "token": "123456"
}
```

### Response
#### 200 OK
```json
{
  "message": "Email confirmed"
}
```

#### 400 Bad Request
- If confirmation fails (`InvalidEmailConfirmationException`)
- Body: error message string

---

## 5) POST `/v1/api/auth/resend-email-confirmation`
Resend the email confirmation code.

### Request
**Body** (`application/json`): `ResendConfirmationDto`
```json
{
  "email": "user@example.com"
}
```

### Response
#### 200 OK
```json
{
  "message": "If the email exists and is not confirmed, a confirmation was sent."
}
```

This endpoint intentionally returns a generic success message to avoid leaking whether the email exists.

---

## DTOs (data contracts)

### `LoginUserDTO`
- `email: string`
- `password: string`

### `CreateUserDto`
- `email: string`
- `password: string`

### `TokensDTO`
- `accessToken: string`
- `refreshToken: string`

### `RefreshRequestDto`
- `refreshToken?: string` (optional)

### `ConfirmEmailDto`
- `email: string`
- `token: string` (expected format: 6-digit numeric string)

### `ResendConfirmationDto`
- `email: string`

---

## Implementation references
- Controller: `PL/Controllers/AuthController.cs`
- Email confirmation logic: `BLL/Services/EmailConfirmationService.cs`
- Auth contracts: `BLL/Interfaces/IAuthContracts.cs`


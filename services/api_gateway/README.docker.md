# Postgres for api_gateway (docker-compose)

This repo uses Postgres with:
- database: `auth_db`
- user: `auth_admin`
- password: `auth_admin`
- port: `5432`

These match your current connection string:
`Host=localhost;Port=5432;Database=auth_db;Username=auth_admin;Password=auth_admin`

## Start

```powershell
cd D:\Fac\Masterat\DAA\project\freelancer_md\services\api_gateway
docker compose up -d
```

## Stop

```powershell
docker compose down
```

## Reset database (delete all data)

```powershell
docker compose down -v
```

## Notes
- The DB + user are created automatically on the first container start via `POSTGRES_DB/USER/PASSWORD`.
- If you later change credentials, you must either:
  - reset the volume (`down -v`), or
  - do manual SQL changes inside Postgres.


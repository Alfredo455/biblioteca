# Biblioteca

Sistema de préstamos de libros: API REST con autenticación por roles y un frontend web.

**Stack:** NestJS 11 · MongoDB (Mongoose) · JWT · class-validator · Angular 20 (standalone, signals) · Docker · Jest

## Funcionalidades

- Registro y login con JWT; contraseñas con bcrypt.
- Roles `member` y `librarian` aplicados con un guard y un decorador `@Roles`.
- Catálogo con búsqueda por título (la entrada se escapa antes de usarla en regex).
- Préstamos: 14 días de plazo, máximo 3 préstamos activos por usuario, devolución y listado de vencidos (solo bibliotecario).

## Decisiones

- **Stock sin condiciones de carrera:** el préstamo decrementa `available` con un `findOneAndUpdate`
  condicionado a `available > 0`, así dos usuarios no pueden llevarse la última copia a la vez.
- **Lógica de negocio en el servicio**, probada con unit tests sin base de datos (modelos simulados).
- **Versiones fijadas:** `@nestjs/mongoose@11` + `mongoose@8`, porque la v12 es solo ESM y rompe Jest en Nest 11.

## Uso

```bash
# Base de datos + API
echo "JWT_SECRET=$(openssl rand -hex 32)" > .env
docker compose up --build

# Frontend
cd web && npm install && npm start      # http://localhost:4200

# Tests
cd api && npm test
```

## Endpoints

| Método | Ruta | Rol |
|---|---|---|
| POST | `/auth/register`, `/auth/login` | público |
| GET | `/books?q=` | autenticado |
| POST | `/books` | librarian |
| POST | `/loans/borrow/:bookId` | autenticado |
| POST | `/loans/:id/return` | autenticado |
| GET | `/loans/mine` | autenticado |
| GET | `/loans/overdue` | librarian |

## Pendiente

- Endpoint para promover usuarios a bibliotecario (hoy se cambia el rol en la base).
- Tests e2e con `mongodb-memory-server` y tests de componentes en Angular.

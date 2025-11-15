# 🚀 Quick Start Guide - Testing & Development

Esta guía te ayudará a configurar y probar el proyecto rápidamente.

## 📋 Prerrequisitos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** v22 o superior
- **Yarn** (package manager)
- **PostgreSQL** (base de datos)
- **Redis** (cache)
- **Postman** o similar (para testing)

### Opción rápida con Docker Compose

Si tienes Docker instalado, puedes levantar PostgreSQL y Redis fácilmente:

```bash
# Crear archivo docker-compose.yml si no existe
docker-compose up -d postgres redis
```

## 🔧 Instalación

1. **Clonar el repositorio** (si aún no lo tienes)
   ```bash
   git clone https://github.com/cucchi10/CouponManager.git
   cd CouponManager
   ```

2. **Instalar dependencias**
   ```bash
   yarn install
   # o
   npm install
   ```

## ⚙️ Configuración de Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# ============================================
# APPLICATION CONFIGURATION
# ============================================
NODE_ENV=development
SCOPE=development
PORT=8080
LOG_LEVEL=info

# ============================================
# JWT CONFIGURATION
# ============================================
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
JWT_TTL_SEC=3600

# ============================================
# CACHE (Redis) CONFIGURATION
# ============================================
CACHE_HOST=localhost
CACHE_PORT=6379
CACHE_PASSWORD=

# ============================================
# DATABASE CONFIGURATION
# ============================================
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_NAME=coupon_db
DB_PASSWORD=postgres

# ============================================
# APPLICATION SECRETS (API Keys)
# ============================================
API_KEY=test-api-key-12345-change-in-production
TOKEN_COMPARE_SECRET=your-token-compare-secret-min-32-chars
MONITORING_TOKEN=test-monitoring-token-12345-change-in-production

# ============================================
# CACHE NAMESPACES
# ============================================
CACHE_NAMESPACE_DEDUP=dedup
CACHE_NAMESPACE_JWT_BLACKLIST=jwt:blacklist
CACHE_NAMESPACE_JWT_ACTIVE=jwt:active
CACHE_NAMESPACE_CURSOR=cursor
CACHE_NAMESPACE_LOCKS=locks

# ============================================
# CACHE TTLs (segundos)
# ============================================
CACHE_DEDUP_TTL_SEC=300
CACHE_JWT_BLACKLIST_TTL_SEC=3600
CACHE_CURSOR_TTL_SEC=3600

# ============================================
# PAGINATION
# ============================================
PAGINATION_CURSOR_TTL_SEC=3600
PAGINATION_MAX_LIMIT=100
```

### 🔑 Valores Importantes para Testing

- **API_KEY**: `test-api-key-12345-change-in-production` (para endpoints administrativos)
- **MONITORING_TOKEN**: `test-monitoring-token-12345-change-in-production` (para health checks)
- **JWT_SECRET**: Cualquier string de al menos 32 caracteres
- **TOKEN_COMPARE_SECRET**: Cualquier string de al menos 32 caracteres

## 🗄️ Configuración de Base de Datos

1. **Crear la base de datos PostgreSQL**
   ```sql
   CREATE DATABASE coupon_db;
   ```

2. **Las migraciones se ejecutarán automáticamente** al iniciar la aplicación (si están configuradas)

## 🚀 Levantar el Proyecto

1. **Asegúrate de que PostgreSQL y Redis estén corriendo**

2. **Iniciar en modo desarrollo**
   ```bash
   yarn start:dev
   # o
   npm run start:dev
   ```

3. **Verificar que el servidor esté corriendo**
   - Deberías ver: `Server is up and running on port 8080 in development scope`
   - Swagger UI disponible en: `http://localhost:8080/api/docs`

## 🔐 Autenticación

### 1. Login (JWT Token)

El endpoint de login genera un JWT token que se usa para autenticar las peticiones de usuario.

**Endpoint:** `POST /api/auth/login`

**Credenciales por defecto (MOCK):**
- Username: `demo`
- Password: `demo123`

**Request (Postman):**
```
POST http://localhost:8080/api/auth/login
Content-Type: application/json

{
  "username": "demo",
  "password": "demo123"
}
```

**Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "code": "OK",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer"
  },
  "message": "Request successful",
  "path": "/api/auth/login",
  "method": "POST",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "correlationId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Uso del token:**
Copia el `accessToken` y úsalo en el header `Authorization`:
```
Authorization: Bearer <accessToken>
```

### 2. API Key (Endpoints Administrativos)

Los endpoints de **Coupon Books** requieren API Key en el header `x-api-key`.

**Header requerido:**
```
x-api-key: test-api-key-12345-change-in-production
```

### 3. Monitoring Token (Health Checks)

El endpoint de health check requiere un token de monitoreo.

**Header requerido:**
```
x-monitoring-token: test-monitoring-token-12345-change-in-production
```

## 📮 Testing con Postman

### Configuración Inicial

1. **Crear un Environment en Postman:**
   - `base_url`: `http://localhost:8080`
   - `jwt_token`: (se llenará después del login)
   - `api_key`: `test-api-key-12345-change-in-production`
   - `monitoring_token`: `test-monitoring-token-12345-change-in-production`

2. **Crear una Collection** con las siguientes carpetas:
   - Auth
   - Health
   - Coupon Books (Admin)
   - Coupons (User)

### Endpoints Disponibles

#### 🔐 Auth Endpoints

**1. Login**
```
POST {{base_url}}/api/auth/login
Content-Type: application/json

{
  "username": "demo",
  "password": "demo123"
}
```
- Guarda el `accessToken` en la variable `jwt_token` del environment

#### 🏥 Health Endpoints

**2. Health Check**
```
GET {{base_url}}/api/client/health
x-monitoring-token: {{monitoring_token}}
```

#### 📚 Coupon Books (Admin - Requiere API Key)

**3. Crear Coupon Book**
```
POST {{base_url}}/api/coupon-books
x-api-key: {{api_key}}
Content-Type: application/json

{
  "name": "Summer Sale 2025",
  "description": "Summer promotion coupons",
  "codePattern": "SUMMER{XXXX}",
  "maxCodes": 10000,
  "maxRedemptionsPerUser": 1,
  "validFrom": "2025-01-01T00:00:00Z",
  "validUntil": "2025-12-31T23:59:59Z"
}
```

**Notas:**
- No se permite crear una cuponera con el mismo `name` y `description` que una existente. Retorna error `409 Conflict` en ese caso.
- `maxCodes` es requerido si se proporciona `codePattern` (máximo de códigos que se pueden generar)
- Para cuponeras sin `codePattern` (subida manual), `maxCodes` puede ser `null` (ilimitado)

**4. Listar Coupon Books (Paginado)**
```
GET {{base_url}}/api/coupon-books?page=1&limit=20
x-api-key: {{api_key}}
```

**Query Parameters:**
- `page` (opcional): Número de página, default: 1
- `limit` (opcional): Items por página, default: 20, máximo: 100

**Respuesta:** Retorna lista paginada con solo `id`, `name`, `isActive` para cada cuponera.

**5. Obtener Coupon Book por ID**
```
GET {{base_url}}/api/coupon-books/{bookId}
x-api-key: {{api_key}}
```

**6. Listar Cupones de una Cuponera (Paginado)**
```
GET {{base_url}}/api/coupon-books/{bookId}/coupons?page=1&limit=20
x-api-key: {{api_key}}
```

**Query Parameters:**
- `page` (opcional): Número de página, default: 1
- `limit` (opcional): Items por página, default: 20, máximo: 100

**Respuesta:** Retorna lista paginada con `code` y `status` de cada cupón. Los cupones están ordenados por fecha de creación (más recientes primero).

**7. Subir Códigos Personalizados**
```
POST {{base_url}}/api/coupon-books/{bookId}/codes
x-api-key: {{api_key}}
Content-Type: application/json

{
  "codes": ["SUMMER1234", "SUMMER5678", "SUMMER9012"]
}
```

**Notas:**
- **Optimizado para rendimiento**: Usa batch inserts de 5,000 códigos por query con `unnest` de PostgreSQL
- Los códigos duplicados se ignoran automáticamente sin abortar la transacción
- Para 10,000 códigos: ~2-5 segundos
- Retorna error `409 Conflict` si la cuponera está desactivada

**8. Generar Códigos Automáticamente**
```
POST {{base_url}}/api/coupon-books/{bookId}/codes/generate
x-api-key: {{api_key}}
Content-Type: application/json

{
  "count": 100
}
```

**Notas:**
- El `codePattern` se toma de la configuración de la cuponera
- La respuesta incluye `totalCodes` (cantidad real) y `maxCodes` (máximo permitido)
- **Optimizado para rendimiento**: Usa batch inserts de 5,000 códigos por query
- Para 10,000 códigos: ~2-5 segundos
- Para 100,000 códigos: ~20-30 segundos
- Retorna error `409 Conflict` si la cuponera está desactivada

**9. Desactivar Coupon Book**
```
DELETE {{base_url}}/api/coupon-books/{bookId}
x-api-key: {{api_key}}
```

**Nota:** Retorna error `409 Conflict` si la cuponera ya está desactivada.

#### 🎟️ Coupons

**10. Asignar Cupón Aleatorio (Requiere API Key)**
```
POST {{base_url}}/api/coupons/assign/random
x-api-key: {{api_key}}
Content-Type: application/json

{
  "couponBookId": "<book-id-uuid>",
  "userId": "<user-id>"
}
```

**Nota:** Este endpoint requiere API key en lugar de JWT. Se usa para asignaciones administrativas o desde servicios externos.

**11. Asignar Cupón Específico (Requiere JWT)**
```
POST {{base_url}}/api/coupons/assign/{code}
Authorization: Bearer {{jwt_token}}
```

**Nota:** El userId se extrae automáticamente del token JWT. No requiere body.

**12. Bloquear Cupón Temporalmente**
```
POST {{base_url}}/api/coupons/{code}/lock
Authorization: Bearer {{jwt_token}}
Content-Type: application/json

{
  "lockDurationSeconds": 300
}
```

**Nota:** El userId se extrae automáticamente del token JWT. El campo `lockDurationSeconds` es opcional (default: 300 segundos).

**13. Desbloquear Cupón**
```
POST {{base_url}}/api/coupons/{code}/unlock
Authorization: Bearer {{jwt_token}}
```

**Nota:** No requiere body. El userId se extrae automáticamente del token JWT.

**14. Redimir Cupón**
```
POST {{base_url}}/api/coupons/{code}/redeem
Authorization: Bearer {{jwt_token}}
Content-Type: application/json

{
  "metadata": {
    "orderId": "order-123",
    "purchaseAmount": 100.5
  }
}
```

**Nota:** El userId se extrae automáticamente del token JWT. El campo `metadata` es opcional.

**15. Obtener Estado del Cupón**
```
GET {{base_url}}/api/coupons/{code}/status
Authorization: Bearer {{jwt_token}}
```

**16. Obtener Mis Cupones**
```
GET {{base_url}}/api/coupons/my-coupons
Authorization: Bearer {{jwt_token}}
```

## 📖 Swagger Documentation

Una vez que el servidor esté corriendo, puedes acceder a la documentación interactiva de Swagger:

**URL:** `http://localhost:8080/api/docs`

Desde Swagger puedes:
- Ver todos los endpoints disponibles
- Probar los endpoints directamente desde el navegador
- Ver los schemas de request/response
- Autenticarte con el botón "Authorize" usando:
  - **JWT**: `Bearer <token>` (después de hacer login)
  - **API Key**: `test-api-key-12345-change-in-production`
  - **Monitoring Token**: `test-monitoring-token-12345-change-in-production`

## 🔄 Flujo de Testing Recomendado

1. **Health Check** → Verificar que el servidor esté funcionando
2. **Login** → Obtener JWT token
3. **Crear Coupon Book** (Admin con API Key) → Crear un book de prueba
4. **Generar Códigos** (Admin con API Key) → Generar algunos cupones
5. **Asignar Cupón Aleatorio** (Admin con API Key) → Asignar un cupón aleatorio a un usuario
6. **Asignar Cupón Específico** (User con JWT) → Asignar un cupón específico al usuario autenticado
7. **Redimir Cupón** (User con JWT) → Redimir el cupón asignado
8. **Ver Mis Cupones** (User con JWT) → Verificar el estado

## ⚠️ Troubleshooting

### Error: "API key is required"
- Verifica que el header `x-api-key` esté presente
- Verifica que el valor coincida con `API_KEY` en tu `.env`

### Error: "Invalid credentials"
- Usa las credenciales por defecto: `demo` / `demo123`
- Verifica que el endpoint sea `POST /api/auth/login`

### Error: "Invalid or expired token"
- El token JWT expiró (por defecto dura 1 hora)
- Haz login nuevamente para obtener un nuevo token

### Error: Connection refused (PostgreSQL/Redis)
- Verifica que PostgreSQL y Redis estén corriendo
- Verifica los valores de `DB_HOST`, `DB_PORT`, `CACHE_HOST`, `CACHE_PORT` en tu `.env`

### Error: Database connection failed
- Verifica que la base de datos `coupon_db` exista
- Verifica las credenciales de PostgreSQL en tu `.env`

## 📝 Notas Importantes

- **Este es un proyecto MOCK**: Las credenciales de login son hardcodeadas (`demo`/`demo123`)
- **API Keys por defecto**: Los valores en el `.env` de ejemplo son solo para desarrollo
- **Producción**: Cambia TODOS los secrets antes de desplegar a producción
- **Swagger**: Usa Swagger UI para explorar y probar los endpoints fácilmente

## 🆘 Soporte

Si tienes problemas:
1. Revisa los logs del servidor
2. Verifica que todas las variables de entorno estén configuradas
3. Verifica que PostgreSQL y Redis estén corriendo
4. Revisa la documentación completa en `README.md`

---

**¡Listo para testear! 🎉**


# Postman Collection - Coupon Flow

Esta colección contiene un flujo completo para probar el sistema de cupones.

## 📋 Requisitos Previos

1. **Postman instalado** (versión 9.0 o superior)
2. **Servidor corriendo** en `http://localhost:8080`
3. **API Key configurada** (por defecto: `test-api-key-12345-change-in-production`)

## 🚀 Configuración Inicial

### 1. Importar la Colección y el Environment

1. Abre Postman
2. Click en **Import** (botón superior izquierdo)
3. Selecciona los archivos:
   - `Coupon_Flow.postman_collection.json`
   - `Coupon_Flow.postman_environment.json`
4. Selecciona el environment **Coupon Flow Environment** en el dropdown superior derecho

### 2. Verificar Variables de la Colección

Las siguientes variables se guardan automáticamente en la colección:

- `base_url`: `http://localhost:8080` (predefinida)
- `api_key`: `test-api-key-12345-change-in-production` (predefinida)
- `jwt_token`: (se llenará automáticamente después del login)
- `book_id`: (se llenará automáticamente después de crear el book)
- `coupon_code`: (se llenará automáticamente después de asignar el cupón)

**Nota:** Las variables se guardan en `collection variables`, no en el environment. Puedes verlas y editarlas haciendo click derecho en la colección → **Edit** → pestaña **Variables**.

## 📝 Flujo de Ejecución

La colección está ordenada para ejecutarse secuencialmente:

### 1. Login
- **Método**: POST
- **Endpoint**: `/api/auth/login`
- **Autenticación**: Ninguna
- **Body**: Credenciales por defecto (`demo`/`demo123`)
- **Resultado**: Guarda el `jwt_token` automáticamente

### 2. Create Coupon Book
- **Método**: POST
- **Endpoint**: `/api/coupon-books`
- **Autenticación**: API Key (`x-api-key` header)
- **Body**: Crea un book con patrón `TEST{XXXX}`
- **Resultado**: Guarda el `book_id` automáticamente

### 3. Generate Codes
- **Método**: POST
- **Endpoint**: `/api/coupon-books/:bookId/codes/generate`
- **Autenticación**: API Key
- **Body**: Genera 100 códigos
- **Resultado**: Códigos generados en el book

### 4. Assign Random Coupon
- **Método**: POST
- **Endpoint**: `/api/coupons/assign/random`
- **Autenticación**: API Key
- **Body**: Asigna un cupón aleatorio al usuario `demo`
- **Resultado**: Guarda el `coupon_code` automáticamente

### 5. Get Coupon Status
- **Método**: GET
- **Endpoint**: `/api/coupons/:code/status`
- **Autenticación**: JWT Bearer Token
- **Body**: Ninguno
- **Resultado**: Muestra el estado y detalles del cupón asignado

### 6. Lock Coupon
- **Método**: POST
- **Endpoint**: `/api/coupons/:code/lock`
- **Autenticación**: JWT Bearer Token
- **Body**: Bloquea el cupón por 300 segundos (5 minutos)
- **Resultado**: Cupón bloqueado temporalmente

### 7. Redeem Coupon
- **Método**: POST
- **Endpoint**: `/api/coupons/:code/redeem`
- **Autenticación**: JWT Bearer Token
- **Body**: Redime el cupón con metadata opcional
- **Resultado**: Cupón redimido permanentemente

## 🎯 Ejecución Automática

Puedes ejecutar toda la colección de una vez:

1. Click derecho en la colección **Coupon Flow - Complete Workflow**
2. Selecciona **Run collection**
3. Verifica que el environment correcto esté seleccionado
4. Click en **Run**

## 🔍 Verificación de Resultados

Después de ejecutar cada request, verifica:

- **Login**: Debe retornar `200 OK` con `accessToken` en la respuesta (guarda `jwt_token` en collection variables)
- **Create Book**: Debe retornar `201 Created` con `id` del book (guarda `book_id` en collection variables)
- **Generate Codes**: Debe retornar `201 Created` con estadísticas de códigos generados
- **Assign Coupon**: Debe retornar `200 OK` con `couponCode` asignado (guarda `coupon_code` en collection variables)
- **Get Coupon Status**: Debe retornar `200 OK` con detalles del cupón (status, isAssignedToUser, expiresAt, etc.)
- **Lock Coupon**: Debe retornar `200 OK` con `locked: true` y `lockExpiresAt`
- **Redeem Coupon**: Debe retornar `200 OK` con `redeemedAt` y `redemptionCount`

## ⚠️ Notas Importantes

- El flujo asume que ejecutas los requests en orden
- Las variables se guardan automáticamente usando scripts de Postman
- Si un request falla, los siguientes pueden fallar también (dependen de variables anteriores)
- El usuario por defecto es `demo` (debe coincidir con el del login)

## 🐛 Troubleshooting

### Error 401 Unauthorized
- Verifica que el `jwt_token` se haya guardado correctamente después del login
- Verifica que el token no haya expirado

### Error 403 Forbidden
- Verifica que el `api_key` sea correcto
- Verifica que el header `x-api-key` esté presente en los requests administrativos

### Error 404 Not Found
- Verifica que el `book_id` se haya guardado correctamente
- Verifica que el `coupon_code` se haya guardado correctamente

### Variables no se guardan
- Verifica que los scripts de test estén habilitados en Postman
- Verifica la consola de Postman (View → Show Postman Console) para ver los logs
- Las variables se guardan en **collection variables**, no en el environment. Verifícalas haciendo click derecho en la colección → **Edit** → pestaña **Variables**


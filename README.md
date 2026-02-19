# Auto Repuestos - Plataforma de Venta de Repuestos de Vehículos

Plataforma completa de e-commerce para venta de repuestos de vehículos. Incluye catálogo de productos filtrable por marca/modelo/categoría, carrito de compras, facturación con cálculo de IVA (12%), panel de administración y notificaciones de compra por correo.

## Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│                     Docker Compose                       │
│                                                          │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐  │
│  │  Frontend   │    │   Backend   │    │  PostgreSQL │  │
│  │  Angular 16 │───▶│ Spring Boot │───▶│     15      │  │
│  │  + nginx    │    │    3.2      │    │             │  │
│  │  port: 4200 │    │  port: 8080 │    │  port: 5433 │  │
│  └─────────────┘    └─────────────┘    └─────────────┘  │
│         │                  │                             │
│         └──── uploads_data (volumen compartido) ─────────┘
└─────────────────────────────────────────────────────────┘
```

- **Frontend**: Angular 16 + Angular Material, servido por nginx. Hace proxy de `/api/` al backend (sin CORS).
- **Backend**: Spring Boot 3.2, Spring Security (JWT stateless), Spring Data JPA, Spring Mail.
- **Base de datos**: PostgreSQL 15 con toda la lógica de negocio en stored procedures (funciones PL/pgSQL).
- **Imágenes**: Subidas vía `POST /api/upload` al backend, guardadas en volumen Docker compartido, servidas por nginx en `/uploads/`.

## Requisitos previos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (versión 24+)
- [Docker Compose](https://docs.docker.com/compose/) (incluido en Docker Desktop)
- Git

No se necesita Java, Node.js ni Maven instalados localmente — todo corre dentro de los contenedores.

## Instalación y arranque rápido

### 1. Clonar el repositorio

```bash
git clone https://github.com/santiago128/auto-repuestos.git
cd auto-repuestos
```

### 2. Configurar variables de entorno

Crea el archivo `.env` en la raíz del proyecto (junto a `docker-compose.yml`):

```env
# Configuración SMTP para envío de emails de confirmación de compra
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=tu_correo@gmail.com
MAIL_PASSWORD=tu_app_password_gmail
MAIL_FROM=tu_correo@gmail.com
```

> **Nota**: Si no configuras el email, la plataforma funciona igual — solo no enviará correos. Los errores de email son silenciosos (no rompen el flujo de compra).

> **Gmail**: Para usar Gmail necesitas activar [App Passwords](https://myaccount.google.com/apppasswords) (requiere 2FA activo).

### 3. Levantar los contenedores

```bash
docker-compose up --build
```

La primera vez tarda ~3-5 minutos (descarga imágenes base y compila el proyecto). Las siguientes veces es mucho más rápido gracias al caché de Docker.

Cuando veas esto, todo está listo:

```
repuestos-backend  | Started AutoRepuestosApplication in X seconds
```

### 4. Acceder a la plataforma

| Servicio       | URL                         |
|----------------|-----------------------------|
| Frontend       | http://localhost:4200        |
| API Backend    | http://localhost:8080/api    |
| PostgreSQL     | localhost:5433               |

## Credenciales por defecto

### Administrador
| Campo    | Valor                   |
|----------|-------------------------|
| Email    | admin@repuestos.com     |
| Password | Admin123!               |

### Base de datos (DBeaver / pgAdmin)
| Campo      | Valor          |
|------------|----------------|
| Host       | localhost      |
| Puerto     | **5433**       |
| Base datos | repuestos_db   |
| Usuario    | repuestos_user |
| Password   | repuestos_pass |

> ⚠️ El puerto es **5433** (no 5432) para evitar conflicto con PostgreSQL local.

## Estructura del proyecto

```
auto-repuestos/
├── docker-compose.yml          # Orquestación de los 3 servicios
├── .env                        # Variables de entorno (NO subir al repo)
│
├── postgres/
│   └── init/
│       ├── 01_schema.sql       # Tablas, secuencias, datos demo
│       └── 02_procedures.sql   # Stored procedures (toda la lógica)
│
├── backend/                    # Spring Boot 3.2
│   ├── Dockerfile              # Multi-stage: Maven build → JRE Alpine
│   ├── pom.xml
│   └── src/main/java/com/repuestos/
│       ├── config/
│       │   ├── SecurityConfig.java       # Spring Security + JWT
│       │   ├── JwtUtil.java              # Generación/validación tokens
│       │   ├── JwtFilter.java            # Filtro HTTP JWT
│       │   ├── CustomUserDetailsService.java
│       │   ├── AsyncConfig.java          # ObjectMapper + @EnableAsync
│       │   └── GlobalExceptionHandler.java
│       ├── controller/
│       │   ├── AuthController.java       # POST /api/auth/login|register
│       │   ├── RepuestoController.java   # CRUD /api/repuestos
│       │   ├── MarcaController.java      # GET|POST|PUT /api/marcas
│       │   ├── ModeloController.java     # GET|POST /api/modelos
│       │   ├── CategoriaController.java  # GET /api/categorias
│       │   ├── FacturaController.java    # POST /api/facturas
│       │   └── UploadController.java     # POST /api/upload
│       ├── service/
│       │   ├── AuthService.java
│       │   ├── RepuestoService.java      # Llama stored procedures
│       │   ├── MarcaService.java
│       │   ├── ModeloService.java
│       │   ├── CategoriaService.java
│       │   ├── FacturaService.java       # Crea factura + envía email
│       │   └── EmailService.java         # @Async HTML email
│       ├── model/                        # Entidades JPA
│       ├── repository/                   # Spring Data JPA repositories
│       └── dto/                          # Request/Response DTOs
│
└── frontend/                   # Angular 16 + Angular Material
    ├── Dockerfile              # Multi-stage: Node build → nginx Alpine
    ├── nginx.conf              # Proxy /api/ → backend, sirve /uploads/
    └── src/app/
        ├── components/
        │   ├── navbar/         # Barra navegación con contador carrito
        │   ├── home/           # Hero + productos destacados
        │   ├── catalogo/       # Catálogo con filtros (marca/modelo/cat/nombre)
        │   ├── detalle-repuesto/
        │   ├── carrito/        # Carrito con +/- cantidad
        │   ├── checkout/       # Confirmación pedido
        │   ├── login/
        │   ├── register/
        │   ├── mis-facturas/   # Historial de compras
        │   └── admin/          # Panel admin (repuestos, marcas, modelos)
        ├── services/
        │   ├── auth.service.ts
        │   ├── repuesto.service.ts  # Incluye uploadImagen()
        │   ├── carrito.service.ts   # Estado persistido en localStorage
        │   └── factura.service.ts
        ├── guards/             # AuthGuard, AdminGuard
        ├── interceptors/       # JWT interceptor
        └── models/             # Interfaces TypeScript
```

## Stored Procedures (lógica de negocio)

Toda la lógica de negocio vive en `postgres/init/02_procedures.sql`:

| Función                     | Descripción                                              |
|-----------------------------|----------------------------------------------------------|
| `sp_registrar_repuesto`     | Valida marca/modelo, inserta con código único            |
| `sp_modificar_repuesto`     | Actualiza repuesto, valida existencia                    |
| `sp_eliminar_repuesto`      | Eliminación lógica (`activo = FALSE`)                    |
| `sp_crear_factura`          | Valida stock, calcula IVA 12%, genera `FAC-YYYYMMDD-XXXXXX`, descuenta stock |
| `sp_registrar_usuario`      | Verifica email único, inserta con rol CLIENTE            |
| `sp_registrar_marca`        | Inserta marca con país de origen                         |
| `sp_modificar_marca`        | Actualiza marca                                          |
| `sp_registrar_modelo`       | Valida marca, inserta modelo con rango de años           |
| `sp_obtener_facturas_usuario` | Historial de facturas de un usuario                   |

## API REST

### Autenticación
```
POST /api/auth/login      Body: { email, password }  → { token, rol, nombre, ... }
POST /api/auth/register   Body: { nombre, apellido, email, password, ... }
```

### Repuestos (público para GET)
```
GET  /api/repuestos?nombre=&marcaId=&modeloId=&categoriaId=
GET  /api/repuestos/{id}
POST /api/repuestos        [ADMIN] Body: RepuestoRequest
PUT  /api/repuestos/{id}   [ADMIN]
DEL  /api/repuestos/{id}   [ADMIN]
```

### Upload de imágenes
```
POST /api/upload           [ADMIN] Form-data: file (image/*)  → { url: "/uploads/uuid.ext" }
```

### Catálogos (público)
```
GET /api/marcas
GET /api/modelos?marcaId=
GET /api/categorias
```

### Facturas (autenticado)
```
POST /api/facturas         Body: { direccionEnvio, observaciones, items: [{repuestoId, cantidad}] }
GET  /api/facturas/mis-facturas
GET  /api/facturas/{id}
```

## Datos demo incluidos

Al iniciar por primera vez, la base de datos se carga con:
- **8 marcas**: Toyota, Hyundai, Chevrolet, Ford, Nissan, Honda, Volkswagen, Mazda
- **8 categorías**: Frenos, Motor, Suspensión, Eléctrico, Transmisión, Carrocería, Filtros, Lubricantes
- **Modelos** por cada marca
- **8 repuestos** de ejemplo con stock y precio

## Comandos útiles

```bash
# Levantar en background
docker-compose up -d

# Ver logs del backend
docker logs repuestos-backend -f

# Reconstruir solo el backend (después de cambios en Java)
docker-compose up --build -d backend

# Reconstruir solo el frontend (después de cambios en Angular)
docker-compose up --build -d frontend

# Detener todo
docker-compose down

# Detener y borrar volúmenes (resetea la BD y las imágenes subidas)
docker-compose down -v

# Acceder a la BD desde la terminal
docker exec -it repuestos-db psql -U repuestos_user -d repuestos_db
```

## Tecnologías

| Capa        | Tecnología                                    |
|-------------|-----------------------------------------------|
| Frontend    | Angular 16, Angular Material, TypeScript      |
| Backend     | Spring Boot 3.2, Spring Security, JJWT 0.12.3 |
| Base datos  | PostgreSQL 15, PL/pgSQL                       |
| ORM         | Spring Data JPA, Hibernate 6                  |
| Email       | Spring Mail (async)                           |
| Contenedores| Docker, Docker Compose                        |
| Servidor    | nginx (reverse proxy + static files)          |

## Solución de problemas comunes

**Puerto 5432 en uso**: El proyecto usa el puerto **5433** en el host. Si también tienes conflicto, cambia en `docker-compose.yml`:
```yaml
ports:
  - "5434:5432"   # cambia 5433 por otro puerto libre
```
Y actualiza `SPRING_DATASOURCE_URL` si accedes localmente.

**Error al enviar email**: Revisa las variables `MAIL_*` en el `.env`. Si usas Gmail, asegúrate de tener una App Password (no la contraseña normal).

**Frontend no carga**: Espera que el backend esté `healthy` antes de que nginx intente el proxy. Si hay error 502, ejecuta `docker-compose restart frontend`.

**Reconstruir desde cero**:
```bash
docker-compose down -v
docker-compose up --build
```

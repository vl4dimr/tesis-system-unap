# Sistema de Gestion de Tesis UNAP

Sistema web para gestionar y formatear tesis de pregrado segun la Guia UNAP 2.0.

## Caracteristicas

- Registro de datos de tesis (titulo, jurados, palabras clave)
- Carga de documentos Word (.docx)
- Validacion automatica de formato
- Formateo automatico segun Guia UNAP 2.0
- Descarga del documento formateado

## Tecnologias

- **Frontend**: Next.js 14 (App Router)
- **Backend**: Next.js API Routes + Python (FastAPI)
- **Base de Datos**: PostgreSQL
- **Cache**: Redis
- **Almacenamiento**: MinIO
- **Contenedores**: Docker Compose

## Requisitos

- Docker y Docker Compose
- Node.js 20+ (para desarrollo local)
- Python 3.12+ (para desarrollo local)

## Instalacion

### Con Docker (recomendado)

1. Clonar el repositorio:
```bash
git clone <repo-url>
cd tesis-system
```

2. Copiar archivo de variables de entorno:
```bash
cp .env.example .env
```

3. Modificar las variables en `.env` segun sea necesario.

4. Iniciar los servicios:
```bash
docker-compose up -d
```

5. Ejecutar migraciones y seed:
```bash
docker-compose exec frontend npx prisma migrate dev
docker-compose exec frontend npx prisma db seed
```

6. Acceder a la aplicacion:
- Frontend: http://localhost:3000
- Document Service: http://localhost:8000
- MinIO Console: http://localhost:9001

### Desarrollo Local

#### Frontend (Next.js)

```bash
cd frontend
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

#### Document Service (Python)

```bash
cd document-service
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Usuarios de Prueba

Despues de ejecutar el seed:

| Email | Password | Tipo |
|-------|----------|------|
| admin@unap.edu.pe | admin123 | Admin |
| tesista@unap.edu.pe | test123 | Tesista |

## Estructura del Proyecto

```
tesis-system/
├── docker-compose.yml
├── .env.example
├── frontend/                    # Next.js App
│   ├── app/
│   │   ├── (auth)/             # Login/Register
│   │   ├── (dashboard)/        # Rutas protegidas
│   │   └── api/                # API Routes
│   ├── components/
│   ├── lib/
│   └── prisma/
├── document-service/            # Python Service
│   ├── app/
│   │   ├── validators/         # Validacion de formato
│   │   └── formatters/         # Aplicacion de formato
│   └── requirements.txt
└── docs/
```

## API Endpoints

### Frontend (Next.js)

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| POST | /api/auth/register | Registro de usuario |
| POST | /api/auth/[...nextauth] | Login |
| GET | /api/tesis | Listar tesis del usuario |
| POST | /api/tesis | Crear nueva tesis |
| GET | /api/tesis/[id] | Obtener tesis |
| PUT | /api/tesis/[id] | Actualizar tesis |
| POST | /api/upload/[tesisId] | Subir documento |
| POST | /api/validar/[tesisId] | Validar documento |
| GET | /api/validar/[tesisId] | Obtener resultados |
| POST | /api/formatear/[tesisId] | Formatear documento |
| GET | /api/descargar/[tesisId] | Descargar documento |

### Document Service (Python)

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| POST | /validar | Validar documento |
| POST | /formatear | Formatear documento |
| GET | /config | Configuracion de formato |
| GET | /health | Health check |

## Requisitos de Formato (Guia UNAP 2.0)

- **Pagina**: A4 (21 x 29.7 cm)
- **Margenes**: 3.5/2.5/2.5/2.5 cm (sup/inf/izq/der)
- **Fuente**: Times New Roman 12pt
- **Interlineado**: Doble (2.0)
- **Sangria**: 1.25 cm primera linea

Ver [docs/guia-formato.md](docs/guia-formato.md) para mas detalles.

## Licencia

MIT

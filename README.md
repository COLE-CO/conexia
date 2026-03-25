# Conexia - LegalTech & Wealth Management Platform

![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=flat&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=flat&logo=fastapi)
![React](https://img.shields.io/badge/React-18.0-61DAFB?style=flat&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=flat&logo=postgresql&logoColor=white)

## Descripción del Proyecto

**Conexia** es una plataforma corporativa interna (B2B) desarrollada para una firma de abogados y consultoría. Su propósito es centralizar, digitalizar y asegurar la gestión financiera y documental que tradicionalmente se manejaba de forma dispersa en hojas de cálculo y almacenamiento local.

### Verticales de Negocio
- **Cole&Co:** Operaciones y contabilidad interna de la firma.
- **Family Office:** Gestión de patrimonios, empresas clientes y trazabilidad de sus estados financieros.

## Funcionalidades Principales

- **Seguridad B2B:** Sistema cerrado sin registro público. Creación de usuarios exclusiva por Administradores.
- **Autorización Restrictiva:** Autenticación vía JWT y Control de Acceso Basado en Roles (RBAC) para aislar la información financiera de cada vertical.
- **Gestión de Entidades:** CRUD completo para la administración de clientes y subsidiarias (Family Offices).
- **Trazabilidad Financiera:** Carga, clasificación (mensual/anual) y descarga de balances financieros.
- **Almacenamiento Seguro:** Integración con AWS S3 para la salvaguarda de documentos sensibles (PDF/CSV).

## Stack Tecnológico

| Capa | Tecnología |
|------|------------|
| **Backend** | Python 3.11, FastAPI, SQLAlchemy, Alembic |
| **Base de Datos** | PostgreSQL (Neon.tech) / SQLite (Local dev) |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS v3 |
| **Almacenamiento** | AWS S3 (Boto3) |
| **CI/CD & Calidad** | GitHub Actions, Ruff, Flake8, ESLint, Prettier |

## Arquitectura

El sistema sigue un patrón de **Monolito Modular**, con separación estricta de dominios entre el módulo de autenticación (`auth`) y las verticales de negocio (`family_office`). Esta decisión arquitectónica prioriza la velocidad de desarrollo, simplicidad de despliegue y mantenibilidad, evitando la complejidad prematura de los microservicios.

---

## Instalación y Despliegue Local

El código fuente está dividido en dos aplicaciones independientes. Para ejecutar Conexia en tu máquina local, sigue estos pasos:

### 1. Clonar el repositorio
```bash
git clone [https://github.com/tu-organizacion/conexia.git](https://github.com/tu-organizacion/conexia.git)
cd conexia
```

### 2. Levantar el Backend (FastAPI)
``` cd backend
# Crear y activar entorno virtual
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate 

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno (.env)

# Ejecutar migraciones de la base de datos
alembic upgrade head

# Levantar el servidor
uvicorn src.main:app --reload
# La API estará disponible en http://localhost:8000/docs
```

### 3. Levantar el Frontend (React/Vite)
Abre una nueva terminal en la raíz del proyecto:
```
cd frontend

# Instalar dependencias
npm install

# Configurar variables de entorno (.env)

# Levantar el servidor de desarrollo
npm run dev

# La aplicación estará disponible en http://localhost:5173
```
---

Toda la documentación arquitectónica, estándares de nombramiento, estrategias de ramas y registro de decisiones (ADRs) se encuentra en la Wiki del repositorio:
[Wiki](https://github.com/COLE-CO/conexia/wiki/)

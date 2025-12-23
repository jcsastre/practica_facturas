# FactuIA – Sistema de Gestión de Facturas Inteligente

FactuIA es una plataforma integral para la gestión automatizada de facturas y contabilidad simplificada. Utiliza **Inteligencia Artificial** (OpenAI), **n8n** para la orquestación de flujos y **PostgreSQL** para el almacenamiento persistente.

## 🌟 Características Principales

### 📊 Dashboard Estratégico
- **Métricas en Tiempo Real**: Visualización inmediata de Ingresos Totales, Gastos Totales e IVA global.
- **Resumen Trimestral de IVA**: Desglose automático de IVA Repercutido vs. Soportado por trimestres (Q1-Q4).
- **Indicador de Salud**: Alertas visuales sobre el estado del beneficio neto.
- **Formato Profesional**: Cifras formateadas según el estándar contable español (separador de miles por punto y decimales por coma).

### 🤖 Procesamiento IA de Doble Capa
- **Extracción Inteligente**: Subida de facturas con detección automática de datos fiscales.
- **Arquitectura de Rescate (Model Cascading)**:
  - **Eficiencia**: Intento inicial con `gpt-4o-mini`.
  - **Auditoría**: Validación automática de coherencia matemática, NIFs y fechas.
  - **Precisión**: Reintento automático con `gpt-4o-latest` si se detectan errores, actuando como un auditor senior.
- **Control de Consumo**: Sistema de *Rate Limiting* integrado para evitar costes excesivos en la API de OpenAI.

### 💼 Gestión Contable
- **Ingresos y Gastos**: Listados dedicados con filtrado por fechas.
- **Validación de Identidad**: Soporta NIFs españoles e internacionales (5-20 caracteres).
- **Entidades**: Gestión automática de Clientes y Proveedores mediante deduplicación por NIF.

## � Tecnologías

- **Frontend**: React 19, Vite, Vanilla CSS (Premium Aesthetics).
- **Backend/Automation**: n8n (Remote instance).
- **Database**: PostgreSQL (Easypanel).
- **Deployment**: Vercel (Frontend) & GitHub (Source Control).

## 🛠️ Instalación y Configuración

### 1. Requisitos Previos
- Node.js instalado.
- GitHub CLI (`gh`) configurado (opcional, para gestión remota).

### 2. Configuración del Frontend
1. Entra en la carpeta del frontend:
   ```bash
   cd frontend
   ```
2. Instalar dependencias:
   ```bash
   npm install
   ```
3. Crea un archivo `.env` o configura las variables en tu proveedor de hosting (Vercel):
   ```env
   VITE_API_BASE_URL=https://tu-servidor-n8n/webhook
   ```
4. Ejecuta el entorno de desarrollo:
   ```bash
   npm run dev
   ```

### 3. Base de Datos
El esquema inicial se encuentra en `init.sql`. Para limpiezas de mantenimiento en desarrollo:
```bash
DATABASE_URL=tu_url_postgres node scripts/db_clear.js
```

## � Seguridad
- **Variables de Entorno**: El proyecto está configurado para no exponer credenciales en el código fuente.
- **Validación de Datos**: Las facturas pasan por un nodo de validación estricto antes de ser persistidas en la base de datos.

## 📦 Despliegue
El proyecto está optimizado para ser desplegado en **Vercel** conectando directamente el repositorio de GitHub. Las actualizaciones son automáticas (`CI/CD`) con cada *push* a la rama `main`.

---
*Desarrollado con ❤️ para la gestión contable moderna.*

# Práctica n8n – Sistema de Gestión de Facturas y Gastos

Este proyecto implementa un sistema automatizado para la gestión de facturas y gastos utilizando **n8n** y **PostgreSQL**, con integración de **IA** avanzada para el procesamiento inteligente de documentos.

## 🚀 Componentes Principales

### 1. Frontend (React + Vite)
Localizado en la carpeta `/frontend`. Una interfaz moderna que permite:
*   Subir facturas en formato PDF.
*   Seleccionar el tipo de documento (Ingreso o Gasto).
*   Visualizar feedback en tiempo real del proceso de extracción.

### 2. Automatización (n8n)
Ubicado en `/workflows`. El motor lógico del sistema. El flujo más crítico es el **Upload PDF**, que utiliza una arquitectura de **"Model Cascading"**:
*   **Primer Intento (Eficiencia)**: Utiliza **GPT-4o-mini** para una extracción rápida y económica.
*   **Validación Inteligente**: Un nodo de código verifica la coherencia matemática (Base + IVA = Total), el formato de NIFs españoles y fechas.
*   **Segundo Intento (Rescate)**: Si la validación falla, se activa automáticamente **GPT-4o-latest** (modelo premium). Este recibe los errores exactos del primer intento y actúa como un "auditor senior" para corregir los datos antes de guardarlos.
*   **Control de Costes**: Se ha implementado un **Rate Limiting** diario (100 peticiones para `mini` y 10 para `latest`) que bloquea el procesamiento si se excede el uso, evitando costes inesperados de la API de OpenAI.

### 3. Base de Datos (PostgreSQL)
Ubicada en un servidor remoto. El esquema (`init.sql`) organiza la información en:
*   `clients` y `providers`: Gestión de entidades fiscales.
*   `issued_invoices` y `received_invoices`: Registro de transacciones con integridad referencial.

## 🛠️ Utilidades de Desarrollo

Se ha incluido una carpeta `/scripts` con herramientas para facilitar el mantenimiento:
*   `db_clear.js`: Limpia todas las tablas de la base de datos y reinicia los contadores de ID automáticamente.

## ⚙️ Configuración y Ejecución

### Frontend
1. Entrar en la carpeta: `cd frontend`
2. Instalar dependencias: `npm install`
3. Ejecutar: `npm run dev`

### Base de Datos
Para limpiar la base de datos de pruebas:
```bash
node scripts/db_clear.js
```

## 📊 Arquitectura de Datos
El sistema garantiza que no se introducen datos incoherentes mediante el proceso de validación cruzada entre la IA y reglas de negocio contables españolas, forzando valores `null` en lugar de textos genéricos para facilitar la gestión manual posterior si fuera necesaria.

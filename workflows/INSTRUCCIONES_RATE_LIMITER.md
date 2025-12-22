# 🚦 Instrucciones: Añadir Rate Limiter al Workflow

## 📍 Dónde colocar el nodo

```
Webhook 
  → Upload a file
  → [🆕 AÑADIR AQUÍ: Check API Rate Limit]
  → Build Prompt
  → Message a model
  → ...resto del workflow
```

## ✅ Pasos en n8n:

### 1. Crear nuevo nodo Code
- **Nombre:** `Check API Rate Limit`
- **Tipo:** Code (JavaScript)
- **Posición:** Entre "Upload a file" y "Build Prompt"

### 2. Copiar el código
Abre el archivo `workflows/rate_limiter_code.js` y copia todo su contenido en el nodo.

### 3. Conectar el nodo
- **Entrada:** Conecta desde "Upload a file"
- **Salida (Success):** Conecta a "Build Prompt"
- **Salida (Error):** Crea un nuevo nodo "Respond to Webhook" llamado "Respond Rate Limit Error"

### 4. Crear nodo de respuesta de error
**Nodo:** Respond to Webhook  
**Nombre:** Respond Rate Limit Error  
**Respond With:** JSON  
**Response Body:**
```json
={
  "success": false,
  "message": "Límite diario de procesamiento alcanzado. Por favor, inténtalo mañana.",
  "limit_info": JSON.parse($('Check API Rate Limit').error.message)
}
```

## 🎯 Funcionamiento:

1. ✅ **Límite OK:** Deja pasar la petición a "Build Prompt" normalmente
2. ❌ **Límite alcanzado:** Lanza error y va al nodo de respuesta de límite
3. 🔄 **Reset automático:** A las 00:00 se resetean los contadores
4. 📊 **Límites:**
   - gpt-4o-mini: 100 peticiones/día
   - chatgpt-4o-latest: 10 peticiones/día

## 🔧 Modificar límites:

Edita en el código las líneas 6-9:
```javascript
const LIMITS = {
  "gpt-4o-mini": 100,      // ← Cambiar aquí
  "chatgpt-4o-latest": 10  // ← Cambiar aquí
};
```

## 📊 Ver uso actual:

En los logs del workflow verás en cada ejecución:
```json
{
  "_rate_limit_info": {
    "model": "gpt-4o-mini",
    "usage": 45,
    "limit": 100,
    "remaining": 55
  }
}
```

## ⚠️ Notas importantes:

- Los contadores se mantienen mientras el workflow esté activo
- Si desactivas/reactivas el workflow, los contadores se resetean
- El nodo detecta automáticamente si es primer intento (mini) o reintento (latest)
- No requiere modificar "Build Prompt" ni ningún otro nodo existente

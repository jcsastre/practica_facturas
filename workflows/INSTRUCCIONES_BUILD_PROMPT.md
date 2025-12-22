# 🚀 Instrucciones: Actualizar Nodo "Build Prompt" con Rate Limiter

## 📝 Paso 1: Reemplazar el código del nodo

1. Abre tu workflow en n8n
2. Localiza el nodo **"Build Prompt"**
3. Abre el editor de código
4. **Borra todo el código actual**
5. Copia y pega el contenido del archivo: `workflows/build_prompt_with_rate_limit.js`

## ⚙️ Paso 2: Configurar manejo de errores

Ahora el nodo puede lanzar un error cuando se alcanza el límite. Necesitas capturarlo:

### Opción A: Usar el Error Workflow de n8n (Recomendado)

1. Ve a **Workflow Settings** (icono de engranaje arriba)
2. En la pestaña **"Error Workflow"**, selecciona o crea un workflow de error
3. El workflow de error recibirá automáticamente los errores de límite

### Opción B: Añadir nodo de error específico (Más simple)

1. En el nodo **"Build Prompt"**, ve a la pestaña **"Settings"**
2. Activa **"Continue On Fail"** (esto evita que se detenga el workflow)
3. Añade un nodo **IF** después de "Build Prompt" llamado **"Check If Error"**:
   
   **Condición:**
   ```javascript
   {{ $json.error }}
   ```

4. Si **TRUE** (hay error), conecta a un nuevo nodo **"Respond to Webhook"** llamado **"Respond Rate Limit Error"**:

   **Response Body (modo Expression):**
   ```javascript
   ={{ 
     {
       "success": false,
       "message": "Límite diario de procesamiento alcanzado",
       "detail": "Has alcanzado el máximo de peticiones permitidas hoy. Por favor, inténtalo mañana o introduce los datos manualmente.",
       "retry_after": "Mañana a las 00:00"
     }
   }}
   ```

5. Si **FALSE** (no hay error), conecta a **"Message a model"** (flujo normal)

## 📊 Paso 3: Verificar que funciona

### Prueba 1: Ejecución normal
1. Sube una factura
2. Verás en los logs del nodo "Build Prompt" algo como:
   ```json
   {
     "_rate_limit_info": {
       "model": "gpt-4o-mini",
       "usage": 1,
       "limit": 100,
       "remaining": 99,
       "date": "2025-12-22"
     }
   }
   ```

### Prueba 2: Forzar límite (testing)
Para probar, cambia temporalmente en el código:
```javascript
const LIMITS = {
  "gpt-4o-mini": 1,  // ← Cambiar a 1 para testing
  "chatgpt-4o-latest": 1
};
```

Luego sube 2 facturas. La segunda debe fallar con el mensaje de límite.

## 🔧 Personalizar límites

Edita las líneas 6-9 del código:
```javascript
const LIMITS = {
  "gpt-4o-mini": 100,      // ← Peticiones permitidas del modelo rápido
  "chatgpt-4o-latest": 10  // ← Peticiones permitidas del modelo premium
};
```

## 📈 Monitorear uso

El nodo incluye información de uso en cada respuesta. Puedes:

1. **Ver en logs de n8n:** Cada ejecución muestra `_rate_limit_info`
2. **Añadir a respuesta del webhook:** El campo `_rate_limit_info` se pasa automáticamente

## 🔄 Reset manual (si necesitas)

Si necesitas resetear los contadores antes de medianoche:

1. Ve a **Workflow Settings**
2. **Desactiva** el workflow
3. **Activa** el workflow de nuevo

(Esto borra el Static Data y resetea todo)

## ⚠️ Importante

- Los contadores se resetean automáticamente a las **00:00** cada día
- El nodo detecta automáticamente si usar **mini** (primer intento) o **latest** (reintento)
- No necesitas modificar ningún otro nodo del workflow
- Si desactivas/reactivas el workflow, los contadores se resetean

## 🎯 Flujo completo actualizado

```
Webhook 
  → Upload a file
  → Build Prompt [ACTUALIZADO con Rate Limiter]
      ├─ Error → Respond Rate Limit Error
      └─ Success → Message a model
                     → Format OpenAI response
                     → [resto del workflow...]
```

---

¿Todo claro? Ahora solo necesitas copiar el código y configurar el manejo de errores. 🚀

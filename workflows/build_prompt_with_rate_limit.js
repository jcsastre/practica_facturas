// ===========================================
// BUILD PROMPT + RATE LIMITER INTEGRADO
// ===========================================

// 📊 CONFIGURACIÓN DE LÍMITES DIARIOS
const LIMITS = {
  "gpt-4o-mini": 100,
  "chatgpt-4o-latest": 10
};

// 🔍 PARTE 1: DETECCIÓN DE CONTEXTO Y RATE LIMITING
let validationData = null;
let retryCount = 0;

try {
  validationData = $("Check Validation Status").first().json;
  retryCount = (validationData.retry_count || 0) + 1;
} catch (e) {
  retryCount = 0;
}

const targetModel = retryCount > 0 ? "chatgpt-4o-latest" : "gpt-4o-mini";

// 💾 Gestión de Static Data para Rate Limiting
const staticData = this.getWorkflowStaticData('global');
const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

// 🔄 Reset automático a medianoche
if (!staticData.lastResetDate || staticData.lastResetDate !== today) {
  staticData.lastResetDate = today;
  staticData.counts = {
    "gpt-4o-mini": 0,
    "chatgpt-4o-latest": 0
  };
}

// ⚠️ VERIFICAR LÍMITE
const currentCount = staticData.counts[targetModel] || 0;
const maxLimit = LIMITS[targetModel];

if (currentCount >= maxLimit) {
  throw new Error(JSON.stringify({
    type: "RATE_LIMIT_EXCEEDED",
    model: targetModel,
    current: currentCount,
    limit: maxLimit,
    message: `Límite diario alcanzado para ${targetModel}: ${currentCount}/${maxLimit} peticiones. Intenta mañana o introduce los datos manualmente.`
  }));
}

// ✅ Incrementar contador
staticData.counts[targetModel] = currentCount + 1;

// 📝 PARTE 2: CONSTRUCCIÓN DEL PROMPT
const errors = validationData?.validation_errors || [];

let prompt = `Eres un experto en contabilidad española. Analiza esta factura y extrae los datos en formato JSON.

**REGLAS CRÍTICAS DE EXTRACCIÓN:**
1. ⚠️ **IMPORTANTE:** Si no encuentras un dato, usa el valor null. **PROHIBIDO** usar textos como "Not provided", "N/A", "Unknown" o similares.
2. INVOICE_NUMBER: Busca el número de factura. Diferéncialo de la fecha. Suele estar etiquetado como 'Factura nº', 'Nº Doc', etc.
3. ISSUE_DATE: La fecha de emisión siempre en formato YYYY-MM-DD.
4. TAX_RATE: Solo el número (0, 4, 10 o 21).
5. CATEGORY: Solo si type=expense. Ej: Suministros, Alquiler, Gestoría, etc.

**ESTRUCTURA JSON:**
{
  "type": "income" o "expense",
  "third_party": {
    "name": "Nombre fiscal o null",
    "nif": "NIF/CIF o null",
    "address": "Dirección completa o null"
  },
  "invoice_number": "String o null",
  "issue_date": "YYYY-MM-DD o null",
  "base_amount": número o null,
  "tax_rate": número o null,
  "tax_amount": número o null,
  "total_amount": número o null,
  "category": "String o null"
}`;

// 🔁 Si es un reintento, añadir instrucciones de corrección
if (retryCount > 0) {
  prompt = `⚠️ INSTRUCCIONES DE AUDITORÍA (RESURRECCIÓN DE DATOS):
El intento anterior falló. Ahora, como auditor senior, debes corregir estos errores detectados:

${errors.map((err, i) => `${i + 1}. ❌ ${err}`).join('\n')}

**ANÁLISIS DE CORRECCIÓN:**
- Especial atención: Si antes pusiste "Not provided", ahora busca mejor o pon null si realmente no existe.
- ¿Se ha confundido la Fecha con el Número de Factura?
- Re-calcula: Base imponible + IVA debe sumar exactamente el Total.
- Identidad: El NIF debe ser el de la OTRA parte (cliente o proveedor).

${prompt}`;
}

// 📤 SALIDA
return {
  json: {
    enhanced_prompt: prompt,
    retry_count: retryCount,
    file_id: $("Upload a file").first().json.id,
    target_model: targetModel,
    // 📊 Info de uso (para monitoreo)
    _rate_limit_info: {
      model: targetModel,
      usage: staticData.counts[targetModel],
      limit: maxLimit,
      remaining: maxLimit - staticData.counts[targetModel],
      date: today
    }
  }
};

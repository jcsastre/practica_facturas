// ============================================
// NODO: Check API Rate Limit
// POSICIÓN: Entre "Upload a file" y "Build Prompt"
// ============================================

// 📊 CONFIGURACIÓN DE LÍMITES DIARIOS
const LIMITS = {
  "gpt-4o-mini": 100,
  "chatgpt-4o-latest": 10
};

// 🔍 Detectar si es reintento (viene de validación fallida)
let isRetry = false;
try {
  const validationData = $("Check Validation Status").first().json;
  isRetry = validationData && validationData.retry_count >= 0;
} catch (e) {
  isRetry = false;
}

// 🎯 Determinar modelo según contexto
const targetModel = isRetry ? "chatgpt-4o-latest" : "gpt-4o-mini";
const maxLimit = LIMITS[targetModel];

// 💾 Gestión de Static Data (persiste durante ejecución del workflow)
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

// 📈 Obtener contador actual
const currentCount = staticData.counts[targetModel] || 0;

// ⚠️ VERIFICAR LÍMITE
if (currentCount >= maxLimit) {
  // LÍMITE ALCANZADO - Detener workflow con error
  throw new Error(JSON.stringify({
    type: "RATE_LIMIT_EXCEEDED",
    model: targetModel,
    current: currentCount,
    limit: maxLimit,
    message: `Límite diario alcanzado para ${targetModel}: ${currentCount}/${maxLimit} peticiones`
  }));
}

// ✅ Incrementar contador
staticData.counts[targetModel] = currentCount + 1;

// 📤 Pasar datos al siguiente nodo sin modificaciones
// Simplemente reenviar lo que viene del nodo anterior
const inputData = $input.first().json;

return {
  json: {
    ...inputData, // Mantiene todos los datos anteriores (file_id, etc)
    // Añade metadata de uso (opcional, para logging)
    _rate_limit_info: {
      model: targetModel,
      usage: staticData.counts[targetModel],
      limit: maxLimit,
      remaining: maxLimit - staticData.counts[targetModel]
    }
  }
};

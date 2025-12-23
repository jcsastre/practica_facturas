const fs = require('fs');
const https = require('https');
const path = require('path');

// Leer .env manualmente para no depender de librerías externas
const envPath = path.join(__dirname, '..', '.env');
const env = {};
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  content.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) env[key.trim()] = value.trim();
  });
}

const API_KEY = env.N8N_API_KEY;
const BASE_URL = 'fdp-n8n.odyw27.easypanel.host';

if (!API_KEY) {
  console.error('❌ No se encontró N8N_API_KEY en el archivo .env');
  process.exit(1);
}

const workflows = [
  { id: '5NuwkfihaBtnxSpm', filename: 'factu_upload_pdf.json' },
  { id: 'A8a4j1ApyxAlFBR7', filename: 'factu_received_invoices.json' },
  { id: 'YdZjf2UwV7SDBluX', filename: 'factu_issued_invoices.json' },
  { id: 'EvfURd6fqLVskCvf', filename: 'factu_dashboard_stats.json' }
];

async function downloadWorkflow(id, filename) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: BASE_URL,
      path: `/api/v1/workflows/${id}`,
      headers: {
        'X-N8N-API-KEY': API_KEY
      }
    };

    https.get(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          // n8n API returns the full object, we usually want just the data if we want to re-import,
          // but saving the whole response is safer for backup. 
          // However, for n8n import, it often expects the 'nodes' and 'connections' directly.
          // Let's save the whole JSON response as it's the official export format via API.
          const filePath = path.join(__dirname, '..', 'workflows', filename);
          
          // Ensure directory exists
          const dir = path.dirname(filePath);
          if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

          fs.writeFileSync(filePath, JSON.stringify(json, null, 2));
          console.log(`✅ Sincronizado: ${filename}`);
          resolve();
        } catch (e) {
          console.error(`❌ Error parseando JSON para ${filename}:`, data.substring(0, 100));
          reject(e);
        }
      });
    }).on('error', (err) => {
      console.error(`❌ Error descargando ${filename}:`, err.message);
      reject(err);
    });
  });
}

async function syncAll() {
  console.log('🔄 Iniciando sincronización de workflows desde el servidor n8n...');
  for (const wf of workflows) {
    try {
      await downloadWorkflow(wf.id, wf.filename);
    } catch (e) {
      // Continuar con los demás
    }
  }
  console.log('✨ Sincronización completada.');
}

syncAll();

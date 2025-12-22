const { Client } = require('pg');

// Configuración recuperada del entorno del proyecto
const connectionString = 'postgres://postgres:8812f52950a4b3ba5f09@fdp-n8n.odyw27.easypanel.host:5432/postgres';

async function clearDatabase() {
  const client = new Client({ connectionString });
  
  try {
    console.log('🔄 Conectando a la base de datos...');
    await client.connect();
    
    console.log('🧹 Vaciando tablas...');
    // TRUNCATE elimina los datos, RESTART IDENTITY reinicia los contadores de ID
    // CASCADE se asegura de que las relaciones de Foreign Key no bloqueen el proceso
    await client.query('TRUNCATE TABLE issued_invoices, received_invoices, clients, providers RESTART IDENTITY CASCADE');
    
    console.log('✅ Base de datos vaciada con éxito (registros eliminados y contadores reseteados).');
  } catch (err) {
    console.error('❌ Error ejecutando la limpieza:', err.message);
  } finally {
    await client.end();
  }
}

clearDatabase();

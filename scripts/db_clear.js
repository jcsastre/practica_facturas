const { Client } = require('pg');

// Configuración recuperada del entorno (usar variable de entorno para seguridad)
const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/postgres';

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

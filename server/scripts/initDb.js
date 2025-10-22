// server/scripts/initDb.js
const fs = require('fs');
const content = `
const { sequelize } = require('../config/database');

const initDatabase = async () => {
  try {
    console.log('🔄 Inicializando base de datos...');
    await sequelize.sync({ force: true });
    console.log('✅ Base de datos creada exitosamente');
    
    // Ejecutar seed
    console.log('🌱 Ejecutando seed inicial...');
    require('../../database/seeders/seed');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

initDatabase();
`;
fs.writeFileSync('scripts/initDb.js', content);
console.log('✅ Script de inicialización creado');
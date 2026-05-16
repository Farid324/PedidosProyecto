// server/scripts/create-cajero.js
// Ejecutar: cd server && node scripts/create-cajero.js

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { sequelize, Usuario } = require('../models');

(async () => {
  try {
    await sequelize.authenticate();
    console.log('🔗 Conectado a la base de datos');

    // ================================================
    // CAMBIA ESTOS VALORES para definir el cajero
    // ================================================
    const nombre = 'OperadoraX';           // El usuario que escribe el cajero
    const email  = 'cajero@restaurant.com'; // Email interno (no lo usa el cajero)
    const pass   = 'cajero123';             // La contraseña del cajero

    let u = await Usuario.findOne({ where: { email } });
    if (!u) {
      u = await Usuario.create({ 
        nombre, 
        email, 
        password: pass, 
        rol: 'cajero',
        activo: true 
      });
      console.log('✅ Usuario cajero creado:');
    } else {
      await Usuario.destroy({ where: { email } });
      u = await Usuario.create({ 
        nombre, 
        email, 
        password: pass, 
        rol: 'cajero',
        activo: true 
      });
      console.log('✅ Usuario cajero actualizado:');
    }

    console.log('   Usuario:', nombre);
    console.log('   Password:', pass);
    console.log('   Rol: cajero');
    console.log('\n   El cajero ingresa con:');
    console.log('   Usuario: ' + nombre);
    console.log('   Contraseña: ' + pass);
    console.log('   + elige turno AM o PM');
    
    process.exit(0);
  } catch (e) {
    console.error('❌ Error:', e);
    process.exit(1);
  }
})();
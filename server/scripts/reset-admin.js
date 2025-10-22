// server/scripts/reset-admin.js
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { sequelize, Usuario } = require('../models');

(async () => {
  try {
    await sequelize.authenticate();
    console.log('🔗 DB usada:', sequelize.options.storage || process.env.DATABASE_URL);

    const email = 'admin@restaurant.com';
    const pass  = 'admin123';

    let u = await Usuario.findOne({ where: { email } });
    if (!u) {
      u = await Usuario.create({ nombre: 'Admin', email, password: pass, rol: 'admin' });
      console.log('✅ Admin creado:', email);
    } else {
      u.rol = 'admin';
      u.password = pass; // beforeSave re-hashea
      await u.save();
      console.log('✅ Admin actualizado:', email);
    }
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
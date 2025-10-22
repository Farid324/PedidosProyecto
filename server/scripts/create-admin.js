// server/scripts/create-admin.js
const { sequelize, Usuario } = require('../models');

(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync(); // crea tablas si faltan

    let u = await Usuario.findOne({ where: { email: 'admin@restaurant.com' } });
    if (!u) {
      u = await Usuario.create({
        nombre: 'Admin',
        email: 'admin@restaurant.com',
        password: 'admin123',   // se hashea con los hooks
        rol: 'admin',
      });
      console.log('✅ Admin creado:', u.email);
    } else {
      u.rol = 'admin';
      u.password = 'admin123';   // se re-hashea con beforeUpdate
      await u.save();
      console.log('🔁 Admin actualizado:', u.email);
    }

    process.exit(0);
  } catch (e) {
    console.error('❌ Error creando admin:', e);
    process.exit(1);
  }
})();

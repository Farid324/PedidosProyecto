// server/scripts/cleanupSqliteBackups.js
const { sequelize } = require('../models');

(async () => {
  try {
    console.log('🔎 Buscando tablas _backup ...');
    const [rows] = await sequelize.query(
      "SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%_backup';"
    );

    if (!rows.length) {
      console.log('✅ No hay tablas _backup.');
      process.exit(0);
    }

    for (const r of rows) {
      const t = r.name;
      console.log('🗑️  Eliminando', t);
      await sequelize.query(`DROP TABLE IF EXISTS "${t}";`);
    }

    console.log('✅ Limpieza terminada.');
    process.exit(0);
  } catch (e) {
    console.error('❌ Error limpiando backups:', e);
    process.exit(1);
  }
})();
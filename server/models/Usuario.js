const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  const Usuario = sequelize.define('Usuario', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombre: { type: DataTypes.STRING(100), allowNull: false },
    email: { type: DataTypes.STRING(120), allowNull: false, unique: true, validate: { isEmail: true } },
    password: { type: DataTypes.STRING(200), allowNull: true },
    rol: { type: DataTypes.ENUM('admin', 'cajero'), allowNull: false, defaultValue: 'cajero' },
    activo: { type: DataTypes.BOOLEAN, defaultValue: true },
  }, {
    tableName: 'usuarios',
    timestamps: true,
  });

  Usuario.beforeCreate(async (u) => { if (u.password) u.password = await bcrypt.hash(u.password, 10); });
  Usuario.prototype.comparePassword = async function (plain) {
    if (!this.password) return false;
    return bcrypt.compare(plain, this.password);
  };

  return Usuario;
};

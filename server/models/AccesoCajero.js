// server/models/AccesoCajero.js
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('AccesoCajero', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombre_cajero: { type: DataTypes.STRING(120), allowNull: false },
    turno: { type: DataTypes.ENUM('AM','PM'), allowNull: false },
    dispositivo: { type: DataTypes.STRING(255) },
    fecha_ingreso: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    fecha_salida: { type: DataTypes.DATE },
  }, { tableName: 'accesos_cajero', timestamps: true });
};

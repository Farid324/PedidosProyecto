// server/models/Configuracion.js
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Configuracion', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    clave: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    valor: { type: DataTypes.TEXT('long'), allowNull: true },
  }, {
    tableName: 'configuracion',
    timestamps: true,
  });
};

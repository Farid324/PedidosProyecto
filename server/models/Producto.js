// server/models/Producto.js
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Producto', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombre: { type: DataTypes.STRING(120), allowNull: false },
    descripcion: { type: DataTypes.STRING(255) },
    precio: { type: DataTypes.DECIMAL(10,2), allowNull: false, defaultValue: 0 },
    categoria_id: { type: DataTypes.INTEGER },
    disponible: { type: DataTypes.BOOLEAN, defaultValue: true },
    imagen_url: { type: DataTypes.STRING(255) },
  }, { tableName: 'productos', timestamps: true });
};

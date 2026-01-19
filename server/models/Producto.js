// server/models/Producto.js
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Producto', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombre: { type: DataTypes.STRING(120), allowNull: false },
    descripcion: { type: DataTypes.STRING(255) },
    precio: { type: DataTypes.DECIMAL(10,2), allowNull: false, defaultValue: 0 },
    categoria_id: { type: DataTypes.INTEGER },
    disponible: { type: DataTypes.BOOLEAN, defaultValue: true },
    
    // Campo para URLs externas (ej: https://imgur.com/foto.jpg)
    imagen_url: { type: DataTypes.STRING(500) }, 
    
    // NUEVO: Campo exclusivo para guardar la imagen subida codificada en texto (Base64)
    // Usamos TEXT porque las imágenes convertidas a texto son muy largas
    imagen_base64: { type: DataTypes.TEXT } 

  }, { tableName: 'productos', timestamps: true });
};
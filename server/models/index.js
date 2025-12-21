// server/models/index.js
const fs = require('fs');
const path = require('path');
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const db = {};
const basename = path.basename(__filename);

fs.readdirSync(__dirname)
  .filter((file) => file !== basename && file.endsWith('.js'))
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(sequelize, DataTypes);
    db[model.name] = model;
  });

// asociaciones mínimas (ajústalas a tus necesidades)
if (db.DetallePedido && db.Pedido) db.DetallePedido.belongsTo(db.Pedido, { foreignKey: 'pedido_id' });
if (db.DetallePedido && db.Producto) db.DetallePedido.belongsTo(db.Producto, { foreignKey: 'producto_id' });
if (db.Pedido && db.DetallePedido) db.Pedido.hasMany(db.DetallePedido, { foreignKey: 'pedido_id' });

if (db.Factura && db.Pedido) db.Factura.belongsTo(db.Pedido, { foreignKey: 'pedido_id' });

if (db.Producto && db.Categoria) {
  db.Producto.belongsTo(db.Categoria, { foreignKey: 'categoria_id', as: 'categoria' });
  db.Categoria.hasMany(db.Producto, { foreignKey: 'categoria_id', as: 'productos' });
}
module.exports = { sequelize, ...db };

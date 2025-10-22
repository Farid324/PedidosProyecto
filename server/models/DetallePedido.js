module.exports = (sequelize, DataTypes) => {
  return sequelize.define('DetallePedido', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    pedido_id: { type: DataTypes.INTEGER, allowNull: false },
    producto_id: { type: DataTypes.INTEGER, allowNull: false },
    cantidad: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    precio_unitario: { type: DataTypes.DECIMAL(10,2), allowNull: false, defaultValue: 0 },
    subtotal: { type: DataTypes.DECIMAL(10,2), allowNull: false, defaultValue: 0 },
    observaciones: { type: DataTypes.STRING(255) },
  }, { tableName: 'detalles_pedido', timestamps: true });
};

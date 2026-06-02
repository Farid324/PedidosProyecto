// server/models/Pedido.js
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Pedido', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    mesa: { type: DataTypes.INTEGER, allowNull: false },
    cajero_nombre: { type: DataTypes.STRING(120), allowNull: false },
    turno: { type: DataTypes.ENUM('AM', 'PM'), defaultValue: 'AM' },
    razon_social: { type: DataTypes.STRING(200), allowNull: false },
    nit: { type: DataTypes.STRING(50), allowNull: true },
    tipo_pedido: { type: DataTypes.ENUM('mesa', 'llevar'), defaultValue: 'mesa' },
    observaciones: { type: DataTypes.TEXT, allowNull: true },
    subtotal: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    total: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    estado: { type: DataTypes.ENUM('pendiente', 'en_proceso', 'completado', 'cancelado'), defaultValue: 'pendiente' },
    metodo_pago: { type: DataTypes.ENUM('EFECTIVO', 'QR'), defaultValue: 'EFECTIVO' },
    pago_qr: { type: DataTypes.BOOLEAN, defaultValue: false },
    fecha_pedido: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }, {
    tableName: 'pedidos',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });
};

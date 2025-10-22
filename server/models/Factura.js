module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Factura', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    numero_factura: { type: DataTypes.STRING(50) },
    pedido_id: { type: DataTypes.INTEGER },
    cliente_nombre: { type: DataTypes.STRING(120) },
    cliente_nit: { type: DataTypes.STRING(50) },
    cajero_nombre: { type: DataTypes.STRING(120), allowNull: false },
    fecha_emision: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    subtotal: { type: DataTypes.DECIMAL(10,2), defaultValue: 0 },
    descuento: { type: DataTypes.DECIMAL(10,2), defaultValue: 0 },
    total: { type: DataTypes.DECIMAL(10,2), defaultValue: 0 },
    estado: { type: DataTypes.ENUM('pagada','pendiente','anulada'), defaultValue: 'pagada' },
    metodo_pago: { type: DataTypes.ENUM('EFECTIVO','TARJETA','QR','OTRO'), defaultValue: 'EFECTIVO' },
  }, { tableName: 'facturas', timestamps: true });
};

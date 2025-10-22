module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Categoria', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombre: { type: DataTypes.STRING(100), allowNull: false },
    descripcion: { type: DataTypes.STRING(255) },
    activo: { type: DataTypes.BOOLEAN, defaultValue: true },
  }, { tableName: 'categorias', timestamps: true });
};

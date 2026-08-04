// server/models/Auditoria.js
module.exports = (sequelize, DataTypes) => {
  const Auditoria = sequelize.define('Auditoria', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    nombre_usuario: {
      type: DataTypes.STRING,
      allowNull: false
    },
    accion: {
      type: DataTypes.ENUM('login', 'logout'),
      allowNull: false
    },
    turno: {
      type: DataTypes.STRING,
      allowNull: true
    },
    detalles: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'auditorias',
    timestamps: true,
  });

  return Auditoria;
};

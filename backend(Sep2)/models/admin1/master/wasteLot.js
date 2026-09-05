import { DataTypes } from "sequelize";

const WasteLotModel = (sequelize) => {
  const WasteLot = sequelize.define(
    "WasteLot",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      lotNo: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        field: "lot_no",
      },
      wasteMasterId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "waste_masters",
          key: "id",
        },
        onDelete: "RESTRICT",
        onUpdate: "CASCADE",
        field: "waste_master_id",
      },
      active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      tableName: "waste_lots",
      timestamps: true,
      indexes: [
        { unique: true, fields: ["lot_no"] },
        { fields: ["waste_master_id"] },
      ],
    }
  );

  return WasteLot;
};

export default WasteLotModel;
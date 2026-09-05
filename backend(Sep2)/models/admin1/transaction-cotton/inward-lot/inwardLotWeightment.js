// models/InwardLotWeightment.js
import { DataTypes } from "sequelize";

const InwardLotWeightmentModel = (sequelize) => {
  const InwardLotWeightment = sequelize.define(
    "InwardLotWeightment",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      lotNo: {
        type: DataTypes.STRING(50),
        allowNull: false,
        references: {
          model: "inward_lots",
          key: "lot_no",
        },
        onDelete: "CASCADE",
        field: "lot_no",
      },

      baleNo: {
        type: DataTypes.STRING(60),
        allowNull: false,
        field: "bale_no",
      },

      grossWeight: {
        type: DataTypes.DECIMAL(10, 3),
        allowNull: false,
      },

      tareWeight: {
        type: DataTypes.DECIMAL(10, 3),
        allowNull: false,
      },

      baleWeight: {
        type: DataTypes.DECIMAL(10, 3),
        allowNull: false,
        field: "bale_weight",
      },

      baleValue: {
        type: DataTypes.DECIMAL(12, 3),
        allowNull: true,
      },
      isIssued: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      }
    },
    {
      tableName: "inward_lot_weightments",
      timestamps: true,
      indexes: [
        { unique: true, fields: ["lot_no", "bale_no"] },
      ],
    }
  );

  return InwardLotWeightment;
};

export default InwardLotWeightmentModel;

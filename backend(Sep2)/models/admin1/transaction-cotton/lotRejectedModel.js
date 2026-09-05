// models/admin1/transaction-cotton/lot-rejected/lotRejectedModel.js
import { DataTypes } from "sequelize";

const LotRejectedModel = (sequelize) => {
  const LotRejected = sequelize.define(
    "LotRejected",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      inwardLotId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true, // One record per lot
        references: {
          model: "inward_lots",
          key: "id",
        },
        onDelete: "CASCADE",
      },

      isRejected: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      tableName: "lot_rejecteds",
      timestamps: true, // createdAt & updatedAt auto-added
      paranoid: false,  // No soft delete needed for this simple flag
      indexes: [
        {
          unique: true,
          fields: ["inwardLotId"],
        },
      ],
    }
  );

  return LotRejected;
};

export default LotRejectedModel;
// models/InwardLot.js
import { DataTypes } from "sequelize";

const InwardLotModel = (sequelize) => {
  const InwardLot = sequelize.define(
    "InwardLot",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      inwardId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "inward_entries",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
        field: "inward_id",
      },

      lotNo: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        field: "lot_no",
      },

      lcNo: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: "lc_no",
      },

      paymentDays: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: "payment_days",
      },

      paymentDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        field: "payment_date",
      },

      setNo: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: "set_no",
      },

      cess: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
        field: "cess",
      },

      type: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: "type",
      },

      godownId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "godowns",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
        field: "godown_id",
      },

      lotDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        field: "lot_date",
      },

      freight: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
        field: "freight",
      },

      grossWeight: {
        type: DataTypes.DECIMAL(12, 3),
        allowNull: false,
        field: "gross_weight",
      },

      nettWeight: {
        type: DataTypes.DECIMAL(12, 3),
        allowNull: false,
        field: "nett_weight",
      },

      tareWeight: {
        type: DataTypes.DECIMAL(12, 3),
        allowNull: false,
        field: "tare_weight",
      },

      qty: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "qty",
      },

      candyRate: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        field: "candy_rate",
      },

      quintalRate: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        field: "quintal_rate",
      },

      ratePerKg: {
        type: DataTypes.DECIMAL(12, 3),
        allowNull: false,
        field: "rate_per_kg",
      },

      assessValue: {
        type: DataTypes.DECIMAL(14, 2),
        allowNull: false,
        field: "assess_value",
      },
    },
    {
      tableName: "inward_lots",
      timestamps: true,
      indexes: [
        { unique: true, fields: ["lot_no"] },
        { fields: ["inward_id"] },
        { fields: ["godown_id"] },
      ],
    }
  );

  return InwardLot;
};

export default InwardLotModel;
// admin1/transaction-cotton/lot-allowance/lotAllowanceModel.js
import { DataTypes } from "sequelize";

const LotAllowanceModel = (sequelize) => {
  const LotAllowance = sequelize.define(
    "LotAllowance",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      // Auto-generated or manual allowance number
      allowanceNo: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        comment: "Sequential allowance number (e.g. 16)",
      },

      // Date of allowance entry
      allowanceDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },

      // Link to Inward Lot
      inwardLotId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "inward_lots",
          key: "id",
        },
        onDelete: "CASCADE",
      },

      // Read-only / inherited from lot (for display & audit)
      lotNo: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: "Copied from inward lot for quick reference",
      },

      lotDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },

      // Party / Supplier info (denormalized for fast display & history)
      partyName: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },

      variety: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },

      // Weight details from lot (snapshot at time of allowance)
      grossWeight: {
        type: DataTypes.DECIMAL(12, 3),
        allowNull: false,
      },

      tareWeight: {
        type: DataTypes.DECIMAL(12, 3),
        allowNull: false,
      },

      netWeight: {
        type: DataTypes.DECIMAL(12, 3),
        allowNull: false,
      },

      // Rate information from lot / purchase
      candyRate: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },

      quintalRate: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
      },

      ratePerKg: {
        type: DataTypes.DECIMAL(10, 4),
        allowNull: false,
        comment: "Rate / Kg used for calculation",
      },

      actualValue: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        comment: "Net Weight × Rate/Kg (before allowance)",
      },

      // The allowance / debit amount
      allowanceRate: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        comment: "Rate per kg deduction (e.g. 300)",
      },

      debitValue: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        comment: "Total deduction amount = allowanceRate × netWeight (or custom logic)",
      },

      // Ledger / accounting reference
      debitLedger: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: "Ledger account where debit is posted (optional)",
      },

      // Audit fields
      remarks: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      createdBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: "users", key: "id" },
      },

      updatedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: "users", key: "id" },
      },
    },
    {
      tableName: "lot_allowances",
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ["allowanceNo"],
        },
        {
          fields: ["inwardLotId"],
        },
      ],
    }
  );

  return LotAllowance;
};

export default LotAllowanceModel;
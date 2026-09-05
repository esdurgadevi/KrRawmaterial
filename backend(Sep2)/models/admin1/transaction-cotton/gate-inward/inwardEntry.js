import { DataTypes } from "sequelize";

const InwardEntryModel = (sequelize) => {
  const InwardEntry = sequelize.define(
    "InwardEntry",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      inwardNo: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        field: "inward_no",
      },

      purchaseOrderId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "purchase_orders",
          key: "id",
        },
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
        field: "purchase_order_id",
      },

      lcNo: {
        type: DataTypes.STRING(50),
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

      govtForm: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: "govt_form",
      },

      type: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },

      inwardDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: "inward_date",
      },

      billNo: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: "bill_no",
      },

      billDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        field: "bill_date",
      },

      lotNo: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: "lot_no",
      },

      lorryNo: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: "lorry_no",
      },

      date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },

      candyRate: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
        field: "candy_rate",
      },

      pMark: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: "p_mark",
      },

      pressRunningNo: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: "press_running_no",
      },

      commisType: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: "commis_type",
      },

      commisValue: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
        field: "commis_value",
      },
      
      godownId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "godowns",
          key: "id",
        },
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
        field: "godown_id",
      },

      Qty: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: "bales_qty",
      },

      freight: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
      },

      /* ✅ SEPARATED FIELDS */
      cooly: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },

      bale: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      gst : {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },

      /* ✅ TAX PERCENTAGES */
      sgst: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
      },

      cgst: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
      },

      igst: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
      },

      /* ✅ TAX AMOUNTS */
      sgstAmount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
        field: "sgst_amount",
      },

      cgstAmount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
        field: "cgst_amount",
      },

      igstAmount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
        field: "igst_amount",
      },

      Tax: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
      },

      TaxRs: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
        field: "tax_amount",
      },

      grossWeight: {
        type: DataTypes.DECIMAL(12, 3),
        allowNull: true,
        field: "gross_weight",
      },

      tareWeight: {
        type: DataTypes.DECIMAL(12, 3),
        allowNull: true,
        field: "tare_weight",
      },

      nettWeight: {
        type: DataTypes.DECIMAL(12, 3),
        allowNull: true,
        field: "nett_weight",
      },

      permitNo: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: "permit_no",
      },

      comm: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
      },
      grossPerQty: {
  type: DataTypes.DECIMAL(12, 3),
  allowNull: true,
  field: "gross_per_qty",
},

tarePerQty: {
  type: DataTypes.DECIMAL(12, 3),
  allowNull: true,
  field: "tare_per_qty",
},

freightPerQty: {
  type: DataTypes.DECIMAL(12, 2),
  allowNull: true,
  field: "freight_per_qty",
},

      remarks: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: "inward_entries",
      timestamps: true,
      indexes: [
        { unique: true, fields: ["inward_no"] },
        { fields: ["purchase_order_id"] },
      ],
    }
  );

  return InwardEntry;
};

export default InwardEntryModel;

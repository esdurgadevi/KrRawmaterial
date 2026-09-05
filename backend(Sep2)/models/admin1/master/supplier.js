import { DataTypes } from "sequelize";

const SupplierModel = (sequelize) => {
  const Supplier = sequelize.define(
    "Supplier",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      code: {
        type: DataTypes.STRING(20), // e.g., "20310006" – can be alphanumeric
        allowNull: false,
        unique: true,
      },
      accountGroup: {
        type: DataTypes.STRING(100),
        allowNull: false,
        defaultValue: "CREDITORS - COTTON",
        field: "account_group",
      },
      accountName: {
        type: DataTypes.STRING(150),
        allowNull: false,
        trim: true,
        field: "account_name",
      },
      place: {
        type: DataTypes.STRING(100),
        allowNull: false,
        trim: true,
      },
      address: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      deliveryAddress: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: "delivery_address",
      },
      pincode: {
        type: DataTypes.STRING(10),
        allowNull: true,
        defaultValue: "0",
      },
      stateId: {
        type: DataTypes.INTEGER,
        references: {
          model: "states",
          key: "id",
        },
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
        field: "state_id",
      },
      tinNo: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: "tin_no",
      },
      cstNo: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: "cst_no",
      },
      gstNo: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: "gst_no",
      },
      phoneNo: {
        type: DataTypes.STRING(20),
        allowNull: true,
        field: "ph_no",
      },
      cellNo: {
        type: DataTypes.STRING(20),
        allowNull: true,
        field: "cell_no",
      },
      email: {
        type: DataTypes.STRING(150),
        allowNull: true,
        validate: {
          isEmail: true,
        },
        set(value) {
          this.setDataValue("email", value === "" ? null : value);
        }
      },
      website: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      contactPerson: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: "contact",
      },
      fax: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      accountNo: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: "account_no",
      },
      openingCredit: {
        allowNull: true,
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0.00,
        field: "opening_credit",
      },
      openingDebit: {
        allowNull: true,
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0.00,
        field: "opening_debit",
      },
    },
    {
      tableName: "suppliers",
      timestamps: true,
      indexes: [
        { unique: true, fields: ["code"] },
        { fields: ["account_name"] },
        { fields: ["gst_no"] },
        { fields: ["state_id"] },
      ],
    }
  );

  return Supplier;
};

export default SupplierModel;
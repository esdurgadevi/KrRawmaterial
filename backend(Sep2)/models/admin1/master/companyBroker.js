import { DataTypes } from "sequelize";

const CompanyBrokerModel = (sequelize) => {
  const CompanyBroker = sequelize.define(
    "CompanyBroker",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      code: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
      },
      companyName: {
        type: DataTypes.STRING(150),
        allowNull: false,
        trim: true,
        field: "company_name",
      },
      shortDesc: {
        type: DataTypes.STRING(250),
        allowNull: true,
        defaultValue: null,
        trim: true,
        field: "short_desc",
      },
      address: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
      },
    },
    {
      tableName: "company_brokers",
      timestamps: true,
      indexes: [
        { unique: true, fields: ["code"] },
        { fields: ["company_name"] },
      ],
    }
  );

  return CompanyBroker;
};

export default CompanyBrokerModel;
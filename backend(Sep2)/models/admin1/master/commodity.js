import { DataTypes } from "sequelize";

const CommodityModel = (sequelize) => {
  const Commodity = sequelize.define(
    "Commodity",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      commodityCode: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
      },
      commodityName: {
        type: DataTypes.STRING(150),
        allowNull: false,
        trim: true,
      },
    },
    {
      tableName: "commodities",
      timestamps: true,
      indexes: [
        { unique: true, fields: ["commodityCode"] },
        { fields: ["commodityName"] }, // Useful for name-based searches
      ],
    }
  );

  return Commodity;
};

export default CommodityModel;
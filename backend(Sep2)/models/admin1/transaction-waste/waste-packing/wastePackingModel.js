import { DataTypes } from "sequelize";

const WastePackingModel = (sequelize) => {
  const WastePacking = sequelize.define(
    "WastePacking",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      wasteType: {
        type: DataTypes.STRING(100),
        allowNull: false,
        // e.g. "COMBER NOILS", "YARN WASTE", etc.
      },
      date: {
        type: DataTypes.DATEONLY, // Stores YYYY-MM-DD
        allowNull: false,
      },
      lotNo: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      packingType: {
        type: DataTypes.STRING(50),
        allowNull: false,
        // e.g. "BALE", "BAG", "BOX"
      },
      noOfBales: {
        type: DataTypes.INTEGER,
        allowNull: false,
        // Number of bales entered / expected
      },
      totalBales: {
        type: DataTypes.INTEGER,
        allowNull: false,
        // Should match count of details rows after creation
      },
      totalWeight: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        // Sum of net weights from details
      },
    },
    {
      tableName: "waste_packings",
      timestamps: true,
    }
  );

  return WastePacking;
};

export default WastePackingModel;
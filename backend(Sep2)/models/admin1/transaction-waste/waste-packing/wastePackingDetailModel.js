import { DataTypes } from "sequelize";

const WastePackingDetailModel = (sequelize) => {
  const WastePackingDetail = sequelize.define(
    "WastePackingDetail",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      wastePackingId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "waste_packings",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE", // Delete details if header is deleted
      },
      siNo: {
        type: DataTypes.INTEGER,
        allowNull: false,
        // 1, 2, 3... (sequential per packing)
      },
      baleNo: {
        type: DataTypes.STRING(50),
        allowNull: false,
        // e.g. "WC-3090-4..."
      },
      grossWeight: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      tareWeight: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
      },
      netWeight: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        // Usually gross - tare
      },
    },
    {
      tableName: "waste_packing_details",
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ["wastePackingId", "baleNo"], // Prevent duplicate baleNo in same packing
        },
      ],
    }
  );

  return WastePackingDetail;
};

export default WastePackingDetailModel;
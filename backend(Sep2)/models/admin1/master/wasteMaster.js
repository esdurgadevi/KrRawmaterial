import { DataTypes } from "sequelize";

const WasteMasterModel = (sequelize) => {
  const WasteMaster = sequelize.define(
    "WasteMaster",
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
      department: {
        type: DataTypes.STRING(100),
        allowNull: false,
        trim: true,
      },
      waste: {
        type: DataTypes.STRING(200),
        allowNull: false,
        trim: true,
      },
      packingTypeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "packing_types",
          key: "id",
        },
        onDelete: "RESTRICT", // Prevent deletion of packing type if used in waste
        onUpdate: "CASCADE",
        field: "packing_type_id",
      },
      wasteKg: {
        type: DataTypes.DECIMAL(12, 3), // e.g., 150.500 kg
        allowNull: false,
        defaultValue: 0.000,
        field: "waste_kg",
      },
      hsnCode: {
        type: DataTypes.STRING(20),
        allowNull: true,
        trim: true,
        field: "hsn_code",
      },
      packingPreWeightment: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: "packing_pre_weightment",
      },
    },
    {
      tableName: "waste_masters",
      timestamps: true,
      indexes: [
        { unique: true, fields: ["code"] },
        { fields: ["department", "waste"] }, // composite for uniqueness/search
        { fields: ["packing_type_id"] },
        { fields: ["hsn_code"] },
      ],
    }
  );

  return WasteMaster;
};

export default WasteMasterModel;
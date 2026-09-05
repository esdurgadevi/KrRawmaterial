import { DataTypes } from "sequelize";

const VarietyModel = (sequelize) => {
  const Variety = sequelize.define(
    "Variety",
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
      variety: {
        type: DataTypes.STRING(150),
        allowNull: false,
        trim: true,
      },
      fibreId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "fibres",           // Reference to your existing fibres table
          key: "id",
        },
        onDelete: "RESTRICT",        // Prevent deleting fibre if varieties reference it
        onUpdate: "CASCADE",
        field: "fibre_id",
      },
    },
    {
      tableName: "varieties",
      timestamps: true,
      indexes: [
        { unique: true, fields: ["code"] },
        { fields: ["variety"] },
        { fields: ["fibre_id"] },
      ],
    }
  );

  return Variety;
};

export default VarietyModel;
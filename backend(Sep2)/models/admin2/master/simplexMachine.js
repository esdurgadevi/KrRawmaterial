import { DataTypes } from "sequelize";

const SimplexMachineModel = (sequelize) => {
  const SimplexMachine = sequelize.define(
    "SimplexMachine",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      mcNo: {
        type: DataTypes.STRING(50),
        allowNull: false,
        trim: true,
        comment: "Machine Number (e.g. S-01, SMX-12)",
      },
      mcId: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        trim: true,
        comment: "Unique Machine ID / Code",
      },
      description: {
        type: DataTypes.STRING(150),
        allowNull: true,
        trim: true,
      },
      feedHank: {
        type: DataTypes.DECIMAL(6, 3),   // e.g. 0.800, 1.200 hank
        allowNull: false,
        defaultValue: 0.000,
        comment: "Feed hank in Ne / hank count",
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      tableName: "simplex_machines",
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ["mcId"],
        },
        {
          fields: ["mcNo"],
        },
      ],
    }
  );

  return SimplexMachine;
};

export default SimplexMachineModel;
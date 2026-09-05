import { DataTypes } from "sequelize";

const StationModel = (sequelize) => {
  const Station = sequelize.define(
    "Station",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      code: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true, // Ensures codes are unique for scalability and data integrity
      },
      station: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      stateId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "states", // table name
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
    },
    {
      tableName: "stations",
      timestamps: true, // Maintains createdAt/updatedAt for auditing
    }
  );

  return Station;
};

export default StationModel;
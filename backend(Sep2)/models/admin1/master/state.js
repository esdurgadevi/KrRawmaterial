import { DataTypes } from "sequelize";

const StateModel = (sequelize) => {
  const State = sequelize.define(
    "State",
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
      state: {
        type: DataTypes.STRING(100),
        allowNull: false,
        trim: true,
      },
    },
    {
      tableName: "states",
      timestamps: true,
      indexes: [
        { unique: true, fields: ["code"] },
      ],
    }
  );

  return State;
};

export default StateModel;
import { DataTypes } from "sequelize";

const DepartmentKgModel = (sequelize) => {
  const DepartmentKg = sequelize.define(
    "DepartmentKg",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      department: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      kgs: {
        type: DataTypes.DECIMAL(10, 3),
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      tableName: "department_kgs",
      timestamps: true,
      indexes: [
        { fields: ["date"] },
        { fields: ["department"] },
        { fields: ["date", "department"] },
      ],
    }
  );

  return DepartmentKg;
};

export default DepartmentKgModel;
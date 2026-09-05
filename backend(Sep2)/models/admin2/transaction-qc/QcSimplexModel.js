import { DataTypes } from "sequelize";

export default (sequelize) => {
  const QcSimplex = sequelize.define(
    "QcSimplex",
    {
      entryNo: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },

      type: DataTypes.STRING,
      remarks: DataTypes.STRING,
      shift: DataTypes.INTEGER,

      // ✅ COUNT REFERENCE
      countId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "spinning_counts",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },

      // ✅ SIMPLEX REFERENCE
      simplexId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "simplex_machines",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },

      noilsPercent: DataTypes.FLOAT,
      feedHank: DataTypes.FLOAT,
      tpi: DataTypes.FLOAT,
      checkedHank: DataTypes.FLOAT,

      // Draft Section
      cp: DataTypes.FLOAT,
      brw: DataTypes.FLOAT,
      bdw: DataTypes.FLOAT,
      draft: DataTypes.FLOAT,

      // Twist Wheel
      g: DataTypes.FLOAT,
      h: DataTypes.FLOAT,
      tw: DataTypes.FLOAT,

      // Lifter Wheel
      e: DataTypes.FLOAT,
      f: DataTypes.FLOAT,
      l: DataTypes.FLOAT,

      spacer: DataTypes.STRING,
      floating: DataTypes.STRING,
      middle: DataTypes.STRING,
      back: DataTypes.STRING,

      // Wheels / Pullys
      tension: DataTypes.FLOAT,
      creelTension: DataTypes.FLOAT,
      coneDrumEnd: DataTypes.FLOAT,
      motorPully: DataTypes.FLOAT,
      machinePully: DataTypes.FLOAT,

      bottomRoll: DataTypes.STRING,
      bottomApron: DataTypes.STRING,
      topRoll: DataTypes.STRING,
      topApron: DataTypes.STRING,
      lift: DataTypes.STRING,

      flyerType: DataTypes.STRING,
      topArm: DataTypes.STRING,

      createdBy: DataTypes.INTEGER,
      updatedBy: DataTypes.INTEGER,
    },
    {
      tableName: "qc_simplex",
      timestamps: true,
    }
  );

  return QcSimplex;
};

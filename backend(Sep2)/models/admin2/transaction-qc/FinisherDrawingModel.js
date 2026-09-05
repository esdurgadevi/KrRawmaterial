import { DataTypes } from "sequelize";

export default (sequelize) => {
  const FinisherDrawing = sequelize.define(
    "FinisherDrawing",
    {
      entryNo: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },

      shift: {
        type: DataTypes.INTEGER,
      },

      type: {
        type: DataTypes.STRING,
      },

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

      averageWeight: DataTypes.FLOAT,
      hank: DataTypes.FLOAT,
      cv: DataTypes.FLOAT,

      sw: DataTypes.FLOAT,

      w1: DataTypes.FLOAT,
      w2: DataTypes.FLOAT,
      w3: DataTypes.FLOAT,
      w4: DataTypes.FLOAT,
      w5: DataTypes.FLOAT,
      w8: DataTypes.FLOAT,
      w9: DataTypes.FLOAT,

      noOfEnds: DataTypes.FLOAT,
      speed: DataTypes.FLOAT,
      setting: DataTypes.FLOAT,
      trumpet: DataTypes.FLOAT,

      breakDraft: DataTypes.FLOAT,
      totalDraft: DataTypes.FLOAT,

      createdBy: DataTypes.INTEGER,
      updatedBy: DataTypes.INTEGER,
    },
    {
      tableName: "finisher_drawings",
      timestamps: true,
    }
  );

  return FinisherDrawing;
};

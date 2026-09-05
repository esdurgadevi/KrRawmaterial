import { DataTypes } from "sequelize";

export default (sequelize) => {
  const AutoConer = sequelize.define(
    "AutoConer",
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
      mixNo: DataTypes.FLOAT,
      testNo: DataTypes.FLOAT,

      rf: DataTypes.STRING,
      side: DataTypes.STRING,

      thin: DataTypes.FLOAT,
      thick: DataTypes.FLOAT,
      neps: DataTypes.FLOAT,
      ipi: DataTypes.FLOAT,

      actCount: DataTypes.FLOAT,
      countCV: DataTypes.FLOAT,
      strength: DataTypes.FLOAT,
      strengthCV: DataTypes.FLOAT,

      uPercent: DataTypes.FLOAT,
      cvm: DataTypes.FLOAT,
      csp: DataTypes.FLOAT,
      h3: DataTypes.FLOAT,

      minus30: DataTypes.FLOAT,
      plus35: DataTypes.FLOAT,
      plus140: DataTypes.FLOAT,
      higherSensitivity: DataTypes.FLOAT,

      createdBy: DataTypes.INTEGER,
      updatedBy: DataTypes.INTEGER,
    },
    {
      tableName: "auto_coners",
      timestamps: true,
    }
  );

  return AutoConer;
};

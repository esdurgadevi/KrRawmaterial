import { DataTypes } from "sequelize";

export default (sequelize) => {
  const SpinningLongFrame = sequelize.define(
    "SpinningLongFrame",
    {
      entryNo: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },

      // REFERENCES
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

      rf: DataTypes.STRING,
      side: DataTypes.STRING,
      tpi: DataTypes.FLOAT,

      cp: DataTypes.FLOAT,
      brw: DataTypes.FLOAT,
      bdw: DataTypes.FLOAT,
      draft: DataTypes.FLOAT,

      twistA: DataTypes.FLOAT,
      twistB: DataTypes.FLOAT,
      twistC: DataTypes.FLOAT,
      twistD: DataTypes.FLOAT,

      e: DataTypes.FLOAT,
      f: DataTypes.FLOAT,
      l: DataTypes.FLOAT,

      ratchet: DataTypes.FLOAT,
      spacer: DataTypes.STRING,
      tr: DataTypes.STRING,

      bottomRoll: DataTypes.STRING,
      topRoll: DataTypes.STRING,
      bottomApron: DataTypes.STRING,
      topApron: DataTypes.STRING,
      chaseLength: DataTypes.STRING,
      spindleType: DataTypes.STRING,
      ringDiaType: DataTypes.STRING,
      lift: DataTypes.STRING,
      topArm: DataTypes.STRING,

      remarks: DataTypes.TEXT,

      createdBy: DataTypes.INTEGER,
      updatedBy: DataTypes.INTEGER,
    },
    {
      tableName: "spinning_long_frames",
      timestamps: true,
    }
  );

  return SpinningLongFrame;
};

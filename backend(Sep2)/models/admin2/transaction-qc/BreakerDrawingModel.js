import { DataTypes } from "sequelize";

export default (sequelize) => {
  const BreakerDrawing = sequelize.define(
    "BreakerDrawing",
    {
      entryNo: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },

      time: {
        type: DataTypes.TIME,
      },

      shift: {
        type: DataTypes.INTEGER,
      },

      type: {
        type: DataTypes.STRING,
      },

      // ✅ reference COUNT
      countId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "simplex_machines",
          key: "id",
        },
      },

      // ✅ reference MACHINE (simplex style)
      machineId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "simplex_machines",
          key: "id",
        },
      },

      noOfDoubling: DataTypes.FLOAT,

      awLeft: DataTypes.FLOAT,
      awRight: DataTypes.FLOAT,
      ahkLeft: DataTypes.FLOAT,
      ahkRight: DataTypes.FLOAT,

      totalDraft: DataTypes.FLOAT,
      actualDraft: DataTypes.FLOAT,
      breakDraft: DataTypes.FLOAT,

      speed: DataTypes.FLOAT,
      motorPully: DataTypes.FLOAT,

      deliverySpeedMPM: DataTypes.FLOAT,
      condenserSize: DataTypes.FLOAT,

      rollerSetting: DataTypes.FLOAT,
      feedChangeGear: DataTypes.FLOAT,
      draftChangeGear: DataTypes.FLOAT,
      draftCChangeGear: DataTypes.FLOAT,
      webTensionChangeGear: DataTypes.FLOAT,
      breakDraftChangeGearA: DataTypes.FLOAT,
      breakDraftChangeGearB: DataTypes.FLOAT,
      coilerChangeGearC: DataTypes.FLOAT,
      coilerChangeGearD: DataTypes.FLOAT,
      canChangeGearE: DataTypes.FLOAT,
      canChangeGearF: DataTypes.FLOAT,

      createdBy: DataTypes.INTEGER,
      updatedBy: DataTypes.INTEGER,
    },
    {
      tableName: "breakerDrawings",
      timestamps: true,
    }
  );

  return BreakerDrawing;
};

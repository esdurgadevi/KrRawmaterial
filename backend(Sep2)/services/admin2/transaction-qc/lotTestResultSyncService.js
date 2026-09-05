import db from "../../../models/index.js";

const { QCEntry } = db;

// These values are owned by Admin 1.  QC-only measurements are deliberately
// absent, so updating a lot test never clears measurements entered in QC.
const toOptionalNumber = (value, label) => {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  if (!Number.isFinite(number)) throw new Error(`${label} must be numeric to sync to QC`);
  return number;
};

const toOptionalInteger = (value, label) => {
  const number = toOptionalNumber(value, label);
  if (number !== null && !Number.isInteger(number)) {
    throw new Error(`${label} must be a whole number to sync to QC`);
  }
  return number;
};

const calculateFQI = (twoPointFiveMm, strMode, strength, strength1, mr, mic) => {
  const t25 = Number(twoPointFiveMm);
  const mRatio = Number(mr);
  const mMic = Number(mic);
  const rawStr = Number(strength);
  
  if (!t25 || !mRatio || !mMic || !rawStr || mMic <= 0) return null;

  let effStrength = rawStr;
  if (strMode === "HVI") {
    effStrength = strength1 ? Number(strength1) : (rawStr / 1.28);
  }

  const fqiVal = (t25 * 0.46 * effStrength * mRatio) / mMic;
  return Number.isFinite(fqiVal) ? Number(fqiVal.toFixed(3)) : null;
};

const toQCFields = (lotTestResult, lot) => {
  const strMode = lotTestResult.strMode || "HVI";
  const twoPointFiveMm = lotTestResult.twoPointFive;
  const strength = lotTestResult.strength;
  const strength1 = lotTestResult.strength1;
  const mr = lotTestResult.mr;
  const mic = lotTestResult.mic;

  const calculatedFqi = calculateFQI(twoPointFiveMm, strMode, strength, strength1, mr, mic);

  return {
    inwardLotId: lotTestResult.lotId,
    lotNo: lot.lotNo,
    testDate: lot.lotDate,
    rd: lotTestResult.rd,
    staple: lotTestResult.staple,
    plusB: lotTestResult.plusB,
    moist: lotTestResult.moist,
    mr: lotTestResult.mr,
    ui: lotTestResult.ui,
    eLog: lotTestResult.eLog,
    strength: lotTestResult.strength,
    mic: lotTestResult.mic,
    sci: toOptionalInteger(lotTestResult.sci, "SCI"),
    grade: lotTestResult.grade,
    ml50: lotTestResult.ml50,
    strMode,
    conStaple: toOptionalNumber(lotTestResult.conStaple, "Con. Staple"),
    twoPointFiveMm,
    sfcStaple: 0,
    sfcCW: 0,
    tsfW: 0,
    sfcN: 0,
    tsfN: 0,
    neps: 0,
    ...(calculatedFqi !== null && { fqi: calculatedFqi }),
  };
};

export const syncLotTestResultToQC = async (lotTestResult, lot, transaction) => {
  if (!lot?.lotDate) {
    throw new Error("Inward lot must have a lotDate before its test result can be synced to QC");
  }

  const qcFields = toQCFields(lotTestResult, lot);
  const [qcEntry, created] = await QCEntry.findOrCreate({
    where: { inwardLotId: lotTestResult.lotId },
    defaults: qcFields,
    transaction,
  });

  if (!created) {
    await qcEntry.update(qcFields, { transaction });
  }

  return qcEntry;
};

export const deleteQCEntryForLot = async (lotId, transaction) => {
  await QCEntry.destroy({ where: { inwardLotId: lotId }, transaction });
};

export const backfillAllLotTestResultsToQC = async () => {
  try {
    const { LotTestResult, InwardLot } = db;
    if (!LotTestResult || !InwardLot) return;

    const allResults = await LotTestResult.findAll({
      include: [{ model: InwardLot, as: "lot" }],
    });

    let count = 0;
    for (const record of allResults) {
      if (record.lot) {
        await syncLotTestResultToQC(record, record.lot);
        count++;
      }
    }
    console.log(`✅ Backfilled ${count} Lot Test Results to QC Entries`);
  } catch (error) {
    console.error("⚠️ Failed to backfill Lot Test Results to QC:", error.message);
  }
};

export { toQCFields };

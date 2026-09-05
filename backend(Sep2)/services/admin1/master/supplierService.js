import db from "../../../models/index.js";


const { Supplier, State } = db;

export const createSupplier = async (data) => {
  const { code, accountName } = data;

  if (!code || !accountName) {
    throw new Error("Code and Account Name are required");
  }

  const existing = await Supplier.findOne({ where: { code } });
  if (existing) {
    throw new Error("Supplier code already exists");
  }

  // Optional: Validate state exists if provided
  if (data.stateId) {
    const stateExists = await State.findByPk(data.stateId);
    if (!stateExists) throw new Error("Selected state not found");
  }

  return await Supplier.create({
    code: code.trim(),
    accountGroup: data.accountGroup?.trim() || "CREDITORS - COTTON",
    accountName: accountName.trim(),
    place: data.place?.trim(),
    address: data.address?.trim(),
    deliveryAddress: data.deliveryAddress?.trim(),
    pincode: data.pincode || "0",
    stateId: data.stateId || null,
    tinNo: data.tinNo?.trim(),
    cstNo: data.cstNo?.trim(),
    gstNo: data.gstNo?.trim(),
    phoneNo: data.phoneNo?.trim(),
    cellNo: data.cellNo?.trim(),
    email: data.email?.trim(),
    website: data.website?.trim(),
    contactPerson: data.contactPerson?.trim(),
    fax: data.fax?.trim(),
    accountNo: data.accountNo?.trim(),
    openingCredit: parseFloat(data.openingCredit || 0),
    openingDebit: parseFloat(data.openingDebit || 0),
  });
};

export const getAllSuppliers = async () => {
  return await Supplier.findAll({
    include: [{ model: State, as: "state", attributes: ["id", "state"] }],
    order: [["code", "ASC"]],
  });
};

export const getSupplierById = async (id) => {
  const supplier = await Supplier.findByPk(id, {
    include: [{ model: State, as: "state", attributes: ["id", "state"] }],
  });
  if (!supplier) {
    throw new Error("Supplier not found");
  }
  return supplier;
};

export const updateSupplier = async (id, data) => {
  const supplier = await Supplier.findByPk(id);
  if (!supplier) {
    throw new Error("Supplier not found");
  }

  if (data.code && data.code !== supplier.code) {
    const existing = await Supplier.findOne({
      where: { code: data.code, id: { [db.Sequelize.Op.ne]: id } },
    });
    if (existing) {
      throw new Error("Supplier code already in use");
    }
  }

  if (data.stateId && data.stateId !== supplier.stateId) {
    const stateExists = await State.findByPk(data.stateId);
    if (!stateExists) throw new Error("Selected state not found");
  }

  return await supplier.update({
    code: data.code !== undefined ? data.code.trim() : supplier.code,
    accountGroup: data.accountGroup ? data.accountGroup.trim() : supplier.accountGroup,
    accountName: data.accountName ? data.accountName.trim() : supplier.accountName,
    place: data.place !== undefined ? (data.place ? data.place.trim() : null) : supplier.place,
    address: data.address !== undefined ? (data.address ? data.address.trim() : null) : supplier.address,
    deliveryAddress: data.deliveryAddress !== undefined ? (data.deliveryAddress ? data.deliveryAddress.trim() : null) : supplier.deliveryAddress,
    pincode: data.pincode !== undefined ? data.pincode : supplier.pincode,
    stateId: data.stateId !== undefined ? data.stateId : supplier.stateId,
    tinNo: data.tinNo !== undefined ? (data.tinNo ? data.tinNo.trim() : null) : supplier.tinNo,
    cstNo: data.cstNo !== undefined ? (data.cstNo ? data.cstNo.trim() : null) : supplier.cstNo,
    gstNo: data.gstNo !== undefined ? (data.gstNo ? data.gstNo.trim() : null) : supplier.gstNo,
    phoneNo: data.phoneNo !== undefined ? (data.phoneNo ? data.phoneNo.trim() : null) : supplier.phoneNo,
    cellNo: data.cellNo !== undefined ? (data.cellNo ? data.cellNo.trim() : null) : supplier.cellNo,
    email: data.email !== undefined ? (data.email ? data.email.trim() : null) : supplier.email,
    website: data.website !== undefined ? (data.website ? data.website.trim() : null) : supplier.website,
    contactPerson: data.contactPerson !== undefined ? (data.contactPerson ? data.contactPerson.trim() : null) : supplier.contactPerson,
    fax: data.fax !== undefined ? (data.fax ? data.fax.trim() : null) : supplier.fax,
    accountNo: data.accountNo !== undefined ? (data.accountNo ? data.accountNo.trim() : null) : supplier.accountNo,
    openingCredit: data.openingCredit !== undefined ? parseFloat(data.openingCredit) : supplier.openingCredit,
    openingDebit: data.openingDebit !== undefined ? parseFloat(data.openingDebit) : supplier.openingDebit,
  });
};

export const deleteSupplier = async (id) => {
  const supplier = await Supplier.findByPk(id);
  if (!supplier) {
    throw new Error("Supplier not found");
  }
  await supplier.destroy();
};

export const bulkImportSuppliers = async (items = []) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("No data provided for bulk import");
  }

  const existingSuppliers = await Supplier.findAll({ raw: true });
  let maxCode = existingSuppliers.reduce((max, r) => {
    const num = parseInt(r.code, 10);
    return !isNaN(num) ? Math.max(max, num) : max;
  }, 0);

  let nextCodeNum = Math.max(maxCode + 1, 33);
  const existingNames = new Set(
    existingSuppliers.map((s) => s.accountName.trim().toUpperCase())
  );

  const recordsToInsert = [];
  let skippedCount = 0;

  for (const item of items) {
    const partyName = String(item.partyName || item.accountName || "").trim().slice(0, 150);
    const place = String(item.place || "").trim().slice(0, 100) || "N/A";

    if (!partyName) continue;

    let phoneNo = item.phoneNo ? String(item.phoneNo).trim() : "";
    if (phoneNo === "-") phoneNo = "";

    let email = item.email ? String(item.email).trim() : null;
    if (!email || email === "-" || !email.includes("@")) email = null;

    let fax = item.fax ? String(item.fax).trim() : "";
    if (fax === "-") fax = "";

    const key = partyName.toUpperCase();
    if (existingNames.has(key)) {
      skippedCount++;
      continue;
    }

    recordsToInsert.push({
      code: String(nextCodeNum),
      accountGroup: "Creditars_cotton",
      accountName: partyName,
      place,
      address: item.address ? String(item.address).trim() : null,
      deliveryAddress: item.deliveryAddress ? String(item.deliveryAddress).trim() : null,
      pincode: item.pincode ? String(item.pincode).trim() : "0",
      stateId: item.stateId ? Number(item.stateId) : null,
      tinNo: item.tinNo ? String(item.tinNo).trim() : null,
      cstNo: item.cstNo ? String(item.cstNo).trim() : null,
      gstNo: item.gstNo ? String(item.gstNo).trim() : null,
      phoneNo: phoneNo ? phoneNo.slice(0, 20) : null,
      cellNo: item.cellNo ? String(item.cellNo).trim().slice(0, 20) : null,
      email: email ? email.slice(0, 150) : null,
      website: item.website ? String(item.website).trim().slice(0, 200) : null,
      contactPerson: item.contactPerson ? String(item.contactPerson).trim().slice(0, 100) : null,
      fax: fax ? fax.slice(0, 50) : null,
      accountNo: item.accountNo ? String(item.accountNo).trim().slice(0, 50) : null,
      openingCredit: parseFloat(item.openingCredit || 0),
      openingDebit: parseFloat(item.openingDebit || 0),
    });

    existingNames.add(key);
    nextCodeNum++;
  }

  if (recordsToInsert.length > 0) {
    await Supplier.bulkCreate(recordsToInsert);
  }

  return {
    importedCount: recordsToInsert.length,
    skippedCount,
  };
};
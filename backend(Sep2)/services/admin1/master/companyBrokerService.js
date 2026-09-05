import db from "../../../models/index.js";


const { CompanyBroker } = db;

export const createCompanyBroker = async (data) => {
  const { code, companyName, shortDesc, address } = data;

  if (!code || !companyName) {
    throw new Error("Code and Company Name are required");
  }

  const existing = await CompanyBroker.findOne({ where: { code } });
  if (existing) {
    throw new Error("Company broker code already exists");
  }

  return await CompanyBroker.create({
    code,
    companyName: companyName.trim(),
    shortDesc: shortDesc ? shortDesc.trim() : null,
    address: address ? address.trim() : null,
  });
};

export const getAllCompanyBrokers = async () => {
  return await CompanyBroker.findAll({
    order: [["code", "ASC"]],
  });
};

export const getCompanyBrokerById = async (id) => {
  const broker = await CompanyBroker.findByPk(id);
  if (!broker) {
    throw new Error("Company broker not found");
  }
  return broker;
};

export const updateCompanyBroker = async (id, data) => {
  const broker = await CompanyBroker.findByPk(id);
  if (!broker) {
    throw new Error("Company broker not found");
  }

  if (data.code && data.code !== broker.code) {
    const existing = await CompanyBroker.findOne({
      where: { code: data.code, id: { [db.Sequelize.Op.ne]: id } },
    });
    if (existing) {
      throw new Error("Company broker code already in use");
    }
  }

  return await broker.update({
    code: data.code !== undefined ? data.code : broker.code,
    companyName: data.companyName ? data.companyName.trim() : broker.companyName,
    shortDesc:
      data.shortDesc !== undefined
        ? data.shortDesc
          ? data.shortDesc.trim()
          : null
        : broker.shortDesc,
    address:
      data.address !== undefined
        ? data.address
          ? data.address.trim()
          : null
        : broker.address,
  });
};

export const deleteCompanyBroker = async (id) => {
  const broker = await CompanyBroker.findByPk(id);
  if (!broker) {
    throw new Error("Company broker not found");
  }
  await broker.destroy();
};
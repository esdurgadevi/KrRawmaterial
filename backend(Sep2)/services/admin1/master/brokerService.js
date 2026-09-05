import db from "../../../models/index.js";


const { Broker } = db;

export const createBroker = async (data) => {
  if (!data.brokerCode || !data.brokerName) {
    throw new Error("Broker code and broker name are required");
  }

  const existing = await Broker.findOne({ where: { brokerCode: data.brokerCode } });
  if (existing) {
    throw new Error("Broker code already exists");
  }

  return await Broker.create({
    brokerCode: data.brokerCode,
    brokerName: data.brokerName.trim(),
    shortDesc: data.shortDesc ? data.shortDesc.trim() : null,
    address: data.address ? data.address.trim() : null,
  });
};

export const getAllBrokers = async () => {
  return await Broker.findAll({
    order: [["brokerCode", "ASC"]],
  });
};

export const getBrokerById = async (id) => {
  const broker = await Broker.findByPk(id);
  if (!broker) {
    throw new Error("Broker not found");
  }
  return broker;
};

export const updateBroker = async (id, data) => {
  const broker = await Broker.findByPk(id);
  if (!broker) {
    throw new Error("Broker not found");
  }

  if (data.brokerCode && data.brokerCode !== broker.brokerCode) {
    const existing = await Broker.findOne({
      where: {
        brokerCode: data.brokerCode,
        id: { [db.Sequelize.Op.ne]: id },
      },
    });
    if (existing) {
      throw new Error("Broker code already in use");
    }
  }

  return await broker.update({
    brokerCode: data.brokerCode !== undefined ? data.brokerCode : broker.brokerCode,
    brokerName: data.brokerName ? data.brokerName.trim() : broker.brokerName,
    shortDesc: data.shortDesc !== undefined ? (data.shortDesc ? data.shortDesc.trim() : null) : broker.shortDesc,
    address: data.address !== undefined ? (data.address ? data.address.trim() : null) : broker.address,
  });
};

export const deleteBroker = async (id) => {
  const broker = await Broker.findByPk(id);
  if (!broker) {
    throw new Error("Broker not found");
  }
  await broker.destroy();
};
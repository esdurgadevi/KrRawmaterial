import db from "../../../models/index.js";


const { Transport } = db;

export const createTransport = async (data) => {
  if (!data.transportCode || !data.transportName || !data.place) {
    throw new Error("Transport code, name, and place are required");
  }

  const existing = await Transport.findOne({ 
    where: { transportCode: data.transportCode } 
  });
  if (existing) {
    throw new Error("Transport code already exists");
  }

  return await Transport.create({
    transportCode: data.transportCode,
    transportName: data.transportName.trim(),
    place: data.place.trim(),
    address: data.address ? data.address.trim() : null,
  });
};

export const getAllTransports = async () => {
  return await Transport.findAll({
    order: [["transportCode", "ASC"]],
  });
};

export const getTransportById = async (id) => {
  const transport = await Transport.findByPk(id);
  if (!transport) {
    throw new Error("Transport not found");
  }
  return transport;
};

export const updateTransport = async (id, data) => {
  const transport = await Transport.findByPk(id);
  if (!transport) {
    throw new Error("Transport not found");
  }

  if (data.transportCode && data.transportCode !== transport.transportCode) {
    const existing = await Transport.findOne({
      where: {
        transportCode: data.transportCode,
        id: { [db.Sequelize.Op.ne]: id },
      },
    });
    if (existing) {
      throw new Error("Transport code already in use");
    }
  }

  return await transport.update({
    transportCode: data.transportCode !== undefined ? data.transportCode : transport.transportCode,
    transportName: data.transportName ? data.transportName.trim() : transport.transportName,
    place: data.place ? data.place.trim() : transport.place,
    address: data.address !== undefined ? (data.address ? data.address.trim() : null) : transport.address,
  });
};

export const deleteTransport = async (id) => {
  const transport = await Transport.findByPk(id);
  if (!transport) {
    throw new Error("Transport not found");
  }
  await transport.destroy();
};
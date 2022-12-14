const uuid = require('uuid');
const path = require('path');
const { Device, DeviceInfo } = require('../models/models');
const ApiError = require('../error/ApiError');

class DeviceController {
  async create(req, res, next) {
    try {
      const { name, price, BrandId, TypeId, info } = req.body;
      const { img } = req.files;
      let fileName = uuid.v4() + '.jpg';
      img.mv(path.resolve(__dirname, '..', 'static', fileName));
      const device = await Device.create({ name, price, BrandId, TypeId, img: fileName });

      if (info) {
        info = JSON.parse(info);
        info.forEach((i) => {
          DeviceInfo.create({ title: i.title, description: i.description, DeviceId: device.id });
        });
      }

      return res.json(device);
    } catch (error) {
      next(ApiError.badRequest(error.message));
    }
  }
  async getAll(req, res) {
    let { TypeId, BrandId, limit, page } = req.query;
    page = page || 1;
    limit = limit || 9;
    let offset = page * limit - limit;
    let devices;
    if (TypeId && !BrandId) {
      devices = await Device.findAndCountAll({ where: { TypeId }, limit, offset });
    } else if (!TypeId && BrandId) {
      devices = await Device.findAndCountAll({ where: { BrandId }, limit, offset });
    } else if (!TypeId && !BrandId) {
      devices = await Device.findAndCountAll({ limit, offset });
    } else if (TypeId && BrandId) {
      devices = await Device.findAndCountAll({ where: { TypeId, BrandId }, limit, offset });
    }

    return res.json(devices);
  }
  async getOne(req, res) {
    const { id } = req.params;
    const device = await Device.findOne({
      where: { id },
      include: [{ model: DeviceInfo, as: 'info' }],
    });
    return res.json(device);
  }
}

module.exports = new DeviceController();

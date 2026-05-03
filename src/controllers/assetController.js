const Asset = require('../models/Asset');
const Department = require('../models/Department');

const normalizeDepartmentName = (value) => {
  if (typeof value !== 'string') return '';

  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ');
};

const resolveDepartmentIdFromBody = async (body) => {
  if (!body || typeof body !== 'object') return;

  if (body.departmentId) return;

  if (typeof body.department === 'string' && body.department.trim()) {
    const normalizedName = normalizeDepartmentName(body.department);
    const department = await Department.findOne({ normalizedName });
    if (department) {
      body.departmentId = department._id;
    }
  }
};

const serializeAsset = (asset) => {
  if (!asset) return asset;
  const obj = typeof asset.toObject === 'function' ? asset.toObject() : asset;

  if (obj.departmentId && typeof obj.departmentId === 'object' && obj.departmentId._id) {
    obj.department = obj.departmentId;
  }

  return obj;
};

exports.createAsset = async (req, res) => {
  try {
    await resolveDepartmentIdFromBody(req.body);
    const asset = await Asset.create(req.body);
    const populated = await Asset.findById(asset._id)
      .populate('ownerUser', '-password')
      .populate('departmentId', 'name active');
    res.status(201).json({ success: true, asset: serializeAsset(populated || asset) });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Erro ao criar patrimônio', error: error.message });
  }
};

exports.getAssets = async (req, res) => {
  try {
    const { type, status, department, departmentId, ownerUser } = req.query;
    const query = {};

    if (type) query.type = type;
    if (status) query.status = status;
    if (department) query.department = department;
    if (departmentId) query.departmentId = departmentId;
    if (ownerUser) query.ownerUser = ownerUser;

    const assets = await Asset.find(query)
      .populate('ownerUser', '-password')
      .populate('departmentId', 'name active');
    res.status(200).json({ success: true, count: assets.length, assets: assets.map(serializeAsset) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao listar patrimônios', error: error.message });
  }
};

exports.getAssetById = async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id)
      .populate('ownerUser', '-password')
      .populate('departmentId', 'name active');
    if (!asset) {
      return res.status(404).json({ success: false, message: 'Patrimônio não encontrado' });
    }
    res.status(200).json({ success: true, asset: serializeAsset(asset) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao obter patrimônio', error: error.message });
  }
};

exports.updateAsset = async (req, res) => {
  try {
    await resolveDepartmentIdFromBody(req.body);
    const asset = await Asset.findOneAndUpdate(
      { _id: req.params.id },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!asset) {
      return res.status(404).json({ success: false, message: 'Patrimônio não encontrado' });
    }

    const populated = await Asset.findById(asset._id)
      .populate('ownerUser', '-password')
      .populate('departmentId', 'name active');

    res.status(200).json({ success: true, asset: serializeAsset(populated || asset) });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Erro ao atualizar patrimônio', error: error.message });
  }
};

exports.deleteAsset = async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);

    if (!asset) {
      return res.status(404).json({ success: false, message: 'Patrimônio não encontrado' });
    }

    await asset.deleteOne();

    res.status(200).json({ success: true, message: 'Patrimônio excluído com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao excluir patrimônio', error: error.message });
  }
};

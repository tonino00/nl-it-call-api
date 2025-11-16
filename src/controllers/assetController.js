const Asset = require('../models/Asset');

exports.createAsset = async (req, res) => {
  try {
    const asset = await Asset.create(req.body);
    res.status(201).json({ success: true, asset });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Erro ao criar patrimônio', error: error.message });
  }
};

exports.getAssets = async (req, res) => {
  try {
    const { type, status, department, ownerUser } = req.query;
    const query = {};

    if (type) query.type = type;
    if (status) query.status = status;
    if (department) query.department = department;
    if (ownerUser) query.ownerUser = ownerUser;

    const assets = await Asset.find(query).populate('ownerUser', '-password');
    res.status(200).json({ success: true, count: assets.length, assets });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao listar patrimônios', error: error.message });
  }
};

exports.getAssetById = async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id).populate('ownerUser', '-password');
    if (!asset) {
      return res.status(404).json({ success: false, message: 'Patrimônio não encontrado' });
    }
    res.status(200).json({ success: true, asset });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao obter patrimônio', error: error.message });
  }
};

exports.updateAsset = async (req, res) => {
  try {
    const asset = await Asset.findOneAndUpdate(
      { _id: req.params.id },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!asset) {
      return res.status(404).json({ success: false, message: 'Patrimônio não encontrado' });
    }

    res.status(200).json({ success: true, asset });
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

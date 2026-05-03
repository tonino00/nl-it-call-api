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

exports.getDepartments = async (req, res) => {
  try {
    const { active, search } = req.query;
    const query = {};

    if (active !== undefined) {
      query.active = active === 'true';
    }

    if (search) {
      const normalizedSearch = normalizeDepartmentName(search);
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { normalizedName: { $regex: normalizedSearch, $options: 'i' } }
      ];
    }

    const departments = await Department.find(query).sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: departments.length,
      departments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao listar departamentos',
      error: error.message
    });
  }
};

exports.getDepartmentById = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Departamento não encontrado'
      });
    }

    res.status(200).json({
      success: true,
      department
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao obter departamento',
      error: error.message
    });
  }
};

exports.createDepartment = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Nome do departamento é obrigatório'
      });
    }

    const normalizedName = normalizeDepartmentName(name);
    const existing = await Department.findOne({ normalizedName });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Departamento com este nome já existe'
      });
    }

    const department = await Department.create({ name });

    res.status(201).json({
      success: true,
      department
    });
  } catch (error) {
    let statusCode = 500;

    if (error && error.code === 11000) {
      statusCode = 400;
    }

    res.status(statusCode).json({
      success: false,
      message: 'Erro ao criar departamento',
      error: error.message
    });
  }
};

exports.updateDepartment = async (req, res) => {
  try {
    const { name } = req.body;

    let department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Departamento não encontrado'
      });
    }

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Nome do departamento é obrigatório'
      });
    }

    const normalizedName = normalizeDepartmentName(name);
    const existing = await Department.findOne({ normalizedName, _id: { $ne: department._id } });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Departamento com este nome já existe'
      });
    }

    department = await Department.findByIdAndUpdate(
      req.params.id,
      { $set: { name } },
      { new: true, runValidators: true }
    );

    const freshDepartment = await Department.findById(department._id);

    res.status(200).json({
      success: true,
      department: freshDepartment || department
    });
  } catch (error) {
    let statusCode = 500;

    if (error && error.code === 11000) {
      statusCode = 400;
    }

    res.status(statusCode).json({
      success: false,
      message: 'Erro ao atualizar departamento',
      error: error.message
    });
  }
};

exports.patchDepartment = async (req, res) => {
  try {
    const { active } = req.body;

    if (active === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Campo active é obrigatório'
      });
    }

    const department = await Department.findByIdAndUpdate(
      req.params.id,
      { $set: { active: Boolean(active) } },
      { new: true, runValidators: true }
    );

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Departamento não encontrado'
      });
    }

    res.status(200).json({
      success: true,
      department
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar departamento',
      error: error.message
    });
  }
};

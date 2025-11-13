const Category = require('../models/Category');

// @desc    Obter todas as categorias
// @route   GET /api/categories
// @access  Privado
exports.getCategories = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    
    const query = {};
    
    // Filtros opcionais
    if (req.query.isActive) {
      query.isActive = req.query.isActive === 'true';
    }
    
    if (req.query.priority) {
      query.priority = req.query.priority;
    }
    
    // Buscar contagem total para paginação
    const total = await Category.countDocuments(query);
    
    // Buscar categorias com paginação
    const categories = await Category.find(query)
      .sort({ name: 1 })
      .skip(startIndex)
      .limit(limit);
    
    // Informações de paginação
    const pagination = {
      totalItems: total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      itemsPerPage: limit,
    };
    
    res.status(200).json({
      success: true,
      count: categories.length,
      pagination,
      categories
    });
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar categorias',
      error: error.message
    });
  }
};

// @desc    Obter categoria por ID
// @route   GET /api/categories/:id
// @access  Privado
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Categoria não encontrada'
      });
    }
    
    res.status(200).json({
      success: true,
      category
    });
  } catch (error) {
    console.error('Erro ao buscar categoria:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Categoria não encontrada'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar categoria',
      error: error.message
    });
  }
};

// @desc    Criar nova categoria
// @route   POST /api/categories
// @access  Privado/Admin e Support
exports.createCategory = async (req, res) => {
  try {
    const { name, description, priority, slaTime } = req.body;
    
    // Verificar se a categoria já existe
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Categoria com este nome já existe'
      });
    }
    
    // Criar nova categoria
    const category = await Category.create({
      name,
      description,
      priority,
      slaTime
    });
    
    res.status(201).json({
      success: true,
      category
    });
  } catch (error) {
    console.error('Erro ao criar categoria:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar categoria',
      error: error.message
    });
  }
};

// @desc    Atualizar categoria
// @route   PUT /api/categories/:id
// @access  Privado/Admin e Support
exports.updateCategory = async (req, res) => {
  try {
    const { name, description, isActive, priority, slaTime } = req.body;
    
    let category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Categoria não encontrada'
      });
    }
    
    // Verificar se o nome já está em uso por outra categoria
    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({ name });
      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: 'Este nome de categoria já está em uso'
        });
      }
    }
    
    // Campos a atualizar
    const updateFields = {};
    if (name) updateFields.name = name;
    if (description) updateFields.description = description;
    if (isActive !== undefined) updateFields.isActive = isActive;
    if (priority) updateFields.priority = priority;
    if (slaTime) updateFields.slaTime = slaTime;
    
    // Atualizar categoria
    category = await Category.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      category
    });
  } catch (error) {
    console.error('Erro ao atualizar categoria:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar categoria',
      error: error.message
    });
  }
};

// @desc    Excluir categoria
// @route   DELETE /api/categories/:id
// @access  Privado/Admin
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Categoria não encontrada'
      });
    }
    
    await category.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Categoria excluída com sucesso'
    });
  } catch (error) {
    console.error('Erro ao excluir categoria:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao excluir categoria',
      error: error.message
    });
  }
};

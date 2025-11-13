const User = require('../models/User');

// @desc    Obter todos os usuários
// @route   GET /api/users
// @access  Privado/Admin
exports.getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    
    const query = {};
    
    // Filtros adicionais se fornecidos
    if (req.query.role) query.role = req.query.role;
    if (req.query.department) query.department = req.query.department;
    
    // Buscar contagem total para paginação
    const total = await User.countDocuments(query);
    
    // Buscar usuários com paginação
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);
    
    // Construir informações de paginação
    const pagination = {
      totalItems: total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      itemsPerPage: limit,
    };
    
    res.status(200).json({
      success: true,
      count: users.length,
      pagination,
      users
    });
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar usuários',
      error: error.message
    });
  }
};

// @desc    Obter usuário por ID
// @route   GET /api/users/:id
// @access  Privado/Admin
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }
    
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    
    // Verificar se o erro é por ID inválido
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar usuário',
      error: error.message
    });
  }
};

// @desc    Criar novo usuário (por administrador)
// @route   POST /api/users
// @access  Privado/Admin
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, department, phone } = req.body;
    
    // Verificar se o usuário já existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Este email já está em uso'
      });
    }
    
    // Criar novo usuário
    const user = await User.create({
      name,
      email,
      password,
      role,
      department,
      phone
    });
    
    res.status(201).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        phone: user.phone,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar usuário',
      error: error.message
    });
  }
};

// @desc    Atualizar usuário
// @route   PUT /api/users/:id
// @access  Privado/Admin
exports.updateUser = async (req, res) => {
  try {
    const { name, email, role, department, phone, password } = req.body;
    
    // Buscar o usuário
    let user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }
    
    // Verificar se o email já está em uso por outro usuário
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Este email já está em uso'
        });
      }
    }
    
    // Construir objeto com campos a serem atualizados
    const updateFields = {};
    if (name) updateFields.name = name;
    if (email) updateFields.email = email;
    if (role) updateFields.role = role;
    if (department) updateFields.department = department;
    if (phone) updateFields.phone = phone;
    
    // Se estiver atualizando a senha
    if (password) {
      user.password = password;
      await user.save();
    }
    
    // Atualizar os outros campos
    user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select('-password');
    
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar usuário',
      error: error.message
    });
  }
};

// @desc    Excluir usuário
// @route   DELETE /api/users/:id
// @access  Privado/Admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }
    
    // Verificar se o usuário não está tentando excluir a si mesmo
    if (req.user.id === req.params.id) {
      return res.status(400).json({
        success: false,
        message: 'Você não pode excluir sua própria conta'
      });
    }
    
    await user.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Usuário excluído com sucesso'
    });
  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao excluir usuário',
      error: error.message
    });
  }
};

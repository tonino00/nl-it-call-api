const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

// Gerar token JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRATION || '24h',
  });
};

// @desc    Registrar novo usuário
// @route   POST /api/users/register
// @access  Público
exports.register = async (req, res) => {
  try {
    const { name, email, password, department, phone } = req.body;

    // Verificar se o usuário já existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Este email já está em uso',
      });
    }

    // Criar novo usuário (por padrão role será 'user')
    const user = await User.create({
      name,
      email,
      password,
      department,
      phone,
    });

    // Gerar token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao registrar usuário',
      error: error.message,
    });
  }
};

// @desc    Login de usuário
// @route   POST /api/users/login
// @access  Público
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validar email e senha
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Por favor, informe email e senha',
      });
    }

    // Verificar se o usuário existe
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas',
      });
    }

    // Verificar se a senha está correta
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas',
      });
    }

    // Gerar token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao processar login',
      error: error.message,
    });
  }
};

// @desc    Obter perfil do usuário logado
// @route   GET /api/users/profile
// @access  Privado
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado',
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        phone: user.phone,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar perfil',
      error: error.message,
    });
  }
};

// @desc    Atualizar perfil do usuário
// @route   PUT /api/users/profile
// @access  Privado
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, department, phone, password } = req.body;
    
    // Construir objeto com campos a serem atualizados
    const updateFields = {};
    if (name) updateFields.name = name;
    if (email) updateFields.email = email;
    if (department) updateFields.department = department;
    if (phone) updateFields.phone = phone;
    
    // Se o usuário estiver atualizando a senha
    if (password) {
      // Buscar o usuário para usar o método de pré-save para hash da senha
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado',
        });
      }
      
      user.password = password;
      await user.save();
    }
    
    // Atualizar os outros campos
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        department: updatedUser.department,
        phone: updatedUser.phone,
      },
    });
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar perfil',
      error: error.message,
    });
  }
};

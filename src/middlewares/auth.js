const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

// Middleware para verificar se o usuário está autenticado
exports.protect = async (req, res, next) => {
  let token;
  
  // Verificar se o token está presente no header Authorization
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Obter o token do header
      token = req.headers.authorization.split(' ')[1];
      
      // Verificar o token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Adicionar o usuário ao objeto request
      req.user = await User.findById(decoded.id).select('-password');
      
      next();
    } catch (error) {
      console.error('Erro de autenticação:', error);
      res.status(401).json({ 
        success: false, 
        message: 'Token inválido ou expirado' 
      });
    }
  } else {
    res.status(401).json({ 
      success: false, 
      message: 'Acesso não autorizado. É necessário um token de autenticação'
    });
  }
};

// Middleware para verificar papéis de usuário
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Acesso não autorizado' 
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Você não tem permissão para realizar esta ação' 
      });
    }
    
    next();
  };
};

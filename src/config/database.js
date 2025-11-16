const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    // Verificar se a URI está definida
    if (!process.env.MONGODB_URI) {
      throw new Error('A variável de ambiente MONGODB_URI não está definida');
    }
    
    console.log('Tentando conectar ao MongoDB...');
    
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000, // Timeout de 30 segundos
      socketTimeoutMS: 45000, // Timeout de 45 segundos para operações de socket
    });
    
    console.log('MongoDB conectado com sucesso');
  } catch (error) {
    console.error('Erro ao conectar ao MongoDB:', error.message);
    console.error('Detalhes do erro:', error);
    
    if (error.name === 'MongoServerSelectionError') {
      console.error('Não foi possível selecionar um servidor MongoDB. Verifique:');
      console.error('1. Se seu IP está na lista de permissões do MongoDB Atlas');
      console.error('2. Se a string de conexão está correta');
      console.error('3. Se o cluster está ativo e acessível');
    }
    
    // Não encerra o processo para permitir testes sem MongoDB
    // process.exit(1);
    throw error;
  }
};

module.exports = connectDB;

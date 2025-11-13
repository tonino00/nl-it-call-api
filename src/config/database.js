const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB conectado com sucesso');
  } catch (error) {
    console.error('Erro ao conectar ao MongoDB:', error.message);
    // Não encerra o processo para permitir testes sem MongoDB
    // process.exit(1);
    throw error;
  }
};

module.exports = connectDB;

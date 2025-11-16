const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const swaggerDocs = require('./config/swagger');
require('dotenv').config();

// Inicializar express
const app = express();

// Tentar conectar ao banco de dados, mas continuar mesmo se falhar
try {
  connectDB();
} catch (error) {
  console.log('Aviso: Continuando sem conexão com o MongoDB');
}

// Middleware
app.use(cors());
app.use(express.json());

// Rota base
app.get('/', (req, res) => {
  res.json({ message: 'Bem-vindo à API de Gerenciamento de Chamados de TI' });
});

// Rotas da API
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/tickets', require('./routes/ticketRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/assets', require('./routes/assetRoutes'));

// Configuração do Swagger
swaggerDocs(app);

// Tratamento de erros 404
app.use((req, res, next) => {
  res.status(404).json({ message: 'Rota não encontrada' });
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Erro interno no servidor',
  });
});

// Porta do servidor
const PORT = process.env.PORT || 3000;

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

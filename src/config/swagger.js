const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Gerenciamento de Chamados de TI',
      version: '1.0.0',
      description: 'API RESTful para gerenciar chamados de suporte de TI',
      contact: {
        name: 'Suporte',
        email: 'suporte@exemplo.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de desenvolvimento',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routes/*.js'], // Caminho para os arquivos com as anotações de rotas
};

const swaggerSpec = swaggerJSDoc(options);

const swaggerDocs = (app) => {
  // Rota para a documentação Swagger
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  
  // Endpoint para o arquivo JSON da especificação Swagger
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
  
  console.log('Documentação Swagger disponível em /api-docs');
};

module.exports = swaggerDocs;

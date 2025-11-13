# API de Gerenciamento de Chamados de TI

API RESTful para gerenciamento de chamados de suporte de TI, desenvolvida com Node.js, Express e MongoDB.

## Funcionalidades

- Autenticação de usuários com JWT
- Gerenciamento de usuários (admin, suporte, usuário comum)
- Gerenciamento de categorias de chamados
- Criação e acompanhamento de chamados
- Sistema de comentários em chamados
- Métricas e relatórios de chamados
- Documentação completa com Swagger

## Pré-requisitos

- Node.js (v14+)
- MongoDB (local ou remoto)

## Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/nl-it-call-api.git
cd nl-it-call-api
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```
Edite o arquivo `.env` com suas configurações.

## Configuração

O arquivo `.env` deve conter as seguintes variáveis:

```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/it-call-management
JWT_SECRET=sua_chave_secreta_para_jwt
JWT_EXPIRATION=24h
```

## Executando a API

### Modo de desenvolvimento:
```bash
npm run dev
```

### Modo de produção:
```bash
npm start
```

A API estará disponível em `http://localhost:3000` (ou na porta configurada).

## Documentação da API

A documentação Swagger está disponível em:
```
http://localhost:3000/api-docs
```

## Estrutura do Projeto

```
nl-it-call-api/
├── src/
│   ├── config/         # Configurações (banco de dados, Swagger)
│   ├── controllers/    # Controladores da API
│   ├── middlewares/    # Middlewares (autenticação, validação)
│   ├── models/         # Modelos de dados (Mongoose)
│   ├── routes/         # Rotas da API
│   └── server.js       # Arquivo principal
├── .env                # Variáveis de ambiente
├── .env.example        # Exemplo de variáveis de ambiente
├── package.json        # Dependências e scripts
└── README.md           # Este arquivo
```

## Endpoints Principais

### Autenticação
- `POST /api/users/register` - Registrar novo usuário
- `POST /api/users/login` - Login de usuário

### Usuários
- `GET /api/users` - Listar todos os usuários (admin)
- `GET /api/users/:id` - Obter usuário por ID (admin)
- `GET /api/users/profile` - Obter perfil do usuário logado
- `PUT /api/users/profile` - Atualizar perfil do usuário logado
- `PUT /api/users/:id` - Atualizar usuário (admin)
- `DELETE /api/users/:id` - Excluir usuário (admin)

### Categorias
- `GET /api/categories` - Listar todas as categorias
- `GET /api/categories/:id` - Obter categoria por ID
- `POST /api/categories` - Criar nova categoria (admin/support)
- `PUT /api/categories/:id` - Atualizar categoria (admin/support)
- `DELETE /api/categories/:id` - Excluir categoria (admin)

### Chamados
- `GET /api/tickets` - Listar chamados (filtrados por papel do usuário)
- `GET /api/tickets/:id` - Obter chamado por ID
- `POST /api/tickets` - Criar novo chamado
- `PUT /api/tickets/:id` - Atualizar chamado
- `POST /api/tickets/:id/comments` - Adicionar comentário a um chamado
- `PUT /api/tickets/:id/close` - Fechar um chamado
- `PUT /api/tickets/:id/reopen` - Reabrir um chamado fechado
- `GET /api/tickets/metrics` - Obter métricas de chamados (admin/support)

## Papéis de Usuário

- **Admin**: Acesso total ao sistema
- **Support**: Gerencia chamados e categorias
- **User**: Cria e acompanha seus próprios chamados

## Licença

Este projeto está licenciado sob a licença MIT.

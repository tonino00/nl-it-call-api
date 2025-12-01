const Ticket = require('../models/Ticket');
const Category = require('../models/Category');
const User = require('../models/User');

// @desc    Obter todos os chamados (com filtros)
// @route   GET /api/tickets
// @access  Privado
exports.getTickets = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    
    // Construir query com filtros
    const query = {};
    
    // Filtrar chamados do usuário logado (exceto para admin e support)
    if (req.user.role === 'user') {
      query.requester = req.user.id;
    }
    
    // Filtro por status
    if (req.query.status) {
      query.status = req.query.status;
    }
    
    // Filtro por prioridade
    if (req.query.priority) {
      query.priority = req.query.priority;
    }
    
    // Filtro por categoria
    if (req.query.category) {
      query.category = req.query.category;
    }
    
    // Filtro por atendente
    if (req.query.assignedTo) {
      query.assignedTo = req.query.assignedTo;
    }
    
    // Filtro por solicitante
    if (req.query.requester && (req.user.role === 'admin' || req.user.role === 'support')) {
      query.requester = req.query.requester;
    }
    
    // Filtro por pesquisa de texto
    if (req.query.search) {
      query.$text = { $search: req.query.search };
    }
    
    // Filtro por data de criação
    if (req.query.startDate && req.query.endDate) {
      query.createdAt = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    } else if (req.query.startDate) {
      query.createdAt = { $gte: new Date(req.query.startDate) };
    } else if (req.query.endDate) {
      query.createdAt = { $lte: new Date(req.query.endDate) };
    }
    
    // Contagem total para paginação
    const total = await Ticket.countDocuments(query);
    
    // Buscar chamados com paginação e população de referências
    const tickets = await Ticket.find(query)
      .populate('requester', 'name email department')
      .populate('assignedTo', 'name email')
      .populate('category', 'name priority slaTime')
      .sort({ createdAt: -1 })
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
      count: tickets.length,
      pagination,
      tickets
    });
  } catch (error) {
    console.error('Erro ao buscar chamados:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar chamados',
      error: error.message
    });
  }
};

// @desc    Obter chamado por ID
// @route   GET /api/tickets/:id
// @access  Privado
exports.getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('requester', 'name email department phone')
      .populate('assignedTo', 'name email')
      .populate('category', 'name priority slaTime')
      .populate('comments.user', 'name email role');
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Chamado não encontrado'
      });
    }
    
    // Verificar se o usuário tem permissão para ver este chamado
    if (
      req.user.role !== 'admin' && 
      req.user.role !== 'support' && 
      ticket.requester._id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para visualizar este chamado'
      });
    }
    
    res.status(200).json({
      success: true,
      ticket
    });
  } catch (error) {
    console.error('Erro ao buscar chamado:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Chamado não encontrado'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar chamado',
      error: error.message
    });
  }
};

// @desc    Criar novo chamado
// @route   POST /api/tickets
// @access  Privado
exports.createTicket = async (req, res) => {
  try {
    const { title, description, category, priority } = req.body;
    
    // Verificar se a categoria existe
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(404).json({
        success: false,
        message: 'Categoria não encontrada'
      });
    }
    
    // Usar prioridade da categoria se não especificada
    const ticketPriority = priority || categoryExists.priority;
    
    // Calcular data de vencimento com base no SLA da categoria
    const dueDate = new Date();
    dueDate.setHours(dueDate.getHours() + categoryExists.slaTime);
    
    // Criar o chamado
    const ticket = await Ticket.create({
      title,
      description,
      requester: req.user.id,
      category,
      priority: ticketPriority,
      dueDate
    });
    
    // Buscar o chamado com os dados populados
    const populatedTicket = await Ticket.findById(ticket._id)
      .populate('requester', 'name email department')
      .populate('category', 'name priority slaTime');
    
    res.status(201).json({
      success: true,
      ticket: populatedTicket
    });
  } catch (error) {
    console.error('Erro ao criar chamado:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar chamado',
      error: error.message
    });
  }
};

// @desc    Atualizar chamado
// @route   PUT /api/tickets/:id
// @access  Privado
exports.updateTicket = async (req, res) => {
  try {
    const { title, description, status, priority, assignedTo, category } = req.body;
    
    let ticket = await Ticket.findById(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Chamado não encontrado'
      });
    }
    
    // Verificar permissão para atualizar chamado
    if (
      req.user.role !== 'admin' && 
      req.user.role !== 'support' && 
      ticket.requester.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para atualizar este chamado'
      });
    }
    
    // Usuários comuns só podem atualizar chamados com status novo ou aberto
    if (
      req.user.role === 'user' && 
      ticket.status !== 'novo' && 
      ticket.status !== 'aberto' && 
      ticket.status !== 'pendente'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Você não pode mais editar este chamado no status atual'
      });
    }
    
    // Usuários comuns não podem atribuir chamados
    if (req.user.role === 'user' && assignedTo) {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para atribuir chamados'
      });
    }
    
    // Verificar se o usuário atribuído existe (se fornecido)
    if (assignedTo) {
      const userExists = await User.findById(assignedTo);
      if (!userExists) {
        return res.status(404).json({
          success: false,
          message: 'Usuário para atribuição não encontrado'
        });
      }
      
      // Verificar se o usuário é admin ou support
      if (userExists.role !== 'admin' && userExists.role !== 'support') {
        return res.status(400).json({
          success: false,
          message: 'Só é possível atribuir chamados para usuários admin ou support'
        });
      }
    }
    
    // Verificar se a categoria existe (se fornecida)
    if (category) {
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return res.status(404).json({
          success: false,
          message: 'Categoria não encontrada'
        });
      }
    }
    
    // Campos a atualizar
    const updateFields = {};
    if (title) updateFields.title = title;
    if (description) updateFields.description = description;
    if (status && (req.user.role === 'admin' || req.user.role === 'support')) {
      updateFields.status = status;
    }
    if (priority) updateFields.priority = priority;
    if (assignedTo && (req.user.role === 'admin' || req.user.role === 'support')) {
      updateFields.assignedTo = assignedTo;
    }
    if (category) updateFields.category = category;
    
    // Atualizar chamado
    ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    )
      .populate('requester', 'name email department')
      .populate('assignedTo', 'name email')
      .populate('category', 'name priority slaTime');
    
    res.status(200).json({
      success: true,
      ticket
    });
  } catch (error) {
    console.error('Erro ao atualizar chamado:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar chamado',
      error: error.message
    });
  }
};

// @desc    Adicionar comentário a um chamado
// @route   POST /api/tickets/:id/comments
// @access  Privado
exports.addComment = async (req, res) => {
  try {
    const { content, isPrivate } = req.body;
    
    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Conteúdo do comentário é obrigatório'
      });
    }
    
    // Comentários privados só podem ser adicionados por admin ou support
    if (isPrivate && req.user.role === 'user') {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para adicionar comentários privados'
      });
    }
    
    const ticket = await Ticket.findById(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Chamado não encontrado'
      });
    }
    
    // Verificar permissão para adicionar comentário
    if (
      req.user.role !== 'admin' && 
      req.user.role !== 'support' && 
      ticket.requester.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para comentar neste chamado'
      });
    }
    
    // Adicionar comentário
    const comment = {
      user: req.user.id,
      content,
      isPrivate: isPrivate || false
    };
    
    ticket.comments.push(comment);
    await ticket.save();
    
    // Buscar o ticket atualizado com comentários populados
    const updatedTicket = await Ticket.findById(req.params.id)
      .populate('requester', 'name email department')
      .populate('assignedTo', 'name email')
      .populate('category', 'name priority slaTime')
      .populate('comments.user', 'name email role');
    
    res.status(201).json({
      success: true,
      ticket: updatedTicket
    });
  } catch (error) {
    console.error('Erro ao adicionar comentário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao adicionar comentário',
      error: error.message
    });
  }
};

// @desc    Fechar um chamado
// @route   PUT /api/tickets/:id/close
// @access  Privado
exports.closeTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Chamado não encontrado'
      });
    }
    
    // Verificar permissão para fechar chamado
    if (
      req.user.role !== 'admin' && 
      req.user.role !== 'support' && 
      ticket.requester.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para fechar este chamado'
      });
    }
    
    // Atualizar status para fechado
    ticket.status = 'fechado';
    ticket.completedAt = Date.now();
    
    await ticket.save();
    
    // Buscar ticket atualizado com dados populados
    const updatedTicket = await Ticket.findById(req.params.id)
      .populate('requester', 'name email department')
      .populate('assignedTo', 'name email')
      .populate('category', 'name priority slaTime');
    
    res.status(200).json({
      success: true,
      ticket: updatedTicket
    });
  } catch (error) {
    console.error('Erro ao fechar chamado:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao fechar chamado',
      error: error.message
    });
  }
};

// @desc    Reabrir um chamado
// @route   PUT /api/tickets/:id/reopen
// @access  Privado
exports.reopenTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Chamado não encontrado'
      });
    }
    
    // Apenas chamados fechados podem ser reabertos
    if (ticket.status !== 'fechado' && ticket.status !== 'resolvido') {
      return res.status(400).json({
        success: false,
        message: 'Apenas chamados fechados ou resolvidos podem ser reabertos'
      });
    }
    
    // Verificar permissão para reabrir chamado
    if (
      req.user.role !== 'admin' && 
      req.user.role !== 'support' && 
      ticket.requester.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para reabrir este chamado'
      });
    }
    
    // Atualizar status para aberto
    ticket.status = 'aberto';
    ticket.completedAt = undefined;
    
    await ticket.save();
    
    // Buscar ticket atualizado com dados populados
    const updatedTicket = await Ticket.findById(req.params.id)
      .populate('requester', 'name email department')
      .populate('assignedTo', 'name email')
      .populate('category', 'name priority slaTime');
    
    res.status(200).json({
      success: true,
      ticket: updatedTicket
    });
  } catch (error) {
    console.error('Erro ao reabrir chamado:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao reabrir chamado',
      error: error.message
    });
  }
};

// @desc    Excluir um chamado
// @route   DELETE /api/tickets/:id
// @access  Privado
exports.deleteTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Chamado não encontrado'
      });
    }

    if (req.user.role !== 'admin' && req.user.role !== 'support') {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para excluir este chamado'
      });
    }

    await ticket.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Chamado excluído com sucesso'
    });
  } catch (error) {
    console.error('Erro ao excluir chamado:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao excluir chamado',
      error: error.message
    });
  }
};

// @desc    Obter métricas de chamados
// @route   GET /api/tickets/metrics
// @access  Privado/Admin e Support
exports.getTicketMetrics = async (req, res) => {
  try {
    // Verificar permissão para acessar métricas
    if (req.user.role !== 'admin' && req.user.role !== 'support') {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para acessar métricas de chamados'
      });
    }
    
    // Filtro por data (padrão: último mês)
    const startDate = req.query.startDate 
      ? new Date(req.query.startDate) 
      : new Date(new Date().setMonth(new Date().getMonth() - 1));
    
    const endDate = req.query.endDate 
      ? new Date(req.query.endDate) 
      : new Date();
    
    // Contagem por status
    const statusCounts = await Ticket.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Contagem por categoria
    const categoryCounts = await Ticket.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'categoryInfo'
        }
      },
      {
        $project: {
          _id: 1,
          count: 1,
          categoryName: { $arrayElemAt: ['$categoryInfo.name', 0] }
        }
      }
    ]);
    
    // Tempo médio de resolução (em horas)
    const avgResolutionTime = await Ticket.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          completedAt: { $exists: true }
        }
      },
      {
        $project: {
          resolutionTime: {
            $divide: [
              { $subtract: ['$completedAt', '$createdAt'] },
              3600000 // milissegundos para horas
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          avgTime: { $avg: '$resolutionTime' }
        }
      }
    ]);
    
    // Chamados por atendente
    const ticketsByAssignee = await Ticket.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          assignedTo: { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: '$assignedTo',
          count: { $sum: 1 },
          resolved: {
            $sum: {
              $cond: [
                { $in: ['$status', ['resolvido', 'fechado']] },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      {
        $project: {
          _id: 1,
          count: 1,
          resolved: 1,
          resolution_rate: {
            $cond: [
              { $eq: ['$count', 0] },
              0,
              { $multiply: [{ $divide: ['$resolved', '$count'] }, 100] }
            ]
          },
          assigneeName: { $arrayElemAt: ['$userInfo.name', 0] }
        }
      }
    ]);
    
    // Total de chamados
    const totalTickets = await Ticket.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate }
    });
    
    // Chamados criados por dia/semana/mês
    const timeFormat = req.query.timeFormat || 'day';
    let dateFormat;
    
    if (timeFormat === 'week') {
      dateFormat = { $week: '$createdAt' };
    } else if (timeFormat === 'month') {
      dateFormat = { 
        year: { $year: '$createdAt' }, 
        month: { $month: '$createdAt' } 
      };
    } else {
      dateFormat = { 
        $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } 
      };
    }
    
    const ticketsOverTime = await Ticket.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: dateFormat,
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id': 1 }
      }
    ]);
    
    res.status(200).json({
      success: true,
      metrics: {
        totalTickets,
        statusCounts,
        categoryCounts,
        avgResolutionTime: avgResolutionTime.length > 0 ? avgResolutionTime[0].avgTime : 0,
        ticketsByAssignee,
        ticketsOverTime
      }
    });
  } catch (error) {
    console.error('Erro ao buscar métricas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar métricas de chamados',
      error: error.message
    });
  }
};

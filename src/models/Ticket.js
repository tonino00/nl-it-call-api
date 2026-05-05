const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const TicketSchema = new mongoose.Schema({
  seq: {
    type: Number
  },
  code: {
    type: String,
    trim: true,
    immutable: true
  },
  title: {
    type: String,
    required: [true, 'Título é obrigatório'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Descrição é obrigatória'],
    trim: true
  },
  status: {
    type: String,
    enum: ['novo', 'aberto', 'em andamento', 'pendente', 'resolvido', 'fechado', 'cancelado'],
    default: 'novo'
  },
  priority: {
    type: String,
    enum: ['baixa', 'média', 'alta', 'crítica'],
    default: 'média'
  },
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  comments: [CommentSchema],
  dueDate: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  attachments: [{
    name: String,
    path: String,
    mimeType: String,
    size: Number,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Método para atualizar o timestamp quando o documento é atualizado
TicketSchema.pre('findOneAndUpdate', function() {
  const update = this.getUpdate() || {};
  const $set = update.$set || {};

  if (Object.prototype.hasOwnProperty.call(update, 'code') || Object.prototype.hasOwnProperty.call($set, 'code')) {
    const err = new Error('O campo code é imutável');
    err.status = 400;
    throw err;
  }

  this.set({ updatedAt: Date.now() });
});

// Middleware para definir a data de conclusão quando o status for alterado para 'resolvido' ou 'fechado'
TicketSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    if (this.status === 'resolvido' || this.status === 'fechado') {
      this.completedAt = Date.now();
    } else if (this.completedAt) {
      // Se o status foi alterado para algo diferente de 'resolvido' ou 'fechado', remove a data de conclusão
      this.completedAt = undefined;
    }
  }
  next();
});

// Índice para pesquisa de texto completo
TicketSchema.index({ title: 'text', description: 'text' });

TicketSchema.index({ seq: 1 }, { unique: true, sparse: true });
TicketSchema.index({ code: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Ticket', TicketSchema);

const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Nome da categoria é obrigatório'],
    trim: true,
    unique: true
  },
  description: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  slaTime: {
    type: Number,
    default: 24,
    description: 'Tempo de SLA em horas'
  },
  priority: {
    type: String,
    enum: ['baixa', 'média', 'alta', 'crítica'],
    default: 'média'
  },
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
CategorySchema.pre('findOneAndUpdate', function() {
  this.set({ updatedAt: Date.now() });
});

module.exports = mongoose.model('Category', CategorySchema);

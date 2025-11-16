const mongoose = require('mongoose');

const AssetSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Nome do patrimônio é obrigatório'],
    trim: true
  },
  type: {
    type: String,
    enum: ['hardware', 'software'],
    required: [true, 'Tipo do patrimônio é obrigatório']
  },
  assetTag: {
    type: String,
    trim: true,
    unique: false
  },
  serialNumber: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['ativo', 'em_uso', 'em_manutencao', 'baixado'],
    default: 'ativo'
  },
  location: {
    type: String,
    trim: true
  },
  ownerUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  department: {
    type: String,
    trim: true
  },
  purchaseDate: {
    type: Date
  },
  warrantyEndDate: {
    type: Date
  },
  vendor: {
    type: String,
    trim: true
  },
  licenseKey: {
    type: String,
    trim: true
  },
  expirationDate: {
    type: Date
  },
  notes: {
    type: String,
    trim: true
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

AssetSchema.pre('findOneAndUpdate', function () {
  this.set({ updatedAt: Date.now() });
});

module.exports = mongoose.model('Asset', AssetSchema);

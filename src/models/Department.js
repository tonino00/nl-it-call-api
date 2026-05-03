const mongoose = require('mongoose');

const normalizeDepartmentName = (value) => {
  if (typeof value !== 'string') return '';

  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ');
};

const DepartmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Nome do departamento é obrigatório'],
    trim: true
  },
  normalizedName: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  active: {
    type: Boolean,
    default: true
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

DepartmentSchema.pre('validate', function (next) {
  if (this.name) {
    this.normalizedName = normalizeDepartmentName(this.name);
  }
  next();
});

DepartmentSchema.pre('findOneAndUpdate', function () {
  const update = this.getUpdate() || {};
  const $set = update.$set || {};

  const nextName = $set.name ?? update.name;
  if (typeof nextName === 'string') {
    const normalizedName = normalizeDepartmentName(nextName);
    this.set({
      $set: {
        ...$set,
        normalizedName,
        updatedAt: Date.now()
      }
    });
    return;
  }

  this.set({ updatedAt: Date.now() });
});

module.exports = mongoose.model('Department', DepartmentSchema);

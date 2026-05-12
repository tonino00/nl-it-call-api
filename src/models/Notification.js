const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  title: {
    type: String,
    trim: true,
    default: ''
  },
  message: {
    type: String,
    trim: true,
    default: ''
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  readAt: {
    type: Date,
    default: null,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

NotificationSchema.pre('findOneAndUpdate', function () {
  this.set({ updatedAt: Date.now() });
});

module.exports = mongoose.model('Notification', NotificationSchema);

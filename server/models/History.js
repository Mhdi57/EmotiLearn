const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  childName: {
    type: String,
    required: true,
  },
  emotion: {
    type: String,
    required: true,
  },
  success: {
    type: Boolean,
    required: true,
  },
  starsEarned: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('History', historySchema);

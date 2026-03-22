const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: '',
    trim: true,
  },
  deadline: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'completed'],
    default: 'pending',
  },
  importance: {
    type: Number,
    min: 1,
    max: 5,
    default: 3,
  },
  effort: {
    type: String,
    enum: ['small', 'medium', 'large'],
    default: 'medium',
  },
  isBlocked: {
    type: Boolean,
    default: false,
  },
  goalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Goal',
    default: null,
  },
  priorityScore: {
    type: Number,
    default: 0,
  },
  isRecurring: {
    type: Boolean,
    default: false,
  },
  recurringPattern: {
    type: String,
    enum: ['daily', 'weekly', 'none'],
    default: 'none',
  },
  timeBlock: {
    start: { type: String, default: null }, // HH:mm format
    end: { type: String, default: null },
  },
  completedAt: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

taskSchema.index({ userId: 1, status: 1 });
taskSchema.index({ userId: 1, deadline: 1 });
taskSchema.index({ userId: 1, priorityScore: -1 });

module.exports = mongoose.model('Task', taskSchema);

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false // Don't include password in queries by default
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  },
  preferences: {
    defaultConversationType: {
      type: String,
      enum: ['expert', 'technical', 'conversational'],
      default: 'expert'
    },
    notificationSettings: {
      email: { type: Boolean, default: true },
      finetuningUpdates: { type: Boolean, default: true },
      weeklyReports: { type: Boolean, default: false }
    },
    privacySettings: {
      shareUsageData: { type: Boolean, default: false },
      allowAnalytics: { type: Boolean, default: true }
    }
  },
  usage: {
    totalInteractions: { type: Number, default: 0 },
    totalDocuments: { type: Number, default: 0 },
    totalFinetuningJobs: { type: Number, default: 0 },
    lastActivity: { type: Date, default: Date.now }
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

// Index for efficient querying
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ lastLogin: -1 });

// Update the updatedAt field before saving
userSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Virtual for user's full activity summary
userSchema.virtual('activitySummary').get(function() {
  const daysSinceLastActivity = this.usage.lastActivity ? 
    Math.floor((Date.now() - this.usage.lastActivity) / (1000 * 60 * 60 * 24)) : null;
  
  return {
    totalInteractions: this.usage.totalInteractions,
    totalDocuments: this.usage.totalDocuments,
    totalFinetuningJobs: this.usage.totalFinetuningJobs,
    daysSinceLastActivity,
    isActive: daysSinceLastActivity !== null && daysSinceLastActivity < 7
  };
});

// Method to update usage statistics
userSchema.methods.updateUsage = function(type, increment = 1) {
  switch (type) {
    case 'interaction':
      this.usage.totalInteractions += increment;
      break;
    case 'document':
      this.usage.totalDocuments += increment;
      break;
    case 'finetuning':
      this.usage.totalFinetuningJobs += increment;
      break;
  }
  this.usage.lastActivity = new Date();
  return this.save();
};

// Static method to get active users
userSchema.statics.getActiveUsers = function(days = 30) {
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - days);
  
  return this.find({
    isActive: true,
    'usage.lastActivity': { $gte: fromDate }
  }).select('username email role usage.lastActivity usage.totalInteractions');
};

// Static method to get usage statistics
userSchema.statics.getUsageStats = function() {
  return this.aggregate([
    {
      $match: { isActive: true }
    },
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
        totalInteractions: { $sum: '$usage.totalInteractions' },
        totalDocuments: { $sum: '$usage.totalDocuments' },
        totalFinetuningJobs: { $sum: '$usage.totalFinetuningJobs' },
        avgInteractionsPerUser: { $avg: '$usage.totalInteractions' },
        avgDocumentsPerUser: { $avg: '$usage.totalDocuments' }
      }
    }
  ]);
};

module.exports = mongoose.model('User', userSchema);

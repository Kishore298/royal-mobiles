const mongoose = require('mongoose');

const subcategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide subcategory name'],
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Subcategory must belong to a category']
  },
  image: {
    public_id: String,
    url: String
  },
  active: {
    type: Boolean,
    default: true,
    select: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual populate products
subcategorySchema.virtual('products', {
  ref: 'Product',
  foreignField: 'subcategory',
  localField: '_id'
});

// Create slug before saving
subcategorySchema.pre('save', function(next) {
  if (!this.isModified('name')) return next();
  
  this.slug = this.name
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]/g, '-')
    .replace(/-+/g, '-');
  
  next();
});

const Subcategory = mongoose.model('Subcategory', subcategorySchema);

module.exports = Subcategory; 
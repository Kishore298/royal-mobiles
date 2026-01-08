const Category = require('../models/category.model');
const asyncHandler = require('express-async-handler');

// @desc    Get all categories with optional search and filter
// @route   GET /api/categories
// @access  Public
exports.getCategories = asyncHandler(async (req, res) => {
  const { search, sort, page = 1, limit = 10 } = req.query;

  // Build query
  const query = { active: true };
  if (search) {
    query.name = { $regex: search, $options: 'i' };
  }

  // Build sort options
  let sortOption = {};
  if (req.query.sortBy) {
    sortOption[req.query.sortBy] = req.query.sortOrder === 'asc' ? 1 : -1;
  } else if (sort) {
    const sortFields = sort.split(',').map(field => {
      const order = field.startsWith('-') ? -1 : 1;
      return [field.replace('-', ''), order];
    });
    sortOption = Object.fromEntries(sortFields);
  } else {
    sortOption = { createdAt: -1 };
  }

  // Pagination
  const skip = (page - 1) * limit;

  // Execute query
  const categories = await Category.find(query)
    .sort(sortOption)
    .skip(skip)
    .limit(parseInt(limit))
    .populate({
      path: 'subcategories',
      select: 'name slug image',
      match: { active: true }
    })
    .lean();

  // Get total count for pagination
  const total = await Category.countDocuments(query);

  res.status(200).json({
    success: true,
    count: categories.length,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total
    },
    data: categories
  });
});

// @desc    Get single category with its subcategories
// @route   GET /api/categories/:id
// @access  Public
exports.getCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id)
    .populate({
      path: 'subcategories',
      select: 'name slug image description',
      match: { active: true }
    })
    .lean();

  if (!category) {
    return res.status(404).json({
      success: false,
      message: 'Category not found'
    });
  }

  res.status(200).json({
    success: true,
    data: category
  });
});

// @desc    Get subcategories by category ID
// @route   GET /api/categories/:id/subcategories
// @access  Public
exports.getSubcategoriesByCategory = asyncHandler(async (req, res) => {
  const { search, sort, page = 1, limit = 10 } = req.query;

  // Build query
  const query = {
    category: req.params.id,
    active: true
  };
  if (search) {
    query.name = { $regex: search, $options: 'i' };
  }

  // Build sort options
  let sortOption = {};
  if (sort) {
    const sortFields = sort.split(',').map(field => {
      const order = field.startsWith('-') ? -1 : 1;
      return [field.replace('-', ''), order];
    });
    sortOption = Object.fromEntries(sortFields);
  }

  // Pagination
  const skip = (page - 1) * limit;

  // Execute query
  const subcategories = await Subcategory.find(query)
    .sort(sortOption)
    .skip(skip)
    .limit(parseInt(limit))
    .populate({
      path: 'products',
      select: 'name slug image price',
      match: { active: true }
    })
    .lean();

  // Get total count for pagination
  const total = await Subcategory.countDocuments(query);

  res.status(200).json({
    success: true,
    count: subcategories.length,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total
    },
    data: subcategories
  });
});

// @desc    Create category
// @route   POST /api/categories
// @access  Private/Admin
exports.createCategory = asyncHandler(async (req, res) => {
  let categoryData = req.body;
  if (req.file) {
    categoryData.image = {
      public_id: req.file.filename,
      url: req.file.path
    };
  }
  const category = await Category.create(categoryData);

  res.status(201).json({
    success: true,
    data: category
  });
});

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
exports.updateCategory = asyncHandler(async (req, res) => {
  let category = await Category.findById(req.params.id);

  if (!category) {
    return res.status(404).json({
      success: false,
      message: 'Category not found'
    });
  }

  category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: category
  });
});

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
exports.deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndDelete(req.params.id);

  if (!category) {
    return res.status(404).json({
      success: false,
      message: 'Category not found'
    });
  }


  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Upload category image
// @route   PUT /api/categories/:id/image
// @access  Private/Admin
exports.uploadCategoryImage = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return res.status(404).json({
      success: false,
      message: 'Category not found'
    });
  }

  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Please upload a file'
    });
  }

  category.image = {
    public_id: req.file.filename,
    url: req.file.path
  };

  await category.save();

  res.status(200).json({
    success: true,
    data: category
  });
});
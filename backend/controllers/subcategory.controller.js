const Subcategory = require('../models/subcategory.model');
const asyncHandler = require('express-async-handler');

// @desc    Get all subcategories with optional search and filter
// @route   GET /api/subcategories
// @access  Public
exports.getSubcategories = asyncHandler(async (req, res) => {
  const { search, sort, page = 1, limit = 10, category } = req.query;

  // Build query
  const query = { active: true };
  if (search) {
    query.name = { $regex: search, $options: 'i' };
  }
  if (category && category !== 'undefined' && category !== 'null') {
    query.category = category;
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
  const subcategories = await Subcategory.find(query)
    .sort(sortOption)
    .skip(skip)
    .limit(parseInt(limit))
    .populate('category', 'name')
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

// @desc    Get single subcategory with its products
// @route   GET /api/subcategories/:id
// @access  Public
exports.getSubcategory = asyncHandler(async (req, res) => {
  const subcategory = await Subcategory.findById(req.params.id)
    .populate({
      path: 'products',
      select: 'name slug image price description stock rating',
      match: { active: true }
    })
    .lean();

  if (!subcategory) {
    return res.status(404).json({
      success: false,
      message: 'Subcategory not found'
    });
  }

  res.status(200).json({
    success: true,
    data: subcategory
  });
});

// @desc    Get products by subcategory ID
// @route   GET /api/subcategories/:id/products
// @access  Public
exports.getProductsBySubcategory = asyncHandler(async (req, res) => {
  const { search, sort, page = 1, limit = 10, minPrice, maxPrice, brand } = req.query;

  // Build query
  const query = {
    subcategory: req.params.id,
    active: true
  };

  // Search by name or description
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  // Price range filter
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = parseFloat(minPrice);
    if (maxPrice) query.price.$lte = parseFloat(maxPrice);
  }

  // Brand filter
  if (brand) {
    query.brand = { $regex: brand, $options: 'i' };
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
  const products = await Product.find(query)
    .sort(sortOption)
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

  // Get total count for pagination
  const total = await Product.countDocuments(query);

  res.status(200).json({
    success: true,
    count: products.length,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total
    },
    data: products
  });
});

// @desc    Create subcategory
// @route   POST /api/subcategories
// @access  Private/Admin
exports.createSubcategory = asyncHandler(async (req, res) => {
  let subcategoryData = req.body;
  if (req.file) {
    subcategoryData.image = {
      public_id: req.file.filename,
      url: req.file.path
    };
  }
  const subcategory = await Subcategory.create(subcategoryData);

  res.status(201).json({
    success: true,
    data: subcategory
  });
});

// @desc    Update subcategory
// @route   PUT /api/subcategories/:id
// @access  Private/Admin
exports.updateSubcategory = asyncHandler(async (req, res) => {
  let subcategory = await Subcategory.findById(req.params.id);

  if (!subcategory) {
    return res.status(404).json({
      success: false,
      message: 'Subcategory not found'
    });
  }

  subcategory = await Subcategory.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: subcategory
  });
});

// @desc    Delete subcategory
// @route   DELETE /api/subcategories/:id
// @access  Private/Admin
exports.deleteSubcategory = asyncHandler(async (req, res) => {
  const subcategory = await Subcategory.findByIdAndDelete(req.params.id);

  if (!subcategory) {
    return res.status(404).json({
      success: false,
      message: 'Subcategory not found'
    });
  }


  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get all subcategories regardless of category
// @route   GET /api/subcategories/all
// @access  Public
exports.getAllSubcategories = asyncHandler(async (req, res) => {
  const { search, sort, page = 1, limit = 10 } = req.query;

  // Build query
  const query = { active: true };
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
    .populate('category', 'name')
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

// @desc    Upload subcategory image
// @route   PUT /api/subcategories/:id/image
// @access  Private/Admin
exports.uploadSubcategoryImage = asyncHandler(async (req, res) => {
  const subcategory = await Subcategory.findById(req.params.id);

  if (!subcategory) {
    return res.status(404).json({
      success: false,
      message: 'Subcategory not found'
    });
  }

  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Please upload a file'
    });
  }

  subcategory.image = {
    public_id: req.file.filename,
    url: req.file.path
  };

  await subcategory.save();

  res.status(200).json({
    success: true,
    data: subcategory
  });
}); 
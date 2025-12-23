const Product = require('../models/product.model');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

// Helper function to build query based on filters
const buildQuery = (queryParams) => {
  const query = {};

  // Search by name or description
  if (queryParams.search) {
    query.$or = [
      { name: { $regex: queryParams.search, $options: 'i' } },
      { description: { $regex: queryParams.search, $options: 'i' } }
    ];
  }

  // Filter by category
  if (queryParams.category) {
    query.category = queryParams.category;
  }

  // Filter by subcategory
  if (queryParams.subcategory) {
    query.subcategory = queryParams.subcategory;
  }

  // Filter by price range
  if (queryParams.minPrice || queryParams.maxPrice) {
    query.price = {};
    if (queryParams.minPrice) query.price.$gte = Number(queryParams.minPrice);
    if (queryParams.maxPrice) query.price.$lte = Number(queryParams.maxPrice);
  }

  return query;
};

// Helper function to build sort options
const buildSortOptions = (query) => {
  const { sort, sortBy, sortOrder } = query;

  // Handle explicit sortBy/sortOrder from frontend
  if (sortBy) {
    return { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
  }

  // Handle combined sort string (legacy/other app parts)
  if (sort) {
    switch (sort) {
      case 'price-asc':
        return { price: 1 };
      case 'price-desc':
        return { price: -1 };
      case 'newest':
        return { createdAt: -1 };
      case 'oldest':
        return { createdAt: 1 };
      default:
        return { createdAt: -1 };
    }
  }

  // Default
  return { createdAt: -1 };
};

// Get all products with pagination, sorting, and filtering
exports.getProducts = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;
  const skip = (page - 1) * limit;

  const query = buildQuery(req.query);
  const sort = buildSortOptions(req.query); // Changed to pass full query object

  const products = await Product.find(query)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .populate('category', 'name')
    .populate('subcategory', 'name')
    .lean();

  const total = await Product.countDocuments(query);

  res.status(200).json({
    status: 'success',
    data: {
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  });
});

// Get products by subcategory with pagination and filtering
exports.getProductsBySubcategory = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;
  const skip = (page - 1) * limit;

  const query = { subcategory: req.params.subcategoryId };
  if (req.query.minPrice || req.query.maxPrice) {
    query.price = {};
    if (req.query.minPrice) query.price.$gte = Number(req.query.minPrice);
    if (req.query.maxPrice) query.price.$lte = Number(req.query.maxPrice);
  }

  // Apply sorting if provided, else default to newest
  const sort = buildSortOptions(req.query);

  const products = await Product.find(query)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .populate('category', 'name')
    .populate('subcategory', 'name')
    .lean();

  const total = await Product.countDocuments(query);

  res.status(200).json({
    status: 'success',
    data: {
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  });
});

// Search products with pagination and sorting
exports.searchProducts = catchAsync(async (req, res, next) => {
  const { query } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;
  const skip = (page - 1) * limit;

  // Create a more flexible search query
  const searchQuery = {
    $or: [
      { name: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } },
      { brand: { $regex: query, $options: 'i' } }
    ],
    active: true
  };

  const sort = buildSortOptions(req.query);

  const products = await Product.find(searchQuery)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .populate('category', 'name')
    .populate('subcategory', 'name');

  const total = await Product.countDocuments(searchQuery);

  res.status(200).json({
    status: 'success',
    data: products,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  });
});

// Get a single product
exports.getProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id)
    .populate('category', 'name')
    .populate('subcategory', 'name');

  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      product
    }
  });
});

// Create a new product
exports.createProduct = catchAsync(async (req, res, next) => {
  const product = await Product.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      product
    }
  });
});

// Update a product
exports.updateProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  );

  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      product
    }
  });
});

// Delete a product
exports.deleteProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findByIdAndDelete(req.params.id);

  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// @desc    Get all products regardless of category or subcategory
// @route   GET /api/products/all
// @access  Public
exports.getAllProducts = catchAsync(async (req, res, next) => {
  const { search, sort, page = 1, limit = 12, minPrice, maxPrice, brand } = req.query;

  // Build query
  const query = { active: true };

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
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  // Brand filter
  if (brand) {
    query.brand = { $regex: brand, $options: 'i' };
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
  const products = await Product.find(query)
    .sort(sortOption)
    .skip(skip)
    .limit(parseInt(limit))
    .populate('category', 'name')
    .populate('subcategory', 'name');

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

// @desc    Upload product images
// @route   PUT /api/products/:id/images
// @access  Private/Admin
exports.uploadProductImages = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  if (!req.files || req.files.length === 0) {
    return next(new AppError('Please upload at least one image', 400));
  }

  const images = req.files.map(file => ({
    public_id: file.filename,
    url: file.path
  }));

  product.images = [...product.images, ...images];
  await product.save();

  res.status(200).json({
    status: 'success',
    data: {
      product
    }
  });
}); 
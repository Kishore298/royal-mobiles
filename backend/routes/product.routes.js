const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const upload = require('../utils/upload');
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  getAllProducts,
  uploadProductImages
} = require('../controllers/product.controller');

// Public routes
router.get('/', getProducts);
router.get('/all', getAllProducts);
router.get('/search', searchProducts);
router.get('/:id', getProduct);

// Admin routes
router.post('/', protect, authorize('admin'), upload.array('images', 5), createProduct);
router.put('/:id', protect, authorize('admin'), updateProduct);
router.delete('/:id', protect, authorize('admin'), deleteProduct);
router.put('/:id/images', protect, authorize('admin'), upload.array('images', 5), uploadProductImages);

module.exports = router; 
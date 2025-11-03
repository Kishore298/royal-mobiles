const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const upload = require('../utils/upload');
const {
  getSubcategories,
  getSubcategory,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
  getProductsBySubcategory,
  getAllSubcategories,
  uploadSubcategoryImage
} = require('../controllers/subcategory.controller');

// Public routes
router.get('/', getSubcategories);
router.get('/all', getAllSubcategories);
router.get('/:id', getSubcategory);
router.get('/:id/products', getProductsBySubcategory);

// Admin routes
router.post('/', protect, authorize('admin'), upload.single('image'), createSubcategory);
router.put('/:id', protect, authorize('admin'), updateSubcategory);
router.delete('/:id', protect, authorize('admin'), deleteSubcategory);
router.put('/:id/image', protect, authorize('admin'), upload.single('image'), uploadSubcategoryImage);

module.exports = router; 
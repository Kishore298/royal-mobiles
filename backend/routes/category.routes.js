const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const upload = require('../utils/upload');
const {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  uploadCategoryImage,
  getSubcategoriesByCategory
} = require('../controllers/category.controller');

router.get('/', getCategories);
router.get('/:id', getCategory);
router.get('/:id/subcategories', getSubcategoriesByCategory);

// Admin routes
router.post('/', protect, authorize('admin'), upload.single('image'), createCategory);
router.put('/:id', protect, authorize('admin'), updateCategory);
router.delete('/:id', protect, authorize('admin'), deleteCategory);
router.put('/:id/image', protect, authorize('admin'), upload.single('image'), uploadCategoryImage);

module.exports = router; 
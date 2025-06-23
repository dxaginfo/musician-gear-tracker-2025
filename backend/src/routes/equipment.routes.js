const express = require('express');
const router = express.Router();
const { body, query, param } = require('express-validator');
const auth = require('../middleware/auth');
const equipmentController = require('../controllers/equipment.controller');

/**
 * @route   GET /api/equipment
 * @desc    Get all equipment items for the authenticated user
 * @access  Private
 */
router.get('/', 
  auth,
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('sortBy').optional().isString().withMessage('Sort field must be a string'),
    query('sortOrder').optional().isIn(['ASC', 'DESC']).withMessage('Sort order must be ASC or DESC'),
    query('categoryId').optional().isUUID().withMessage('Category ID must be a valid UUID'),
    query('searchTerm').optional().isString().withMessage('Search term must be a string')
  ],
  equipmentController.getAllEquipment
);

/**
 * @route   GET /api/equipment/:id
 * @desc    Get a single equipment item by ID
 * @access  Private
 */
router.get('/:id',
  auth,
  [
    param('id').isUUID().withMessage('Equipment ID must be a valid UUID')
  ],
  equipmentController.getEquipmentById
);

/**
 * @route   POST /api/equipment
 * @desc    Create a new equipment item
 * @access  Private
 */
router.post('/',
  auth,
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('categoryId').isUUID().withMessage('Category ID must be a valid UUID'),
    body('brand').optional().isString().withMessage('Brand must be a string'),
    body('model').optional().isString().withMessage('Model must be a string'),
    body('serialNumber').optional().isString().withMessage('Serial number must be a string'),
    body('purchaseDate').optional().isISO8601().withMessage('Purchase date must be a valid date'),
    body('purchasePrice').optional().isNumeric().withMessage('Purchase price must be a number'),
    body('currentValue').optional().isNumeric().withMessage('Current value must be a number'),
    body('conditionRating').optional().isInt({ min: 1, max: 10 }).withMessage('Condition rating must be between 1 and 10'),
    body('notes').optional().isString().withMessage('Notes must be a string'),
    body('specifications').optional().isArray().withMessage('Specifications must be an array'),
    body('specifications.*.name').optional().isString().withMessage('Specification name must be a string'),
    body('specifications.*.value').optional().isString().withMessage('Specification value must be a string'),
    body('images').optional().isArray().withMessage('Images must be an array'),
    body('images.*.url').optional().isURL().withMessage('Image URL must be valid'),
    body('images.*.isPrimary').optional().isBoolean().withMessage('isPrimary must be a boolean')
  ],
  equipmentController.createEquipment
);

/**
 * @route   PUT /api/equipment/:id
 * @desc    Update an equipment item
 * @access  Private
 */
router.put('/:id',
  auth,
  [
    param('id').isUUID().withMessage('Equipment ID must be a valid UUID'),
    body('name').optional().isString().withMessage('Name must be a string'),
    body('categoryId').optional().isUUID().withMessage('Category ID must be a valid UUID'),
    body('brand').optional().isString().withMessage('Brand must be a string'),
    body('model').optional().isString().withMessage('Model must be a string'),
    body('serialNumber').optional().isString().withMessage('Serial number must be a string'),
    body('purchaseDate').optional().isISO8601().withMessage('Purchase date must be a valid date'),
    body('purchasePrice').optional().isNumeric().withMessage('Purchase price must be a number'),
    body('currentValue').optional().isNumeric().withMessage('Current value must be a number'),
    body('conditionRating').optional().isInt({ min: 1, max: 10 }).withMessage('Condition rating must be between 1 and 10'),
    body('notes').optional().isString().withMessage('Notes must be a string'),
    body('specifications').optional().isArray().withMessage('Specifications must be an array'),
    body('specifications.*.name').optional().isString().withMessage('Specification name must be a string'),
    body('specifications.*.value').optional().isString().withMessage('Specification value must be a string'),
  ],
  equipmentController.updateEquipment
);

/**
 * @route   DELETE /api/equipment/:id
 * @desc    Delete an equipment item
 * @access  Private
 */
router.delete('/:id',
  auth,
  [
    param('id').isUUID().withMessage('Equipment ID must be a valid UUID')
  ],
  equipmentController.deleteEquipment
);

/**
 * @route   POST /api/equipment/:id/images
 * @desc    Add images to equipment
 * @access  Private
 */
router.post('/:id/images',
  auth,
  [
    param('id').isUUID().withMessage('Equipment ID must be a valid UUID'),
    body('images').isArray().withMessage('Images must be an array'),
    body('images.*.url').isURL().withMessage('Image URL must be valid'),
    body('images.*.isPrimary').optional().isBoolean().withMessage('isPrimary must be a boolean')
  ],
  equipmentController.addEquipmentImages
);

/**
 * @route   DELETE /api/equipment/:id/images/:imageId
 * @desc    Delete an equipment image
 * @access  Private
 */
router.delete('/:id/images/:imageId',
  auth,
  [
    param('id').isUUID().withMessage('Equipment ID must be a valid UUID'),
    param('imageId').isUUID().withMessage('Image ID must be a valid UUID')
  ],
  equipmentController.deleteEquipmentImage
);

/**
 * @route   POST /api/equipment/:id/condition
 * @desc    Add a condition log for equipment
 * @access  Private
 */
router.post('/:id/condition',
  auth,
  [
    param('id').isUUID().withMessage('Equipment ID must be a valid UUID'),
    body('conditionRating').isInt({ min: 1, max: 10 }).withMessage('Condition rating must be between 1 and 10'),
    body('notes').optional().isString().withMessage('Notes must be a string'),
    body('imageUrl').optional().isURL().withMessage('Image URL must be valid')
  ],
  equipmentController.addConditionLog
);

module.exports = router;
/**
 * FashionForge — Design REST API Routes
 * Mount point: /api/designs
 */

const express = require('express');
const router = express.Router();

const designController = require('../controllers/designController');
const {
  validateCreateDesign,
  validateUpdateDesign,
  validateIdParam
} = require('../middleware/validateDesign');

// GET /api/designs - Retrieve all saved designs
router.get('/', designController.getAllDesigns);

// GET /api/designs/:id - Retrieve design by ID
router.get('/:id', validateIdParam, designController.getDesignById);

// POST /api/designs - Save new bespoke design
router.post('/', validateCreateDesign, designController.createDesign);

// PUT /api/designs/:id - Update existing design
router.put('/:id', validateIdParam, validateUpdateDesign, designController.updateDesign);

// DELETE /api/designs/:id - Delete design by ID
router.delete('/:id', validateIdParam, designController.deleteDesign);

module.exports = router;

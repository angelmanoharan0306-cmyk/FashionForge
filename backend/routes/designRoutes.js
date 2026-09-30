/**
 * FashionForge — Design REST API Routes
 * Mount point: /api/designs
 * Protected by JWT authentication middleware
 */

const express = require('express');
const router = express.Router();

const designController = require('../controllers/designController');
const { requireAuth } = require('../middleware/auth');
const {
  validateCreateDesign,
  validateUpdateDesign,
  validateIdParam
} = require('../middleware/validateDesign');

// All design CRUD operations strictly require authenticated session
router.use(requireAuth);

// GET /api/designs - Retrieve all saved designs for current user
router.get('/', designController.getAllDesigns);

// GET /api/designs/:id - Retrieve design by ID if owned by current user
router.get('/:id', validateIdParam, designController.getDesignById);

// POST /api/designs - Save new bespoke design assigned to current user
router.post('/', validateCreateDesign, designController.createDesign);

// PUT /api/designs/:id - Update existing design if owned by current user
router.put('/:id', validateIdParam, validateUpdateDesign, designController.updateDesign);

// DELETE /api/designs/:id - Delete design by ID if owned by current user
router.delete('/:id', validateIdParam, designController.deleteDesign);

module.exports = router;

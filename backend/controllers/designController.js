/**
 * FashionForge — Design Controller
 * Handles REST operations for user-owned bespoke fashion designs backed by MongoDB.
 */

const Design = require('../models/Design');

/**
 * Generates a unique collision-safe design identifier
 */
function generateServerDesignId() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `FF-D${timestamp}-${randomPart}`;
}

/**
 * GET /api/designs
 * Retrieves all saved designs belonging to the authenticated user, sorted newest first
 */
async function getAllDesigns(req, res, next) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required to view designs.'
      });
    }

    const designs = await Design.find({ userId }).sort({ updatedAt: -1, createdAt: -1 });
    return res.status(200).json(designs.map(d => d.toJSON()));
  } catch (error) {
    console.error('[Design Controller] getAllDesigns error:', error.message);
    next(error);
  }
}

/**
 * GET /api/designs/:id
 * Retrieves a single design if owned by the authenticated user
 */
async function getDesignById(req, res, next) {
  try {
    const id = req.params.id;
    const userId = req.user?.userId;

    let design = await Design.findOne({ designId: id });
    if (!design && id.match(/^[0-9a-fA-F]{24}$/)) {
      design = await Design.findById(id);
    }

    if (!design) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Design with ID "${id}" was not found.`
      });
    }

    // Verify ownership
    if (design.userId && design.userId !== userId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to view this design.'
      });
    }

    return res.status(200).json(design.toJSON());
  } catch (error) {
    console.error(`[Design Controller] getDesignById error for ${req.params.id}:`, error.message);
    next(error);
  }
}

/**
 * POST /api/designs
 * Creates and persists a new design configuration owned by the authenticated user
 */
async function createDesign(req, res, next) {
  try {
    const body = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required to save designs.'
      });
    }

    const designId = body.designId || body.id || generateServerDesignId();

    // Check for collision
    const existing = await Design.findOne({ designId });
    const finalDesignId = existing ? generateServerDesignId() : designId;

    const gender = body.gender || body.figure || 'female';
    const figure = body.figure || gender;
    const croquis = body.croquis || figure;
    const collar = body.collar || body.neckline || 'crew';
    const neckline = body.neckline || collar || 'crew';

    const newDesign = new Design({
      designId: finalDesignId,
      userId, // Strictly derived from authenticated session, never client trusted
      styleId: body.styleId || finalDesignId,
      name: body.name.trim(),
      gender,
      figure,
      croquis,
      size: body.size || 'M',
      top: body.top,
      bottom: body.bottom,
      sleeves: body.sleeves || 'none',
      collar,
      neckline,
      fabric: body.fabric,
      colour: body.colour,
      pattern: body.pattern || 'solid',
      notes: body.notes || '',
      price: Number(body.price),
      view: body.view || 'front',
      configuration: body.configuration || {
        gender,
        figure,
        croquis,
        size: body.size || 'M',
        top: body.top,
        bottom: body.bottom,
        sleeves: body.sleeves || 'none',
        collar,
        neckline,
        fabric: body.fabric,
        colour: body.colour,
        pattern: body.pattern || 'solid',
        notes: body.notes || '',
        price: Number(body.price),
        view: body.view || 'front'
      }
    });

    const saved = await newDesign.save();
    return res.status(201).json(saved.toJSON());
  } catch (error) {
    console.error('[Design Controller] createDesign error:', error.message);
    next(error);
  }
}

/**
 * PUT /api/designs/:id
 * Updates an existing design configuration if owned by authenticated user
 */
async function updateDesign(req, res, next) {
  try {
    const id = req.params.id;
    const userId = req.user?.userId;

    let design = await Design.findOne({ designId: id });
    if (!design && id.match(/^[0-9a-fA-F]{24}$/)) {
      design = await Design.findById(id);
    }

    if (!design) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Design with ID "${id}" was not found.`
      });
    }

    // Verify ownership
    if (design.userId && design.userId !== userId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to modify this design.'
      });
    }

    const body = req.body;

    if (body.name !== undefined) design.name = body.name.trim();
    if (body.gender !== undefined) design.gender = body.gender;
    if (body.figure !== undefined) design.figure = body.figure;
    if (body.croquis !== undefined) design.croquis = body.croquis;
    if (body.size !== undefined) design.size = body.size;
    if (body.top !== undefined) design.top = body.top;
    if (body.bottom !== undefined) design.bottom = body.bottom;
    if (body.sleeves !== undefined) design.sleeves = body.sleeves;
    if (body.collar !== undefined) {
      design.collar = body.collar;
      design.neckline = body.collar;
    }
    if (body.neckline !== undefined) {
      design.neckline = body.neckline;
      design.collar = body.neckline;
    }
    if (body.fabric !== undefined) design.fabric = body.fabric;
    if (body.colour !== undefined) design.colour = body.colour;
    if (body.pattern !== undefined) design.pattern = body.pattern;
    if (body.notes !== undefined) design.notes = body.notes;
    if (body.price !== undefined) design.price = Number(body.price);
    if (body.view !== undefined) design.view = body.view;
    if (body.configuration !== undefined) {
      design.configuration = { ...design.configuration, ...body.configuration };
    }

    // Ensure design adopts user ownership if it was legacy unowned
    if (!design.userId && userId) {
      design.userId = userId;
    }

    const updated = await design.save();
    return res.status(200).json(updated.toJSON());
  } catch (error) {
    console.error(`[Design Controller] updateDesign error for ${req.params.id}:`, error.message);
    next(error);
  }
}

/**
 * DELETE /api/designs/:id
 * Deletes a design by its designId if owned by authenticated user
 */
async function deleteDesign(req, res, next) {
  try {
    const id = req.params.id;
    const userId = req.user?.userId;

    let design = await Design.findOne({ designId: id });
    if (!design && id.match(/^[0-9a-fA-F]{24}$/)) {
      design = await Design.findById(id);
    }

    if (!design) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Design with ID "${id}" was not found.`
      });
    }

    // Verify ownership
    if (design.userId && design.userId !== userId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to delete this design.'
      });
    }

    await Design.deleteOne({ _id: design._id });

    return res.status(200).json({
      success: true,
      message: `Design "${design.name}" (${design.designId}) successfully deleted.`,
      id: design.designId
    });
  } catch (error) {
    console.error(`[Design Controller] deleteDesign error for ${req.params.id}:`, error.message);
    next(error);
  }
}

module.exports = {
  getAllDesigns,
  getDesignById,
  createDesign,
  updateDesign,
  deleteDesign,
  generateServerDesignId
};

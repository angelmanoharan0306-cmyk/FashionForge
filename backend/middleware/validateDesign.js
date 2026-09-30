/**
 * FashionForge — Design Validation Middleware
 * Validates incoming design payloads for POST and PUT requests.
 */

const VALID_GENDERS = ['female', 'male'];
const VALID_SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'];

/**
 * Validates design creation payload
 */
function validateCreateDesign(req, res, next) {
  const body = req.body;
  const errors = [];

  if (!body || typeof body !== 'object') {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Request body must be a valid JSON object'
    });
  }

  // Name validation
  if (!body.name || typeof body.name !== 'string' || body.name.trim().length === 0) {
    errors.push('Field "name" is required and must be a non-empty string.');
  } else if (body.name.length > 120) {
    errors.push('Field "name" must not exceed 120 characters.');
  }

  // Gender / Figure validation
  const gender = body.gender || body.figure;
  if (!gender || !VALID_GENDERS.includes(String(gender).toLowerCase())) {
    errors.push(`Field "gender" (or "figure") is required and must be one of: ${VALID_GENDERS.join(', ')}.`);
  }

  // Size validation
  if (!body.size || typeof body.size !== 'string') {
    errors.push('Field "size" is required and must be a valid size string.');
  }

  // Garment components validation (top & bottom are mandatory)
  if (!body.top || typeof body.top !== 'string' || body.top.trim().length === 0) {
    errors.push('Field "top" garment component is required.');
  }

  if (!body.bottom || typeof body.bottom !== 'string' || body.bottom.trim().length === 0) {
    errors.push('Field "bottom" garment component is required.');
  }

  // Fabric validation
  if (!body.fabric || typeof body.fabric !== 'string' || body.fabric.trim().length === 0) {
    errors.push('Field "fabric" is required.');
  }

  // Colour validation
  if (!body.colour || typeof body.colour !== 'string' || body.colour.trim().length === 0) {
    errors.push('Field "colour" is required.');
  }

  // Price validation
  if (body.price === undefined || body.price === null || typeof body.price !== 'number' || isNaN(body.price) || body.price < 0) {
    errors.push('Field "price" is required and must be a non-negative number.');
  }

  // Malformed ID check if client supplies designId/id
  const suppliedId = body.designId || body.id;
  if (suppliedId) {
    if (typeof suppliedId !== 'string' || suppliedId.length > 50 || !/^[A-Za-z0-9_-]+$/.test(suppliedId)) {
      errors.push('Client-supplied design ID is malformed or invalid.');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Design payload validation failed.',
      details: errors
    });
  }

  next();
}

/**
 * Validates design update payload
 */
function validateUpdateDesign(req, res, next) {
  const body = req.body;
  const errors = [];

  if (!body || typeof body !== 'object') {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Request body must be a valid JSON object'
    });
  }

  if (body.name !== undefined) {
    if (typeof body.name !== 'string' || body.name.trim().length === 0) {
      errors.push('Field "name" cannot be empty.');
    } else if (body.name.length > 120) {
      errors.push('Field "name" cannot exceed 120 characters.');
    }
  }

  const gender = body.gender || body.figure;
  if (gender !== undefined && !VALID_GENDERS.includes(String(gender).toLowerCase())) {
    errors.push(`Field "gender" must be one of: ${VALID_GENDERS.join(', ')}.`);
  }

  if (body.price !== undefined && (typeof body.price !== 'number' || isNaN(body.price) || body.price < 0)) {
    errors.push('Field "price" must be a non-negative number.');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Design update payload validation failed.',
      details: errors
    });
  }

  next();
}

/**
 * Validates ID URL parameter
 */
function validateIdParam(req, res, next) {
  const id = req.params.id;
  if (!id || typeof id !== 'string' || !/^[A-Za-z0-9_-]+$/.test(id)) {
    return res.status(400).json({
      error: 'Invalid ID',
      message: 'Requested design identifier is invalid or malformed.'
    });
  }
  next();
}

module.exports = {
  validateCreateDesign,
  validateUpdateDesign,
  validateIdParam
};

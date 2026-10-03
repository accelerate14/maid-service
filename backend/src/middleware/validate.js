const Joi = require('joi');

const schemas = {
  register: Joi.object({
    name: Joi.string().min(3).max(100).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    phone: Joi.string().min(10).max(20).optional().allow('', null),
    address: Joi.string().min(5).max(255).required(),
    address_lat: Joi.number().optional().allow(null),
    address_lng: Joi.number().optional().allow(null)
  }),
  googleAuth: Joi.object({
    name: Joi.string().min(3).max(100),
    email: Joi.string().email().required(),
    phone: Joi.string().min(10).max(20).optional().allow('', null),
    address: Joi.string().min(5).max(255).optional().allow('', null),
    address_lat: Joi.number().optional().allow(null),
    address_lng: Joi.number().optional().allow(null)
  }),
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),
  forgotPassword: Joi.object({
    email: Joi.string().email().required()
  }),
  resetPassword: Joi.object({
    email: Joi.string().email().required(),
    otp: Joi.string().length(6).required(),
    password: Joi.string().min(6).required()
  }),
  refreshToken: Joi.object({
    refreshToken: Joi.string().required()
  }),
  profile: Joi.object({
    name: Joi.string().min(3).max(100).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().min(10).max(20).optional().allow('', null),
    address: Joi.string().min(5).max(255).required(),
    address_lat: Joi.number().optional().allow(null),
    address_lng: Joi.number().optional().allow(null)
  }),
  booking: Joi.object({
    service_id: Joi.number().required(),
    sub_service_ids: Joi.array().items(Joi.number()).min(1).required(),
    scheduled_date: Joi.date().iso().required(),
    scheduled_time: Joi.string().pattern(/^([01]\d|2[0-3]):?([0-5]\d)$/).required(),
    payment_method: Joi.string().valid('dummy_gateway', 'cod').required(),
    provider_id: Joi.number().required(),
    address: Joi.string().min(5).max(255).required(),
    address_lat: Joi.number().optional().allow(null),
    address_lng: Joi.number().optional().allow(null)
  }),
  assignProvider: Joi.object({
    provider_id: Joi.number().required()
  }),
  bookingStatus: Joi.object({
    status: Joi.string().valid('pending', 'assigned', 'completed', 'cancelled').required()
  })
};

const formatJoiError = (error) => error.details.map((detail) => detail.message).join(', ');

const validateBody = (schemaName) => {
  if (!schemas[schemaName]) {
    throw new Error(`Validation schema not found: ${schemaName}`);
  }

  return (req, res, next) => {
    const { error, value } = schemas[schemaName].validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      return res.status(400).json({ error: formatJoiError(error) });
    }

    req.body = value;
    next();
  };
};

module.exports = {
  validateBody,
  schemas
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\+?[0-9]{10,20}$/;
const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

const formatErrors = (errors) => ({
  valid: Object.keys(errors).length === 0,
  errors
});

export const validateRegisterForm = ({ name, email, password, phone, address }) => {
  const errors = {};

  if (!name || name.trim().length < 3) {
    errors.name = 'Name must be at least 3 characters long.';
  }
  if (!email || !emailRegex.test(email)) {
    errors.email = 'Please enter a valid email address.';
  }
  if (!password || password.length < 6) {
    errors.password = 'Password must be at least 6 characters long.';
  }
  if (phone && !phoneRegex.test(phone)) {
    errors.phone = 'Phone number must be 10 to 20 digits and may include a leading +.';
  }
  if (!address || address.trim().length < 5) {
    errors.address = 'Please enter your service address.';
  }

  return formatErrors(errors);
};

export const validateLoginForm = ({ email, password }) => {
  const errors = {};

  if (!email || !emailRegex.test(email)) {
    errors.email = 'Please enter a valid email address.';
  }
  if (!password) {
    errors.password = 'Please enter your password.';
  }

  return formatErrors(errors);
};

export const validateForgotPasswordForm = ({ email }) => {
  const errors = {};
  if (!email || !emailRegex.test(email)) {
    errors.email = 'Please enter a valid email address.';
  }
  return formatErrors(errors);
};

export const validateResetPasswordForm = ({ email, otp, password, confirmPassword }) => {
  const errors = {};

  if (!email || !emailRegex.test(email)) {
    errors.email = 'Please enter a valid email address.';
  }
  if (!otp || otp.trim().length !== 6) {
    errors.otp = 'OTP must be 6 characters long.';
  }
  if (!password || password.length < 6) {
    errors.password = 'Password must be at least 6 characters long.';
  }
  if (password !== confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.';
  }

  return formatErrors(errors);
};

export const validateProfileForm = ({ name, email, phone, address }) => {
  const errors = {};

  if (!name || name.trim().length < 3) {
    errors.name = 'Name must be at least 3 characters long.';
  }
  if (!email || !emailRegex.test(email)) {
    errors.email = 'Please enter a valid email address.';
  }
  if (phone && !phoneRegex.test(phone)) {
    errors.phone = 'Phone number must be 10 to 20 digits and may include a leading +.';
  }
  if (!address || address.trim().length < 5) {
    errors.address = 'Please enter your address.';
  }

  return formatErrors(errors);
};

export const validateBookingRequest = ({ service_id, sub_service_ids, scheduled_date, scheduled_time, payment_method, provider_id, address }) => {
  const errors = {};

  if (!service_id || typeof service_id !== 'number') {
    errors.service_id = 'Service is required.';
  }
  if (!Array.isArray(sub_service_ids) || sub_service_ids.length === 0) {
    errors.sub_service_ids = 'At least one sub-service must be selected.';
  }
  if (!scheduled_date) {
    errors.scheduled_date = 'Scheduled date is required.';
  }
  if (!scheduled_time || !timeRegex.test(scheduled_time)) {
    errors.scheduled_time = 'Scheduled time must be a valid HH:MM value.';
  }
  if (!['dummy_gateway', 'cod'].includes(payment_method)) {
    errors.payment_method = 'Please select a valid payment method.';
  }
  if (!provider_id || typeof provider_id !== 'number') {
    errors.provider_id = 'A provider must be selected.';
  }
  if (!address || address.trim().length < 5) {
    errors.address = 'Please enter the service address.';
  }

  return formatErrors(errors);
};

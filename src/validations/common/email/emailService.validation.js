import { checkSchema } from 'express-validator';


// Define the validation schema for email inputs
export const emailValidationSchema = checkSchema({
  to: {
    isEmail: {
      errorMessage: 'Invalid recipient email address',
    },
    normalizeEmail: true,
  },
  subject: {
    trim: true,
    notEmpty: {
      errorMessage: 'Subject is required',
    },
  },
  text: {
    trim: true,
    notEmpty: {
      errorMessage: 'Text content is required',
    },
  },
  html: {
    optional: true,
    trim: true,
    isLength: {
      options: { min: 1 },
      errorMessage: 'Invalid HTML content',
    },
  },
});


import Joi from 'joi';

export const validationSchema = Joi.object({
  APP_PORT: Joi.number().default(8080).required(),

  API_KEY: Joi.string().required(),
  API_SECRET: Joi.string().required(),
  API_PASS: Joi.string().required(),
  SYMBOL: Joi.string().required(),

  BUY_AMOUNT: Joi.number().required(),
  TAKE_PROFIT_PERCENTAGE: Joi.number().required(),
  PRICE_DROP_PERCENTAGE: Joi.number().required(),
  INSURANCE_ORDERS_AMOUNT: Joi.number().required(),
  INSURANCE_ORDERS_INTERVAL_MULTIPLIER: Joi.number().required(),
  INSURANCE_ORDERS_MULTIPLIER: Joi.number().required(),
});

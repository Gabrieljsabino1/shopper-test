import { Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";

export const uploadValidationRules = () => {
  return [
    body("image")
      .exists()
      .withMessage('O campo "image" é obrigatório.')
      .isString()
      .withMessage('O campo "image" deve ser uma string.')
      .matches(/^data:image\/(png|jpeg|jpg);base64,/)
      .withMessage("A imagem deve estar em formato base64 válido."),
    body("customer_code")
      .exists()
      .withMessage('O campo "customer_code" é obrigatório.')
      .isString()
      .withMessage('O campo "customer_code" deve ser uma string.'),
    body("measure_datetime")
      .exists()
      .withMessage('O campo "measure_datetime" é obrigatório.')
      .isISO8601()
      .withMessage(
        'O campo "measure_datetime" deve ser uma data válida no formato ISO 8601.'
      ),
    body("measure_type")
      .exists()
      .withMessage('O campo "measure_type" é obrigatório.')
      .isIn(["WATER", "GAS"])
      .withMessage('O campo "measure_type" deve ser "WATER" ou "GAS".'),
  ];
};

export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return next();
  }

  const extractedErrors = errors.array().map((err) => {
    return {
      error_code: "INVALID_DATA",
      error_description: err.msg,
    };
  });

  extractedErrors.forEach((err) => {
    if (err.error_description.includes("measure_type")) {
      err.error_code = "INVALID_MEASURE_TYPE";
    }
  });

  return res.status(400).json({
    errors: extractedErrors,
  });
};

import { Router } from "express";
import { uploadImagem, getMeasurements } from "../controllers/uploadController";
import { confirmUpload } from "../controllers/confirmController";
import { authMiddleware } from "../middlewares/authMiddleware";
import {
  uploadValidationRules,
  validate,
} from "../middlewares/validationMiddleware";

const router = Router();

router.post(
  "/upload",
  authMiddleware,
  uploadValidationRules(),
  validate,
  uploadImagem
);

router.patch("/upload/confirm", authMiddleware, confirmUpload);

router.get("/:customer_code/list", authMiddleware, async (req, res) => {
  const { customer_code } = req.params;
  const { measure_type } = req.query;

  if (!customer_code) {
    return res.status(400).json({
      error_code: "INVALID_DATA",
      error_description: "Código do cliente é necessário.",
    });
  }

  try {
    const measures = await getMeasurements(
      customer_code,
      measure_type as string
    );
    return res.status(200).json(measures);
  } catch (error) {
    return res.status(500).json({
      error_code: "INTERNAL_ERROR",
      error_description: "Erro ao listar as medições.",
    });
  }
});

export default router;

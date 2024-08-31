import express from "express";
import {
  confirmarLeitura,
  listarMedidas,
} from "../controllers/measureController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { uploadImagem } from "../controllers/uploadController";
import { uploadValidationRules } from "../middlewares/validationMiddleware";

const router = express.Router();

router.post("/upload", authMiddleware, uploadImagem, uploadValidationRules);
router.patch("/confirm", confirmarLeitura);
router.get("/:customer_code/list", listarMedidas);

export default router;

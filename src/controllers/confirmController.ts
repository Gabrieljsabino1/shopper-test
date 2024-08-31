import { Request, Response } from "express";
import Measure from "../models/measureModel";

export const confirmUpload = async (req: Request, res: Response) => {
  try {
    const { measure_uuid, confirmed_value } = req.body;

    if (
      typeof measure_uuid !== "string" ||
      typeof confirmed_value !== "number"
    ) {
      return res.status(400).json({
        error_code: "INVALID_DATA",
        error_description: "UUID da medição e valor confirmado são necessários",
      });
    }

    const measure = await Measure.findOne({
      where: { measure_uuid },
    });

    if (!measure) {
      return res.status(404).json({
        error_code: "MEASURE_NOT_FOUND",
        error_description: "Medição não encontrada",
      });
    }

    if (measure.has_confirmed) {
      return res.status(409).json({
        error_code: "CONFIRMATION_DUPLICATE",
        error_description: "Leitura já confirmada",
      });
    }

    await measure.update({
      measure_value: confirmed_value,
      has_confirmed: true,
    });

    res.status(200).json({
      success: true,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({
        error_code: "INTERNAL_ERROR",
        error_description: error.message,
      });
    } else {
      res.status(500).json({
        error_code: "INTERNAL_ERROR",
        error_description: "Erro desconhecido ao confirmar a medição.",
      });
    }
  }
};

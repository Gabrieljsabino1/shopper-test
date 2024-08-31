import { Request, Response } from "express";
import { confirmMeasureValue, listMeasures } from "../services/measureService";

export const confirmarLeitura = async (req: Request, res: Response) => {
  try {
    const { measure_uuid, confirmed_value } = req.body;

    if (
      !measure_uuid ||
      typeof measure_uuid !== "string" ||
      confirmed_value === undefined ||
      typeof confirmed_value !== "number"
    ) {
      return res.status(400).json({
        error_code: "INVALID_DATA",
        error_description: "Dados fornecidos são inválidos.",
      });
    }

    const confirmationResult = await confirmMeasureValue(
      measure_uuid,
      confirmed_value
    );

    if (confirmationResult.status === "MEASURE_NOT_FOUND") {
      return res.status(404).json({
        error_code: "MEASURE_NOT_FOUND",
        error_description: "Medição não encontrada.",
      });
    }

    if (confirmationResult.status === "CONFIRMATION_DUPLICATE") {
      return res.status(409).json({
        error_code: "CONFIRMATION_DUPLICATE",
        error_description: "Leitura já confirmada.",
      });
    }

    return res.status(200).json({ success: true });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({
        error_code: "INTERNAL_ERROR",
        error_description: error.message || "Erro ao confirmar a leitura.",
      });
    } else {
      return res.status(500).json({
        error_code: "INTERNAL_ERROR",
        error_description: "Erro desconhecido ao confirmar a leitura.",
      });
    }
  }
};

export const listarMedidas = async (req: Request, res: Response) => {
  try {
    const { customer_code } = req.params;
    const { measure_type } = req.query;

    if (!customer_code || typeof customer_code !== "string") {
      return res.status(400).json({
        error_code: "INVALID_DATA",
        error_description: "Código do cliente inválido.",
      });
    }

    let measureTypeString: string | undefined;

    if (measure_type) {
      if (typeof measure_type !== "string") {
        return res.status(400).json({
          error_code: "INVALID_DATA",
          error_description: "O parâmetro measure_type deve ser uma string.",
        });
      }

      const upperMeasureType = measure_type.toUpperCase();

      if (!["WATER", "GAS"].includes(upperMeasureType)) {
        return res.status(400).json({
          error_code: "INVALID_TYPE",
          error_description: "Tipo de medição não permitida.",
        });
      }

      measureTypeString = upperMeasureType;
    }

    const measures = await listMeasures(customer_code, measureTypeString);

    if (measures.length === 0) {
      return res.status(404).json({
        error_code: "MEASURES_NOT_FOUND",
        error_description: "Nenhuma medição encontrada.",
      });
    }

    return res.status(200).json({
      customer_code,
      measures: measures.map((measure) => ({
        measure_uuid: measure.measure_uuid,
        measure_datetime: measure.measure_datetime.toISOString(),
        measure_type: measure.measure_type,
        measure_value: measure.measure_value,
        image_url: measure.image_url,
        has_confirmed: measure.has_confirmed,
      })),
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({
        error_code: "INTERNAL_ERROR",
        error_description: error.message || "Erro ao listar as medidas.",
      });
    } else {
      return res.status(500).json({
        error_code: "INTERNAL_ERROR",
        error_description: "Erro desconhecido ao listar as medidas.",
      });
    }
  }
};

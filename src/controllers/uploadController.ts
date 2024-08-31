import { Request, Response } from "express";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";
import { analyzeImage, checkExistingMeasure } from "../services/geminiService";
import Measure, { MeasureType } from "../models/measureModel";
import dotenv from "dotenv";

dotenv.config();

const geminiApiKey = process.env.GEMINI_API_KEY || "";
const fileManager = new GoogleAIFileManager(geminiApiKey);

const isValidMeasureType = (type: string): boolean =>
  ["WATER", "GAS"].includes(type.toUpperCase());

export const uploadImagem = async (req: Request, res: Response) => {
  try {
    const { image, customer_code, measure_datetime, measure_type } = req.body;

    if (
      typeof image !== "string" ||
      typeof customer_code !== "string" ||
      typeof measure_datetime !== "string" ||
      !isValidMeasureType(measure_type)
    ) {
      return res.status(400).json({
        error_code: "INVALID_DATA",
        error_description: "Dados fornecidos são inválidos",
      });
    }

    if (
      await checkExistingMeasure(customer_code, measure_type, measure_datetime)
    ) {
      return res.status(409).json({
        error_code: "DOUBLE_REPORT",
        error_description: "Leitura do mês já realizada",
      });
    }

    const imageBuffer = Buffer.from(image, "base64");
    const tempDir = path.join(__dirname, "tmp");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }
    const tempFilePath = path.join(tempDir, `temp-${uuidv4()}.jpg`);

    try {
      fs.writeFileSync(tempFilePath, imageBuffer);
    } catch (fileError) {
      return res.status(500).json({
        error_code: "FILE_WRITE_ERROR",
        error_description: "Erro ao escrever o arquivo temporário.",
      });
    }

    let result;
    try {
      result = await fileManager.uploadFile(tempFilePath, {
        mimeType: "image/jpeg",
        displayName: `${measure_type}-${customer_code}-${measure_datetime}`,
      });
    } catch (uploadError) {
      return res.status(500).json({
        error_code: "UPLOAD_ERROR",
        error_description: "Erro ao fazer upload do arquivo para o Google AI.",
      });
    } finally {
      fs.unlinkSync(tempFilePath);
    }

    const imageUri = result.file.uri;

    let response;
    try {
      response = await analyzeImage(imageUri);
    } catch (apiError) {
      const errorMessage =
        apiError instanceof Error ? apiError.message : "Erro desconhecido";
      return res.status(500).json({
        error_code: "GEMINI_API_ERROR",
        error_description: errorMessage,
      });
    }

    // Verifica se a resposta tem a propriedade value
    const measure_value =
      response && typeof response.value === "number" ? response.value : 0;
    const measure_uuid = uuidv4();

    await Measure.create({
      measure_uuid,
      customer_code,
      measure_datetime: new Date(measure_datetime),
      measure_type: measure_type.toUpperCase(),
      measure_value,
      image_url: imageUri,
      has_confirmed: false,
    });

    res.status(200).json({
      image_url: imageUri,
      measure_value,
      measure_uuid,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Erro interno desconhecido";
    res.status(500).json({
      error_code: "INTERNAL_ERROR",
      error_description: errorMessage,
    });
  }
};

export const getMeasurements = async (
  customer_code: string,
  measure_type?: string
) => {
  try {
    const whereClause: any = {
      customer_code,
    };

    if (measure_type) {
      whereClause.measure_type = measure_type;
    }

    const measures = await Measure.findAll({
      where: whereClause,
      order: [["measure_datetime", "DESC"]],
    });

    return {
      measures: measures.map((measure) => ({
        measure_uuid: measure.measure_uuid,
        measure_datetime: measure.measure_datetime,
        measure_type: measure.measure_type as MeasureType,
        measure_value: measure.measure_value,
        image_url: measure.image_url,
        has_confirmed: measure.has_confirmed,
      })),
    };
  } catch (error) {
    console.error("Erro ao listar as medições:", error);
    throw new Error("INTERNAL_ERROR");
  }
};

import { GoogleAIFileManager } from "@google/generative-ai/server";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
import Measure from "../models/measureModel";
import { Op } from "sequelize";

dotenv.config();
const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY || "");

export const uploadImageToGemini = async (
  base64Image: string,
  customer_code: string,
  measure_type: string,
  measure_datetime: string
) => {
  try {
    const uploadResponse = await fileManager.uploadFile(base64Image, {
      mimeType: "image/jpeg",
      displayName: `${measure_type}-${customer_code}-${measure_datetime}`,
    });

    const measure_uuid = uuidv4();

    return {
      image_url: uploadResponse.file.uri,
      measure_value: Math.floor(Math.random() * 1000),
      measure_uuid,
    };
  } catch (error) {
    console.error("Erro ao processar a imagem:", error);
    throw new Error("UPLOAD_ERROR");
  }
};

export const analyzeImage = async (
  imageUri: string
): Promise<{ value: number }> => {
  try {
    const response = await fetch("https://api.gemini.com/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GEMINI_API_KEY}`,
      },
      body: JSON.stringify({ imageUri }),
    });

    if (!response.ok) {
      throw new Error("Erro ao chamar a API Gemini");
    }

    const data = await response.json();

    return data.value;
  } catch (error) {
    console.error("Erro ao analisar a imagem:", error);
    throw error;
  }
};

export const checkExistingMeasure = async (
  customer_code: string,
  measure_type: string,
  measure_datetime: string
): Promise<boolean> => {
  try {
    const measureDate = new Date(measure_datetime);

    const existingMeasure = await Measure.findOne({
      where: {
        customer_code,
        measure_type,
        measure_datetime: {
          [Op.gte]: measureDate.setUTCHours(0, 0, 0, 0),
          [Op.lt]: new Date(measureDate.setUTCHours(23, 59, 59, 999)),
        },
      },
    });

    return existingMeasure !== null;
  } catch (error) {
    console.error("Erro ao verificar a medição existente:", error);
    throw new Error("INTERNAL_ERROR");
  }
};

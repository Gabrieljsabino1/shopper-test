import Measure from "../models/measureModel";
import { MeasureType } from "../models/measureModel";

interface ConfirmMeasureResponse {
  status: string;
}

export const confirmMeasureValue = async (
  measure_uuid: string,
  confirmed_value: number
): Promise<ConfirmMeasureResponse> => {
  try {
    const measure = await Measure.findOne({
      where: { measure_uuid },
    });

    if (!measure) {
      return { status: "MEASURE_NOT_FOUND" };
    }

    if (measure.has_confirmed) {
      return { status: "CONFIRMATION_DUPLICATE" };
    }

    await measure.update({
      measure_value: confirmed_value,
      has_confirmed: true,
    });

    return { status: "SUCCESS" };
  } catch (error) {
    console.error("Erro ao confirmar a medição:", error);
    return { status: "INTERNAL_ERROR" };
  }
};

export const listMeasures = async (
  customer_code: string,
  measureType?: string
): Promise<Measure[]> => {
  try {
    const whereClause: any = {
      customer_code,
    };

    if (measureType) {
      whereClause.measure_type = measureType;
    }

    const measures = await Measure.findAll({
      where: whereClause,
      order: [["measure_datetime", "DESC"]],
    });

    return measures;
  } catch (error) {
    console.error("Erro ao listar as medições:", error);
    throw new Error("INTERNAL_ERROR");
  }
};

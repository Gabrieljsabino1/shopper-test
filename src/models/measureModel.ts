import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/db";

export enum MeasureType {
  WATER = "WATER",
  GAS = "GAS",
}

interface MeasureAttributes {
  measure_uuid: string;
  customer_code: string;
  measure_datetime: Date;
  measure_type: MeasureType; // Use MeasureType em vez de string
  measure_value: number;
  image_url: string;
  has_confirmed: boolean;
}

interface MeasureCreationAttributes
  extends Optional<MeasureAttributes, "measure_uuid"> {}

class Measure
  extends Model<MeasureAttributes, MeasureCreationAttributes>
  implements MeasureAttributes
{
  public measure_uuid!: string;
  public customer_code!: string;
  public measure_datetime!: Date;
  public measure_type!: MeasureType;
  public measure_value!: number;
  public image_url!: string;
  public has_confirmed!: boolean;
}

Measure.init(
  {
    measure_uuid: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    customer_code: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    measure_datetime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    measure_type: {
      type: DataTypes.ENUM(...Object.values(MeasureType)),
      allowNull: false,
    },
    measure_value: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    image_url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    has_confirmed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: "measures",
    timestamps: false,
  }
);

export default Measure;

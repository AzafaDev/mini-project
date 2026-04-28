import { AppError } from "./AppError";

export const parseDate = (dateStr: string, fieldName: string): Date => {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    throw new AppError(`Invalid date format for ${fieldName}`, 400);
  }
  return date;
};

export const parseNumber = (value: any, fieldName: string): number => {
  const num = Number(value);
  if (isNaN(num)) {
    throw new AppError(`Invalid numeric value for ${fieldName}`, 400);
  }
  return num;
};

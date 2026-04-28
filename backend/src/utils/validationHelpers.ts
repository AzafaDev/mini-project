import { PHONE_NUMBER_REGEX } from "../config/constants";

export const validatePhoneNumber = (phone: string): boolean => {
  return PHONE_NUMBER_REGEX.test(phone);
};

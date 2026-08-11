import type { validation as enValidation } from "../en/validation";

export const validation = {
  required: "Trường này là bắt buộc",
  invalidEmail: "Vui lòng nhập địa chỉ email hợp lệ",
  invalidPhone: "Vui lòng nhập số điện thoại hợp lệ",
  tooShort: "Giá trị này quá ngắn",
  tooLong: "Giá trị này quá dài",
  invalidFormat: "Giá trị này không đúng định dạng",
} as const satisfies typeof enValidation;

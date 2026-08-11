import type { validation as enValidation } from "../en/validation";

export const validation = {
  required: "此字段为必填项",
  invalidEmail: "请输入有效的电子邮箱地址",
  invalidPhone: "请输入有效的电话号码",
  tooShort: "该值过短",
  tooLong: "该值过长",
  invalidFormat: "该值格式无效",
} as const satisfies typeof enValidation;

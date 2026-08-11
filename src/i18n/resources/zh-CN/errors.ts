import type { errors as enErrors } from "../en/errors";

export const errors = {
  system: {
    error: "发生错误，请重试。",
  },
  validation: {
    failed: "验证失败",
    invalidInput: "输入无效",
    requiredField: "缺少必填字段",
    invalidFormat: "格式无效",
    duplicateEntry: "该数据已存在",
  },
  client: {
    badRequest: "请求无效",
    notFound: "未找到资源",
    conflict: "数据存在冲突",
    tooManyRequests: "请求过于频繁，请稍后重试",
  },
  auth: {
    invalidCredentials: "凭据无效",
    tokenExpired: "您的会话已过期",
    unauthorized: "您无权执行此操作",
    forbidden: "访问被拒绝",
    sessionExpired: "会话已过期，请重新登录。",
  },
  user: {
    notFound: "未找到用户",
  },
  product: {
    notFound: "未找到商品",
  },
  order: {
    notFound: "未找到订单",
  },
  inventory: {
    insufficientStock: "库存不足",
  },
  payment: {
    failed: "支付失败",
  },
  shipping: {
    notFound: "未找到货运信息",
  },
  generic: {
    fallback: "发生了意外错误",
  },
} as const satisfies typeof enErrors;

import type { permissions as enPermissions } from "../en/permissions";

export const permissions = {
  root: "完全系统访问权限",
  user: "平台用户",
  categories: {
    role: "角色",
    permission: "权限",
    product: "商品",
    inventory: "库存",
    warehouse: "仓库",
    order: "订单",
    audit: "审计",
    notification: "通知",
    users: "用户管理",
    tenant: "租户",
    system: "系统",
  },
} as const satisfies typeof enPermissions;

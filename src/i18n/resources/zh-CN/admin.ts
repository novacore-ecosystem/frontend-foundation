import type { admin as enAdmin } from "../en/admin";

export const admin = {
  entities: {
    users: "用户",
    roles: "角色",
    permissions: "权限",
    positions: "职位",
    products: "商品",
    variants: "变体",
    inventory: "库存",
    warehouses: "仓库",
    orders: "订单",
    payments: "支付",
    shipments: "货运",
    promotions: "促销",
    settings: "设置",
  },
} as const satisfies typeof enAdmin;

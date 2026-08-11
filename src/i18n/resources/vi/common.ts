import type { common as enCommon } from "../en/common";

/** Vietnamese translation of `resources/en/common.ts`. Kept shape-complete via `satisfies typeof enCommon`. */
export const common = {
  actions: {
    create: "Tạo mới",
    edit: "Chỉnh sửa",
    delete: "Xóa",
    save: "Lưu",
    cancel: "Hủy",
    close: "Đóng",
    search: "Tìm kiếm",
    reset: "Đặt lại",
    confirm: "Xác nhận",
    apply: "Áp dụng",
    refresh: "Làm mới",
    view: "Xem",
    back: "Quay lại",
    next: "Tiếp theo",
    submit: "Gửi",
  },
  status: {
    active: "Đang hoạt động",
    inactive: "Không hoạt động",
    pending: "Đang chờ",
    success: "Thành công",
    failed: "Thất bại",
    draft: "Bản nháp",
    archived: "Đã lưu trữ",
  },
  pagination: {
    next: "Tiếp",
    previous: "Trước",
    first: "Đầu",
    last: "Cuối",
    page: "Trang",
    of: "trên",
    itemsPerPage: "Số mục mỗi trang",
  },
  table: {
    empty: "Không có dữ liệu",
    loading: "Đang tải…",
    noResults: "Không tìm thấy kết quả",
  },
  welcome: "Chào mừng, {{name}}",
} as const satisfies typeof enCommon;

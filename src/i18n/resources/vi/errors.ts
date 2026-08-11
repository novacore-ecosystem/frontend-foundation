import type { errors as enErrors } from "../en/errors";

export const errors = {
  system: {
    error: "Đã xảy ra lỗi. Vui lòng thử lại.",
  },
  validation: {
    failed: "Xác thực thất bại",
    invalidInput: "Dữ liệu nhập không hợp lệ",
    requiredField: "Thiếu trường bắt buộc",
    invalidFormat: "Định dạng không hợp lệ",
    duplicateEntry: "Dữ liệu này đã tồn tại",
  },
  client: {
    badRequest: "Yêu cầu không hợp lệ",
    notFound: "Không tìm thấy tài nguyên",
    conflict: "Dữ liệu bị xung đột",
    tooManyRequests: "Quá nhiều yêu cầu — vui lòng thử lại sau",
  },
  auth: {
    invalidCredentials: "Thông tin đăng nhập không hợp lệ",
    tokenExpired: "Phiên đăng nhập của bạn đã hết hạn",
    unauthorized: "Bạn không có quyền thực hiện hành động này",
    forbidden: "Truy cập bị từ chối",
    sessionExpired: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
  },
  user: {
    notFound: "Không tìm thấy người dùng",
  },
  product: {
    notFound: "Không tìm thấy sản phẩm",
  },
  order: {
    notFound: "Không tìm thấy đơn hàng",
  },
  inventory: {
    insufficientStock: "Không đủ hàng tồn kho",
  },
  payment: {
    failed: "Thanh toán thất bại",
  },
  shipping: {
    notFound: "Không tìm thấy lô hàng",
  },
  generic: {
    fallback: "Đã xảy ra lỗi không mong muốn",
  },
} as const satisfies typeof enErrors;

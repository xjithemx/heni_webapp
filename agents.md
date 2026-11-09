# AGENTS.md — QUY CHUẨN PHÁT TRIỂN & VẬN HÀNH DÀNH CHO AI AGENTS (`heni_webapp`)

Tài liệu này là **hiến pháp bắt buộc (Mandatory Protocol)** đối với mọi AI Agent, Coding Assistant hoặc Developer khi đọc, sửa đổi hoặc nâng cấp dự án **Góc Bếp Nhà Hení (`xjithemx/heni_webapp`)**.

---

## 🚨 QUY TẮC SỐ 1 (BẮT BUỘC): CẬP NHẬT ĐỒNG BỘ 3 FILE TÀI LIỆU SAU MỖI THAY ĐỔI

Sau **bất kỳ** lần chỉnh sửa code, sửa lỗi (bugfix), thêm tính năng, hoặc thay đổi cấu hình nào trong project, Agent **BẮT BUỘC** phải cập nhật đồng thời cả 3 file tài liệu sau trước khi kết thúc lượt làm việc (và commit/push lên GitHub):

1. **[`prd.md`](./prd.md) (Product Requirements Document)**:
   - Cập nhật kiến trúc hệ thống, luồng dữ liệu, cấu trúc cột Google Sheets hoặc đặc tả tính năng nếu có thay đổi.
2. **[`usage_guide.md`](./usage_guide.md) (Tài liệu Hướng dẫn Vận hành cho Chủ tiệm 1 người)**:
   - Cập nhật hướng dẫn sử dụng bằng ngôn ngữ giản dị, trực quan, dễ hiểu cho người không chuyên công nghệ (Non-tech Solo Operator).
3. **[`README.md`](./README.md) (Project Brief & Detailed Changelog)**:
   - Giữ phần tóm tắt dự án ngắn gọn ở đầu file và **ghi thêm mục mới vào phần "Lịch sử Cập nhật & Nâng cấp Chi tiết (Detailed Changelog)"** theo thứ tự thời gian倒 (mới nhất ở trên cùng), nêu rõ nguyên nhân, giải pháp và các file đã thay đổi.

---

## 🎨 QUY TẮC SỐ 2: BẢO TOÀN THIẾT KẾ & TRẢI NGHIỆM NGUYÊN BẢN (UI/UX INVARIANTS)

1. **Giữ nguyên 100% Bản sắc Giao diện**:
   - Không tự ý đập bỏ cấu trúc Single-file Vue 3 + Tailwind CSS trong [`index.html`](./index.html).
   - Giữ nguyên bảng màu thương hiệu: `brand-bone` (`#F9F8F6`), `brand-green` (`#4F6B4A`), `brand-gold` (`#C49A45`), `brand-dark` (`#2C3D29`) và cặp font `Playfair Display` + `DM Sans`.
2. **Bảo vệ Quyền riêng tư Khách hàng (No `localStorage` PII)**:
   - **Tuyệt đối không** lưu Họ tên, Số điện thoại, Email, Địa chỉ của khách hàng vào `localStorage` hay `sessionStorage` để tránh gây cảm giác bị theo dõi đối với khách hàng không rành công nghệ.
3. **Tối ưu Tốc độ & Không Giới hạn (GitHub CDN First)**:
   - Hình ảnh sản phẩm và giao diện phải luôn được ưu tiên tải từ thư mục tĩnh [`./images/`](./images/) trên GitHub CDN thay vì quét Google Drive Base64.

---

## ⚙️ QUY TẮC SỐ 3: TỐI ƯU CHO MÔ HÌNH DOANH NGHIỆP 1 NGƯỜI (SOLO-FOUNDER ERGONOMICS)

1. **Zero-Code Content Update**:
   - Mọi thông tin biến động theo ngày/tuần (Menu, Giá bán, Calo, Trạng thái món `active`, Thông báo hàng tuần `WEEKLY_BANNER`, Danh sách email nhận báo cáo bếp `KITCHEN_REPORT_EMAILS`) phải luôn chỉnh sửa được dễ dàng qua **Google Sheets (`heni_webapp`)** hoặc file **[`config.js`](./config.js)** mà không bắt chủ tiệm phải can thiệp vào `index.html`.
2. **An toàn Tuyệt đối trong [`code.gs`](./code.gs)**:
   - Khi đọc dữ liệu từ các ô Google Sheets (`getValues()`, `getValue()`), luôn phải kiểm tra `null`/`undefined` trước khi gọi `.toString()` hoặc `.trim()`.
   - Chuẩn hóa số điện thoại bằng hàm `cleanPhone()` để xử lý triệt để trường hợp Google Sheets tự cắt số `0` ở đầu hoặc chuyển sang dạng số khoa học (`3.79524516E8`).
   - Đồng bộ bản sao của `code.gs` và `index.html` giữa thư mục repo (`/home/antigravity/xjithemx/heni_webapp/`) và thư mục gốc (`/home/antigravity/`) nếu tồn tại, nhằm tránh việc người dùng mở nhầm file cũ.
3. **Chế độ Làm việc Tự động (Auto-Fix & Auto-Review)**:
   - Luôn tự động kiểm tra cú pháp (`node --check`), tự động đối chiếu dữ liệu thực tế và đồng bộ lên nhánh `main` của GitHub (`xjithemx/heni_webapp`).

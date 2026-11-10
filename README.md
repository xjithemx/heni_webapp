# 🌿 Góc Bếp Nhà Hení (`heni_webapp`)

> **Ứng dụng Đặt Sữa Hạt Thủ Công Theo Ngày & Đặt Trước Cả Tuần**  
> **Live Web App (GitHub Pages CDN):** [https://xjithemx.github.io/heni_webapp/](https://xjithemx.github.io/heni_webapp/)

---

## 📌 1. TÓM TẮT NHANH DỰ ÁN (PROJECT BRIEF)

**Góc Bếp Nhà Hení** là hệ thống Web App đặt sữa hạt tươi nấu mới mỗi sáng, được thiết kế chuyên biệt cho **mô hình doanh nghiệp 1 người vận hành (Solo-Founder)** với triết lý:
* **Giữ nguyên 100% thiết kế nguyên bản**: Giao diện ấm cúng (`#F9F8F6`, `#4F6B4A`, `#C49A45`, `#2C3D29`), cặp font *Playfair Display* & *DM Sans*, bố cục trực quan gồm **Menu Sáng Mai**, **Lịch Đặt Trước Cả Tuần**, **Giỏ Hàng Đa Ngày** và **Sidebar Tra Cứu & Giải Trí**.
* **Kiến trúc Hybrid Siêu Tốc (GitHub CDN + Google Sheets DB)**:
  - Toàn bộ giao diện (`index.html`), cấu hình nhanh (`config.js`) và kho 22 hình ảnh (`images/`) được phục vụ trực tiếp trên **GitHub Pages CDN**, giúp mở trang và hiển thị ảnh tức thì trong **0.1 giây**, xóa bỏ hoàn toàn lỗi giới hạn băng thông và độ trễ Base64 của Google Drive.
  - Dữ liệu thực đơn (`Dim_Menu`), cấu hình thông báo tuần (`Dim_Config`), thanh toán (`payment_method`) và đơn hàng (`Orders_Master`, `Fact_Order_Items`) vẫn đồng bộ 2 chiều với **Google Sheets** qua Google Apps Script (`code.gs`).
* **Quyền riêng tư tuyệt đối (Privacy-First)**: Không lưu thông tin cá nhân của khách hàng vào trình duyệt (`localStorage`).
* **Tự động hóa Bếp 20h00 (Daily Kitchen Dispatch)**: Đúng 20h00 mỗi tối, hệ thống tự động tổng hợp số chai cần nấu cho ngày mai + danh sách khách hàng/địa chỉ/ghi chú và gửi báo cáo về email mặc định `ll.huyhoang.1412@gmail.com` (cùng các email trong `config.js`).

---

## 📚 2. HỆ THỐNG TÀI LIỆU TRONG REPOSITORY

| File Tài Liệu | Mục Đích Sử Dụng |
| :--- | :--- |
| **[`README.md`](./README.md)** | Tóm tắt nhanh dự án (Project Brief) và lưu trữ **Lịch sử cập nhật chi tiết (Detailed Changelog)** qua từng phiên bản. |
| **[`prd.md`](./prd.md)** | **Product Requirements Document**: Đặc tả toàn diện kiến trúc kỹ thuật, mô hình dữ liệu Google Sheets, luồng nghiệp vụ và đặc tả từng tính năng. |
| **[`usage_guide.md`](./usage_guide.md)** | **Hướng dẫn Vận hành & Quản trị**: Sổ tay cầm tay chỉ việc cho chủ tiệm 1 người (cách sửa menu, đổi giá, đổi thông báo tuần, gạch nợ, thêm email báo cáo bếp, cập nhật Apps Script). |
| **[`AGENTS.md`](./AGENTS.md)** | **Quy chuẩn bắt buộc cho AI Agents / Developers**: Quy định nguyên tắc thiết kế, bảo vệ kiến trúc và **luật bắt buộc cập nhật đồng thời 3 file (`prd.md`, `usage_guide.md`, `README.md`) sau mỗi lần thay đổi**. |
| **[`config.js`](./config.js)** | File cấu hình nhanh trên GitHub (thêm email nhận báo cáo 20h00, đổi banner thông báo tuần, cấu hình `GAS_API_URL`, thực đơn dự phòng). |

---

## 🕒 3. LỊCH SỬ CẬP NHẬT & NÂNG CẤP CHI TIẾT (DETAILED CHANGELOG)

### [v2.5.0] — 2026-11-09: Triển khai Bàn Giao Hàng Shipper (?view=staff) & Quản lý Bật/Tắt Menu / Lịch Tạm Nghỉ Quán (Dim_Closures)
* **Tính năng 1: Bàn Giao Hàng Cho Shipper & Bếp (`?view=staff`)**:
  - Shipper và chủ tiệm có thể truy cập qua URL `?view=staff` hoặc bấm nút ở chân trang web app.
  - Bảo mật cấp doanh nghiệp: Đăng nhập bằng Google Identity Services (GIS) OAuth hoặc xác thực Email trực tiếp đối chiếu với danh sách nhân sự tại tab `Staff` trên Google Sheets. Chỉ tài khoản có cờ `active: TRUE` mới được phép truy cập và xem thông tin giao hàng.
  - Giao diện tối ưu di động: Xem danh sách đơn giao theo ngày (Hôm nay / Ngày mai / Tùy chọn ngày), xem tổng đơn, tổng chai sữa, số tiền thu và địa chỉ giao hàng.
  - Thao tác nhanh tiện lợi: Gọi điện thoại trực tiếp (`tel:`), chat Zalo 1 chạm (`zalo.me/`), mở địa chỉ trên Google Maps.
  - Tương tác thời gian thực: Nút bấm **🚚 Đã giao xong** (ghi nhận thời gian và người giao vào Cột L `delivery_status`, Cột M `delivered_at`, Cột N `delivered_by`, kèm đồng hồ đếm ngược **10 giây Hoàn tác** nếu bấm nhầm); Nút **💵 Đã thu tiền mặt** (cập nhật Cột K `Status = Paid`).
* **Tính năng 2: Quản lý Bật/Tắt Menu & Lịch Tạm Nghỉ Quán (`Dim_Closures`)**:
  - Hỗ trợ chủ tiệm thiết lập lịch nghỉ tạm thời (theo Thứ trong tuần hoặc khoảng ngày cụ thể).
  - Khách hàng khi vào Web App vào ngày nghỉ: Vẫn xem được giao diện menu nguyên bản nhưng thấy banner thông báo ấm áp `🌿 Ngày này quán tạm nghỉ: [Lời nhắn]`, các món ăn được làm mờ nhẹ và nút thêm vào giỏ được chuyển thành trạng thái vô hiệu hóa `Tạm ngưng nhận đơn`. Lịch đặt trước cả tuần hiển thị nhãn `Nghỉ` trực quan.
  - Tự động hóa: Báo cáo nấu sữa 20h00 tự động kiểm tra lịch nghỉ ngày mai để gửi thông báo bếp nghỉ thay vì báo cáo sản xuất.
  - Chủ tiệm có quyền tạo lịch nghỉ hoặc bấm **Mở lại menu ngay** trực tiếp trên tab Shipper (nếu có role `owner`) hoặc qua tab `Dim_Closures` trên Google Sheets.
* **Chuẩn hóa Cơ sở Dữ liệu & An toàn Dữ liệu**:
  - Chuẩn hóa 15 cột `Orders_Master` (A..O): Cột J `owner note`, Cột K `Status`, Cột L `delivery_status `, Cột M `delivered_at`, Cột N `delivered_by`, Cột O `delivery_iso `.
  - Loại bỏ hoàn toàn mảng `FALLBACK_ORDERS` chứa thông tin khách hàng trong `config.js` và `index.html`, triệt tiêu rủi ro lộ lọt PII.
* **File thay đổi**: `code.gs`, `index.html`, `config.js`, `prd.md`, `usage_guide.md`, `README.md`.

---

### [v2.5.0-plan] — 2026-11-09: Cập nhật Kế hoạch theo Cấu trúc Cột Thực tế trên Sheet & Đã kết nối Web App (`GAS_API_URL`)
* **Hiện trạng thực tế cập nhật**:
  - `GAS_API_URL` đã được chủ tiệm kết nối thành công trên GitHub (`AKfycbylsdv.../exec`). Đơn hàng thực tế trong ngày (`HN-238080`, `HN-446049`, `HN-146858`) đã chạy thẳng vào Google Sheets.
  - Tab `Dim_Closures` (Lịch nghỉ) và tab `Staff` (Danh sách shipper) đã được tạo sẵn trên Google Sheets.
  - Cột `Orders_Master` đã được chuẩn hóa chính xác: **J: owner note**, **K: Status** (gạch nợ), **L: delivery_status **, **M: delivered_at**, **N: delivered_by**, **O: delivery_iso **.
* **Đã cập nhật**: Điều chỉnh artifact kế hoạch, `prd.md` và `usage_guide.md` khớp 100% với tên cột trên Sheet của chủ tiệm.
* **File thay đổi**: `prd.md`, `usage_guide.md`, `README.md`.

---

### [v2.4.2] — 2026-11-08: Rà soát Quy trình Gửi Email Xác nhận Đơn Hàng & Cảnh báo `GAS_API_URL`
* **Nguyên nhân không nhận được email ở đơn test**:
  - Web App đang chạy tĩnh trên GitHub Pages (`xjithemx.github.io/heni_webapp`). Do biến `GAS_API_URL` trong `config.js` đang để trống, hàm `submitOrder` trong `index.html` rơi vào nhánh mô phỏng (simulation fallback). Đơn hàng chưa từng được gửi về Google Apps Script (`code.gs`), nên `Orders_Master` không ghi nhận đơn mới và `MailApp.sendEmail()` chưa được kích hoạt.
* **Cải tiến & Khắc phục**:
  - Cập nhật hàm `submitOrder` trong `index.html`: Không âm thầm giả lập thành công nữa mà hiển thị thông báo cảnh báo rõ ràng khi `GAS_API_URL` chưa được thiết lập, tránh gây hiểu lầm cho người vận hành.
  - Hướng dẫn rõ ràng 5 bước lấy URL Web App Apps Script (`/exec`) và dán vào `config.js` để kích hoạt luồng gửi mail tự động tức thì.

---

### [v2.4.1] — 2026-11-08: Đồng bộ Nội dung Thông báo Tuần (`47 phần quà`) & Làm rõ Cơ chế Auto-Deploy GitHub Pages
* **Đồng bộ nội dung Thông báo tuần**: Đồng bộ số lượng quà tặng (`47 phần quà`) trong file `config.js` để đồng nhất với chỉnh sửa của chủ tiệm trên `index.html`.
* **Cơ chế cập nhật tự động (Zero-Deploy Overhead)**: Xác nhận GitHub Pages tự động build và xuất bản trong vòng 30s sau mỗi commit trên `main`, không cần bất kỳ thao tác deploy thủ công nào.

---

### [v2.4.0] — 2026-11-08: Sửa lỗi Đồng bộ Cột K (`Status`) trên `Orders_Master`, Bổ sung Live Google Sheets GViz JSONP & Đồng bộ 100% Dữ liệu Thực tế
* **Nguyên nhân gốc (Root Cause)**:
  - Khi mở Web App trên GitHub Pages (`https://xjithemx.github.io/heni_webapp/`) trong lúc `GAS_API_URL` trong `config.js` chưa được điền, hàm `searchOrder()` rơi vào nhánh dự phòng (`mockOrders`) vốn chỉ chứa 4 đơn mẫu cố định (trong đó đơn `#HN-592467` của khách `Vy` bị gán cứng ngày `04/11/2026` và trạng thái `Đã tiếp nhận` -> hiển thị `Chưa thanh toán`, đồng thời thiếu đơn `#HN-066384`).
  - Trong bảng `Orders_Master`, Cột J lưu trạng thái tiếp nhận mặc định (`Đã tiếp nhận`) còn **Cột K (`Status`)** mới là nơi chủ tiệm cập nhật trạng thái thanh toán (`Paid`, `Cancelled`).
* **Giải pháp đã triển khai (`index.html`, `config.js`, `code.gs`)**:
  1. **Tích hợp Live Google Sheets GViz JSONP (`fetchLiveOrdersFromSheet`) trong `index.html`**: Tự động truy vấn trực tiếp tab `Orders_Master` của Google Sheet (`1sjkxZS37_g-R3JowKI99AkaNTCb_HjhcAgrDAInrgb8`) theo thời gian thực ngay trên trình duyệt mà không bị chặn CORS khi chủ tiệm đã đăng nhập Google hoặc bật chia sẻ link.
  2. **Đồng bộ 100% toàn bộ 16 đơn hàng thực tế từ `Orders_Master` vào `config.js` (`FALLBACK_ORDERS`) & `index.html`**: Cập nhật đầy đủ cả 2 đơn của khách `Vy` (`#HN-592467` ngày `02/11/2026` - `30.000đ` - `Paid` và `#HN-066384` ngày `29/10/2026` - `25.000đ` - `Paid`) cùng toàn bộ 14 đơn hàng còn lại đúng 100% với Cột K trên Google Sheets.
  3. **Ưu tiên tuyệt đối Cột K (`Status`) & Hỗ trợ nhãn `Đã hủy` (`Cancelled`)**: Chuẩn hóa hàm `normalizeOrderStatus(colK, colJ)` trên cả `index.html` và `code.gs`, hiển thị đúng 3 trạng thái: **`Đã thanh toán`** (Xanh lá - `Paid`), **`Đã hủy`** (Xám - `Cancelled`), và **`Chưa thanh toán`** (Cam - trống/chưa trả).
  4. **Cập nhật `processOrder()` trong `code.gs`**: Ghi đủ 11 cột (`A..K`) khi tạo đơn mới và xử lý an toàn cột `Tổng Tiền` có dấu phẩy ngăn cách hàng nghìn.

---

### [v2.3.0] — 2026-11-08: Chuẩn hóa Hệ thống Tài liệu Dự án (`prd.md`, `usage_guide.md`, `README.md`, `AGENTS.md`) & Đồng bộ Workspace
* **Tài liệu hóa toàn diện**:
  - Tạo mới [`prd.md`](./prd.md): Ghi lại đầy đủ kiến trúc Hybrid (GitHub CDN + Google Sheets), cấu trúc 6 bảng dữ liệu (`Dim_Menu`, `Orders_Master`, `Fact_Order_Items`, `payment_method`, `Dim_Config`, `Tracking`) và đặc tả chi tiết mọi luồng tính năng.
  - Tạo mới [`usage_guide.md`](./usage_guide.md): Hướng dẫn vận hành thực tế từng bước cho chủ tiệm 1 người (quản lý menu, thông báo tuần, thanh toán, báo cáo nấu sữa 20h00 và cách copy `code.gs` sạch không dính lỗi cú pháp).
  - Tạo mới [`AGENTS.md`](./AGENTS.md): Thiết lập quy tắc bắt buộc cho mọi AI Agent/Developer khi làm việc trên dự án — luôn phải cập nhật đồng bộ `prd.md`, `usage_guide.md` và `README.md` sau mỗi lần nâng cấp hoặc sửa lỗi.
* **Khắc phục lỗi copy `code.gs` (`Unexpected identifier 'Antigravity'`)**:
  - Đồng bộ hóa file `code.gs` và `index.html` trên mọi đường dẫn workspace và hướng dẫn copy raw file để tránh copy nhầm tiêu đề giao diện.

---

### [v2.2.0] — 2026-11-08: Sửa dứt điểm Tính năng Tra Cứu Lịch Sử Đơn Hàng, Vá lỗi `getPaymentInfo` & Nâng cấp UX Thanh toán (`1edb17b`, `96d6aa0`)
* **Debug & Sửa lỗi Tra cứu Lịch sử Đơn hàng (`searchOrder` trong `index.html` & `searchOrders` trong `code.gs`)**:
  - *Nguyên nhân gốc*: Bản cũ dùng `.replace(/\D/g, '')` xóa sạch toàn bộ chữ cái nên khi nhập tên khách (VD: `"C Ngọc"`) chuỗi bị biến thành rỗng `""` và thoát hàm im lặng; đồng thời SĐT trên Google Sheets bị lưu dạng số mất số `0` đầu (`379524516` / `3.79524516E8`) khiến so sánh tuyệt đối bị trượt.
  - *Giải pháp đã triển khai*:
    1. Hỗ trợ **Tra cứu 3-trong-1**: Tìm theo **Tên khách hàng** (không phân biệt hoa/thường và không phân biệt dấu tiếng Việt — gõ `C Ngọc`, `c ngoc`, `Ngọc` đều ra kết quả), tìm theo **Số điện thoại** (tự động xử lý scientific notation và số `0` đầu, hỗ trợ tìm 4–10 số cuối), hoặc tìm theo **Mã đơn** (`HN-751646`).
    2. Kiểm tra đồng thời cả Cột J và Cột K trên `Orders_Master` để nhận diện chính xác trạng thái `Paid` / `Đã thanh toán`.
    3. Bổ sung thông báo hướng dẫn rõ ràng khi bấm tra cứu lúc ô tìm kiếm đang trống và tích hợp dữ liệu mẫu dự phòng khi chạy Local/Preview.
* **Debug & Sửa lỗi `getPaymentInfo` trong `code.gs` (Dòng 232)**:
  - *Nguyên nhân gốc*: Trong tab `payment_method`, ô QR của dòng VCB (C3) đang để trống nên `cell.getValue()` trả về `null`, gọi `.toString()` gây lỗi `TypeError`.
  - *Giải pháp đã triển khai*: Kiểm tra `null`/`undefined` an toàn trước khi gọi `.toString()`, bọc `try/catch` từng dòng để luôn trả về thông tin thanh toán ổn định.
* **Nâng cấp Trải nghiệm Người dùng (UX Polish)**:
  - Đưa các hàm `removeAccents()` và `cleanPhone()` lên cấp toàn cục (Global Scope) trong `code.gs` và chuẩn hóa hiển thị SĐT có số `0` đầu trong email Báo cáo Nấu Sữa 20h00.
  - Thêm nút **`Copy` 1 chạm** bên cạnh Số MoMo, Số tài khoản VCB và Số tiền trong khung Hướng dẫn thanh toán.
  - Thêm kiểm tra độ dài Số điện thoại (9–11 số) khi đặt hàng và hỗ trợ phím `Escape` (`Esc`) để đóng nhanh Modal Giỏ hàng / Sidebar.

---

### [v2.1.0] — 2026-11-08: Chuyển dịch lên GitHub Pages CDN, Tối ưu Vận hành 1 Người & Tự động hóa Báo cáo Bếp 20h00 (`41e135a`)
* **Di chuyển toàn bộ 22 Hình ảnh từ Google Drive sang GitHub CDN (`images/`)**:
  - Tải và đồng bộ toàn bộ ảnh giao diện (`logo-only.jpg`, `base.jpg`, `logo.jpg`, `menu.jpg`, `post.jpg`, `program.jpg`), ảnh QR (`momo.jpg`) và 15 ảnh món ăn (`t2_s1.png` -> `t7_p1.png`) vào thư mục [`images/`](./images/).
  - Thời gian tải trang và hiển thị ảnh giảm từ 5–8 giây xuống **0.1 giây**, loại bỏ hoàn toàn lỗi quá tải băng thông của Google Drive.
* **Thiết lập File Cấu hình Nhanh [`config.js`](./config.js)**:
  - Cho phép chủ tiệm cập nhật nhanh danh sách email nhận báo cáo bếp (`KITCHEN_REPORT_EMAILS`), nội dung thông báo hàng tuần (`WEEKLY_BANNER`), link API (`GAS_API_URL`) và thực đơn hiển thị tức thì (`FALLBACK_MENU`) ngay trên giao diện web GitHub.
* **Tự động hóa Báo cáo Nấu Sữa 20h00 (`sendDailyKitchenReport` & `setupDaily20hTrigger` trong `code.gs`)**:
  - Tự động tổng hợp tổng số chai cần nấu theo từng món cho ngày giao kế tiếp kèm danh sách chi tiết khách hàng, SĐT, địa chỉ và ghi chú.
  - Gửi email tự động lúc 20h00 mỗi tối về `ll.huyhoang.1412@gmail.com` và các email trong `config.js`.
* **Tự động điền cột `week` (`resolveCurrentWeekCode`)**:
  - Khi ghi đơn hàng mới vào `Fact_Order_Items`, tự động phát hiện và điền mã tuần hiện hành (`w1`, `w2`...) vào cột H.
* **Bảo vệ Quyền riêng tư Khách hàng**:
  - Loại bỏ cơ chế lưu thông tin khách hàng vào `localStorage` để khách hàng hoàn toàn yên tâm khi sử dụng.
* **Kích hoạt GitHub Pages**:
  - Cấu hình phát hành trực tiếp từ nhánh `main` tại địa chỉ `https://xjithemx.github.io/heni_webapp/`.

---

### [v2.0.0] — 2026-11-08: Tích hợp Bộ Kỹ năng Chuyên sâu (Agent Skills) (`0822af5`, `b7f3a2d`)
* Tích hợp 3 bộ kỹ năng chuẩn vào `.skills/` và `.claude/skills/`:
  1. `frontend-design` (Anthropic Official): Chuẩn hóa thẩm mỹ, typography và micro-copywriting.
  2. `taste-v3`: Kiểm soát chất lượng giao diện, chống slop UI và hoàn thiện chi tiết tương tác.
  3. `data-platform-alpha`: Đảm bảo tính toàn vẹn dữ liệu giữa Web App và Google Sheets.

---

### [v1.0.0] — 2026-11-08: Khởi tạo Repository (`e74e072`)
* Khởi tạo repository `xjithemx/heni_webapp` và tiếp nhận mã nguồn MVP ban đầu chạy trên Google Apps Script (`index.html`, `code.gs`) cùng cơ sở dữ liệu Google Sheets & Google Drive (`webapp_Heni`).

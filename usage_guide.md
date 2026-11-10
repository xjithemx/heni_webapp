# TÀI LIỆU HƯỚNG DẪN VẬN HÀNH & QUẢN TRỊ (USAGE GUIDE) — GÓC BẾP NHÀ HENÍ

> **Dành cho:** Chủ tiệm / Người quản lý bếp & vận hành (Mô hình doanh nghiệp 1 người — Không cần biết lập trình).  
> **Cập nhật lần cuối:** 2026-11-08  
> **Link Web App Chính Thức (GitHub CDN):** [https://xjithemx.github.io/heni_webapp/](https://xjithemx.github.io/heni_webapp/)  
> **Link Google Sheets Quản Trị:** [Mở Bảng Tính heni_webapp](https://docs.google.com/spreadsheets/d/1sjkxZS37_g-R3JowKI99AkaNTCb_HjhcAgrDAInrgb8/edit)

---

## 1. QUY TRÌNH VẬN HÀNH HẰNG NGÀY (DAILY AUTOMATION LOOP)

Với hệ thống mới đã được tự động hóa, công việc mỗi ngày của bạn được rút gọn tối đa:

### 🌞 Ban ngày (Khách tự đặt hàng & Tra cứu)
1. Khách mở link web, chọn món cho **Sáng Mai** hoặc **Đặt Trước Cả Tuần** và bấm **Xác nhận đơn hàng**.
2. Hệ thống tự động:
   - Ghi đơn tổng vào tab **`Orders_Master`** (trạng thái mặc định: `Đã tiếp nhận`).
   - Tách từng món vào tab **`Fact_Order_Items`** và **tự động điền cột `week` (`w1`, `w2`...)** — bạn không cần phải gõ tay cột `week` nữa.
   - Gửi ngay 1 email xác nhận đơn hàng chi tiết cho khách.
3. Khách muốn xem lại lịch sử đơn hoặc kiểm tra tiền sữa chốt tuần chỉ cần mở mục **Tra cứu & Giải trí** (nút kính lúp góc dưới phải), nhập **Tên** (VD: `C Ngọc`, `Anh Đào`), **Số điện thoại** (VD: `0379524516`), hoặc **Mã đơn** (`HN-751646`).

### 🌙 Đúng 20h00 Mỗi Tối (Chốt Mẻ Nấu Sữa Tự Động Cho Bếp)
1. **Trên Web**: Đúng 20h00, web tự động khóa đặt món cho sáng ngày mai và chuyển sang nhận đơn cho ngày kế tiếp.
2. **Báo cáo Bếp tự động gửi về Email**:
   - Đúng 20h00, hệ thống tự động gửi 1 email tiêu đề **`[Bếp Hení 20h00] Báo cáo nấu sữa giao Thứ ... — Tổng: XX chai`** về địa chỉ mặc định **`ll.huyhoang.1412@gmail.com`** (và các email bạn thêm trong `config.js`).
   - Trong email có sẵn **2 bảng rõ ràng**:
     1. **Tổng hợp số lượng cần nấu**: Mỗi vị bao nhiêu chai để bạn ngâm hạt ngay trong đêm.
     2. **Chi tiết khách nhận & ghi chú giao hàng**: Tên khách, SĐT (đã chuẩn hóa số 0 đầu), địa chỉ tòa nhà, và lời nhắn riêng (VD: *"ít ngọt"*, *"giữ chị 1 chai"*).
   - **Ứng dụng Zalo cho Bếp**: Bạn chỉ cần mở email trên điện thoại, copy nội dung báo cáo dán thẳng vào **Nhóm Zalo Bếp / Cloud của tôi** để sáng mai nấu và đi giao mà không cần mở máy tính lọc bảng tính.

---

## 2. QUẢN LÝ THỰC ĐƠN, GIÁ BÁN & CALO (TAB `Dim_Menu`)

Mọi thay đổi về món ăn được thực hiện trên tab **`Dim_Menu`** của Google Sheets và đồng bộ lên Web:

1. **Bật / Tắt món ăn linh hoạt**:
   - Để món hiển thị trên web: Gõ chữ **`active`** vào cột **`status`** (Cột G).
   - Khi hết nguyên liệu hoặc tạm ngưng bán: Xóa chữ `active` hoặc gõ `inactive`. Món đó sẽ tự động ẩn khỏi web mà không cần xóa dòng.
2. **Đổi Giá bán / Tên món / Mô tả / Calo**:
   - Sửa trực tiếp tại cột **`Tên Món`** (Cột B), **`Phân Loại`** (`Tiêu chuẩn` hoặc `Cao cấp` ở Cột C), **`Giá Bán`** (Cột D), **`Mô Tả`** (Cột F), và **`kcalo`** (Cột I).
3. **Cập nhật thực đơn dự phòng hiển thị tức thì (Tùy chọn)**:
   - Nếu bạn thay đổi cố định thực đơn tuần mới và muốn khách vừa bấm vào link trong 0.1 giây đầu tiên đã thấy ngay menu mới, bạn có thể cập nhật thêm mục `FALLBACK_MENU` trong file [`config.js`](./config.js) trên GitHub.

---

## 3. CẬP NHẬT NỘI DUNG THÔNG BÁO HÀNG TUẦN (WEEKLY CONTENT BANNER)

Khung thông báo ở giữa trang (ví dụ: *"Tổng kết tuần lễ ra mắt / Chân Thành Cảm Ơn 💚"*) giờ đây có thể thay đổi dễ dàng mà **không cần sửa code HTML**:

### Cách 1: Sửa trực tiếp trên Google Sheets (Tab `Dim_Config`) — Khuyên dùng
Mở tab **`Dim_Config`** trên Google Sheets, thêm hoặc sửa các dòng sau ở Cột A (`Key`) và Cột B (`Value`):

| Key (Cột A) | Value (Cột B - Nội dung bạn muốn hiển thị) | Ý nghĩa trên giao diện |
| :--- | :--- | :--- |
| `weekly_badge` | `Ưu đãi tuần mới` | Nhãn nhỏ màu vàng phía trên tiêu đề |
| `weekly_title` | `Chân Thành Cảm Ơn 💚` | Tiêu đề lớn của khung thông báo *(Mẹo: Nếu bạn xóa trống ô này, toàn bộ khung thông báo tuần sẽ tự động ẩn đi)* |
| `weekly_content` | `Chương trình ưu đãi tuần này tặng kèm 1 chai mini...` | Đoạn văn nội dung chi tiết |
| `weekly_footer` | `Sữa hạt vẫn luôn được nấu tươi mới mỗi sáng` | Dòng chữ nền xanh lá dưới cùng |
| `video_thu_gian` | `1S7qneg966XvP_X_OZikjMoR3aWH77jkn` | ID file video trên Google Drive hoặc link nhúng hiển thị ở mục "Góc Thư Giãn" trong Sidebar |

### Cách 2: Sửa nhanh trong file `config.js` trên GitHub
Mở file [`config.js`](./config.js) trên GitHub, tìm mục `WEEKLY_BANNER` (dòng 21–27) và sửa trực tiếp chữ bên trong. Nếu muốn tắt khung này, đổi `enabled: true` thành `enabled: false`.

---

## 4. QUẢN LÝ THANH TOÁN & GẠCH NỢ ĐƠN HÀNG

1. **Cập nhật Số MoMo / Vietcombank**:
   - Mở tab **`payment_method`** trên Google Sheets.
   - Sửa số tài khoản ở Cột B (`info`).
   - Trên màn hình Thanh toán của khách có sẵn nút **`Copy` 1 chạm** bên cạnh số MoMo, số tài khoản VCB và tổng tiền để khách copy nhanh không sợ gõ nhầm.
2. **Cập nhật ảnh mã QR MoMo**:
   - Ảnh QR mặc định đang được lưu siêu tốc tại [`images/momo.jpg`](./images/momo.jpg) trên GitHub. Nếu đổi mã QR mới, bạn chỉ cần thay file `images/momo.jpg` trên GitHub (hoặc gắn link Drive vào cột C tab `payment_method`).
3. **Gạch nợ & Cập nhật Trạng thái Đơn hàng (Cột K — `Status`)**:
   - Trên tab **`Orders_Master`**, **Cột J** là `owner note` (ghi chú nội bộ), còn **Cột K (`Status`)** là cột chuẩn để điều khiển trạng thái thanh toán hiển thị trên Web App:
     * Gõ **`Paid`** (hoặc `Đã thanh toán`): Đơn hàng hiển thị huy hiệu màu Xanh Lá **`Đã thanh toán`**.
     * Gõ **`Cancelled`** (hoặc `Đã hủy`): Đơn hàng hiển thị huy hiệu màu Xám **`Đã hủy`**.
     * Để trống (hoặc `Unpaid`): Đơn hàng hiển thị huy hiệu màu Cam **`Chưa thanh toán`**.
   - **Cột L (`delivery_status `)**: Shipper đánh dấu `Đã giao` hoặc để trống (chưa giao).
   - **Cơ chế đồng bộ**: Khi chủ tiệm mở Web App trên trình duyệt đã đăng nhập Google, Web App tự động đọc trực tiếp Cột K từ Google Sheets theo thời gian thực. Giờ đây đã có `GAS_API_URL`, mọi đơn mới đều được gửi trực tiếp vào Google Sheets và kích hoạt email tự động.

---

## 5. QUẢN LÝ HÌNH ẢNH MÓN ĂN TRÊN GITHUB CDN (`images/`)

Để trang web mở nhanh trong **0.1 giây** và không bao giờ bị lỗi giới hạn của Google Drive, toàn bộ hình ảnh được đặt trong thư mục [`images/`](./images/) trên GitHub:

* **Ảnh giao diện chung**:
  - `images/logo-only.jpg`: Logo tròn trên đầu trang.
  - `images/base.jpg`: Ảnh bìa lớn (Hero banner).
  - `images/momo.jpg`: Ảnh mã QR thanh toán MoMo.
* **Ảnh các món sữa hạt**:
  - Đặt tên file khớp 100% với cột **`ID Món (SKU)`** trên tab `Dim_Menu` (ví dụ: `t2_s1.png`, `t2_p1.png`, `t3_s1.png` ... `t7_p1.png`).
  - Khi có món mới hoặc chụp ảnh mới đẹp hơn: Bạn chỉ cần vào thư mục `images/` trên GitHub -> bấm **Add file** -> **Upload files** -> tải ảnh lên và bấm **Commit changes**.

---

## 6. CẬP NHẬT EMAIL NHẬN BÁO CÁO BẾP 20H00 TRÊN GITHUB

Mặc định báo cáo nấu sữa 20h00 luôn gửi về **`ll.huyhoang.1412@gmail.com`**. Khi bạn muốn thêm email của người phụ bếp hoặc email cá nhân khác:

1. Mở file [`config.js`](./config.js) trên GitHub.
2. Tại mục `KITCHEN_REPORT_EMAILS` (dòng 7–9), thêm email mới vào danh sách:
   ```javascript
   KITCHEN_REPORT_EMAILS: [
     'll.huyhoang.1412@gmail.com',
     'bep-phu-heni@gmail.com'
   ],
   ```
3. Bấm **Commit changes**. Đúng 20h00 tối, Google Apps Script sẽ tự động đọc file này trên GitHub và gửi báo cáo tới tất cả các email trong danh sách!

---

## 7. HƯỚNG DẪN CÀI ĐẶT & CẤP QUYỀN GOOGLE APPS SCRIPT (KHI CẬP NHẬT `code.gs`)

> [!CAUTION]
> **Lưu ý quan trọng khi copy code sang Google Apps Script:**  
> Tuyệt đối không bấm `Ctrl+A` ở ngoài giao diện xem trước vì sẽ copy dính chữ tiêu đề giao diện (`Antigravity`) gây lỗi `SyntaxError`. Hãy mở file [`code.gs`](./code.gs) trên GitHub và bấm nút **Copy raw file** (biểu tượng 2 ô vuông góc phải).

### Các bước cập nhật `code.gs`:
1. Mở file Google Sheets `heni_webapp` -> Chọn menu **Tiện ích mở rộng (Extensions)** -> **Apps Script**.
2. Xóa toàn bộ code cũ trong `Code.gs`, dán nội dung chuẩn từ file [`code.gs`](./code.gs) vào và bấm biểu tượng đĩa mềm **Lưu (Ctrl+S)**.
3. **Cấp quyền & Kiểm tra**:
   - Trên thanh công cụ phía trên, chọn hàm **`clearCacheAndForceAuth`** -> bấm **Chạy (Run)**. Nếu Google hỏi quyền, chọn *Xem xét quyền > Chọn tài khoản > Nâng cao (Advanced) > Đi tới dự án (Unsafe) > Cho phép (Allow)*.
4. **Kích hoạt hẹn giờ gửi Báo cáo Nấu Sữa 20h00 (Chỉ cần chạy 1 lần)**:
   - Trên thanh công cụ, chọn hàm **`setupDaily20hTrigger`** -> bấm **Chạy (Run)**.
5. **Lấy link API kết nối với GitHub Pages**:
   - Bấm nút **Triển khai (Deploy)** ở góc trên phải -> **Quản lý nội dung triển khai (Manage deployments)** -> Bấm biểu tượng cây bút **Chỉnh sửa (Edit)** -> Ở mục Phiên bản chọn **Phiên bản mới (New version)** -> Bấm **Triển khai (Deploy)**.
   - Copy đường link **URL ứng dụng web** (`https://script.google.com/macros/s/.../exec`) dán vào dòng `GAS_API_URL: '...'` trong file [`config.js`](./config.js) trên GitHub.

---

## 8. 🚧 SẮP RA MẮT (v2.5.0) — CHƯA HOẠT ĐỘNG, ĐANG CHỜ DUYỆT

> Phần này mô tả cách bạn **sẽ** dùng 2 tính năng mới. Hiện tại **chưa dùng được**.

### 8.1. Trang dành cho Shipper (Giao hàng & Thu tiền)
1. **Thêm shipper (1 lần)**: Mở Google Sheets → tab **`Staff`** → thêm 1 dòng: email Gmail của shipper | `shipper` | `TRUE` | tên. Muốn khóa quyền → đổi `TRUE` thành `FALSE`.
2. **Shipper mở link**: `https://xjithemx.github.io/heni_webapp/?view=staff` → bấm **Đăng nhập bằng Google** → thấy ngay danh sách đơn cần giao **hôm nay**.
3. **Khi giao xong**: bấm **✅ Đã giao**. **Khi khách trả tiền**: bấm **💰 Đã thu tiền** (Cột K trên Sheet tự chuyển thành `Paid`). Bấm nhầm → bấm **Hoàn tác** trong 10 giây.
4. Email không có trong tab `Staff` sẽ bị chặn, không xem được bất kỳ thông tin khách nào.
5. Mọi lần bấm đều được ghi lại trong tab **`Tracking`** (ai bấm, lúc nào, đơn nào).

### 8.2. Tạm nghỉ & Hẹn ngày mở lại Menu
**Cách 1 — Trên app (bạn đăng nhập bằng email chủ tiệm):**
1. Mở `?view=staff` → mục **Lịch nghỉ**.
2. Gạt công tắc ngày muốn nghỉ sang **Nghỉ**, hoặc bấm **Tạm nghỉ từ… đến…** (VD: từ Thứ 6 đến Thứ 7 → Thứ 2 tự mở lại).
3. Nếu ngày đó đã có đơn, app hiện danh sách khách + SĐT để bạn nhắn báo nghỉ.
4. Muốn mở lại sớm → bấm **Mở lại ngay**.

**Cách 2 — Trên Google Sheets (tab `Dim_Closures`):** thêm 1 dòng: ngày bắt đầu nghỉ | ngày kết thúc nghỉ (để trống nếu chưa biết ngày mở lại) | lời nhắn | để trống | để trống | `TRUE`.

**Khách sẽ thấy**: ngày nghỉ vẫn hiện trên menu nhưng món bị làm mờ, không thêm vào giỏ được, kèm thông báo **"🌿 Ngày này quán tạm nghỉ"**.

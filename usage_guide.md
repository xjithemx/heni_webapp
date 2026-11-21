# TÀI LIỆU HƯỚNG DẪN VẬN HÀNH & QUẢN TRỊ (USAGE GUIDE) — GÓC BẾP NHÀ HENÍ

> **Dành cho:** Chủ tiệm / Người quản lý bếp & vận hành (Mô hình doanh nghiệp 1 người — Không cần biết lập trình).  
> **Cập nhật lần cuối:** 2026-11-21  
> **Link Web App Chính Thức (GitHub CDN):** [https://xjithemx.github.io/heni_webapp/](https://xjithemx.github.io/heni_webapp/)  
> **Link Google Sheets Quản Trị:** [Mở Bảng Tính heni_webapp](https://docs.google.com/spreadsheets/d/1sjkxZS37_g-R3JowKI99AkaNTCb_HjhcAgrDAInrgb8/edit)

---

## 1. QUY TRÌNH VẬN HÀNH HẰNG NGÀY (DAILY AUTOMATION LOOP)

Với hệ thống mới đã được tự động hóa, công việc mỗi ngày của bạn được rút gọn tối đa:

### 🌞 Ban ngày (Khách tự đặt hàng & Tra cứu)
1. Khách mở link web, nhận thông báo bản tin tuần dạng **Pop-up tự động tắt sau 3.5 giây** (có nút **`✕`** đóng nhanh hoặc nút **`💌 Bản tin`** ở góc trên để xem lại). Trên thanh đầu trang còn có cụm nút tiện ích **Facebook**, **Mã QR thanh toán** (`images/momo.jpg` đã cập nhật bản mới) và **Liên hệ** (Hotline **`0834983524`**, giờ chốt đơn **21h00**, & chính sách giao hàng: *Freeship 100% tòa nhà Sonatus, Saigon Trade Center và Bcons City kèm bán kính 3km quanh Bcons City; khu vực khác giao theo phí app thực tế và Freeship ngay cho đơn từ 10 chai tính trong cùng 1 ngày*).
2. Khách chọn món cho **Sáng Mai** hoặc **Đặt Trước Cả Tuần**, chọn **Độ ngọt** mong muốn ngay trên từng món (`🍯 Bình thường`, `🌿 Ít đường`, hoặc `🥥 Không đường` — mặc định là `Bình thường`) và bấm **Xác nhận đơn hàng**.
3. Hệ thống tự động:
   - Ghi đơn tổng vào tab **`Orders_Master`** (trạng thái mặc định: `Đã tiếp nhận`).
   - Tách từng món vào tab **`Fact_Order_Items`**, **tự động điền cột `week` (`w1`, `w2`...)** ở Cột H và **tự động ghi nhận `Độ Ngọt`** ở Cột K để bạn dễ dàng lọc và theo dõi khẩu vị khách hàng.
   - Gửi ngay 1 email xác nhận đơn hàng chi tiết (kèm độ ngọt từng món) cho khách.
4. Khách muốn xem lại lịch sử đơn hoặc kiểm tra tiền sữa chốt tuần chỉ cần mở mục **Tra cứu & Giải trí** (nút kính lúp góc dưới phải), nhập **Tên** (VD: `Lan Anh`, `Bình Minh`), **Số điện thoại** (VD: `0901234567`), hoặc **Mã đơn** (`HN-751646`). Thông tin khách sẽ được che giấu một phần (Incognito Masking) để bảo vệ quyền riêng tư.

### 🌙 Đúng 21h00 Mỗi Tối (Chốt Mẻ Nấu Sữa Tự Động Cho Bếp)
1. **Trên Web**: Đúng 21h00, web tự động khóa đặt món cho sáng ngày mai và chuyển sang nhận đơn cho ngày kế tiếp.
2. **Báo cáo Bếp tự động gửi về Email**:
   - Đúng 21h00, hệ thống tự động gửi 1 email tiêu đề **`[Bếp Hení 21h00] Báo cáo nấu sữa giao Thứ ... — Tổng: XX chai`** về địa chỉ email quản trị bếp cấu hình trong tab `Dim_Config` hoặc `config.js` (và tài khoản Google triển khai Web App).
   - Trong email có sẵn **2 bảng rõ ràng**:
     1. **Tổng hợp số lượng cần nấu**: Mỗi vị bao nhiêu chai kèm **phân rã số chai theo độ ngọt** (`🍯 Bình thường`, `🌿 Ít ngọt`, `🥥 Không ngọt`) để bạn múc riêng trước khi pha ngọt.
     2. **Chi tiết khách nhận & ghi chú giao hàng**: Tên khách, SĐT (đã chuẩn hóa số 0 đầu), **nhãn độ ngọt từng chai**, địa chỉ tòa nhà, và lời nhắn riêng (VD: *"ít ngọt"*, *"giữ chị 1 chai"*).
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
| `weekly_footer` | `Sữa hạt vẫn luôn được nấu tươi mới mỗi ngày` | Dòng chữ nền xanh lá dưới cùng |
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

## 6. CẬP NHẬT EMAIL NHẬN BÁO CÁO BẾP 21H00

Mặc định báo cáo nấu sữa 21h00 luôn gửi về tài khoản Google triển khai Web App. Khi bạn muốn thêm email của người phụ bếp hoặc email cá nhân khác:

### Cách 1: Thêm trực tiếp trên Google Sheets (Khuyên dùng — Không lộ email trên Git)
1. Mở file Google Sheets `heni_webapp` -> chọn tab **`Dim_Config`**.
2. Thêm dòng cấu hình:
   - Cột A (`key`): `kitchen_emails`
   - Cột B (`value`): Danh sách email ngăn cách bằng dấu phẩy, ví dụ: `bep-phu@example.com, quanly@example.com`
   - Cột C (`description`): `Danh sách email nhận báo cáo bếp 21h00`

### Cách 2: Thêm qua file `config.js` trên GitHub
1. Mở file [`config.js`](./config.js) trên GitHub.
2. Tại mục `KITCHEN_REPORT_EMAILS`, thêm email mới vào danh sách:
   ```javascript
   KITCHEN_REPORT_EMAILS: [
     'bep.heni@example.com',
     'bep-phu@example.com'
   ],
   ```
3. Bấm **Commit changes**. Đúng 21h00 tối, Google Apps Script sẽ tự động đọc danh sách này và gửi báo cáo đầy đủ!

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
4. **Kích hoạt hẹn giờ gửi Báo cáo Nấu Sữa 21h00 (Chỉ cần chạy 1 lần)**:
   - Trên thanh công cụ, chọn hàm **`setupDaily21hTrigger`** -> bấm **Chạy (Run)**.
5. **Lấy link API kết nối với GitHub Pages**:
   - Bấm nút **Triển khai (Deploy)** ở góc trên phải -> **Quản lý nội dung triển khai (Manage deployments)** -> Bấm biểu tượng cây bút **Chỉnh sửa (Edit)** -> Ở mục Phiên bản chọn **Phiên bản mới (New version)** -> Bấm **Triển khai (Deploy)**.
   - Copy đường link **URL ứng dụng web** (`https://script.google.com/macros/s/.../exec`) dán vào dòng `GAS_API_URL: '...'` trong file [`config.js`](./config.js) trên GitHub.

---

## 🛵 7. HƯỚNG DẪN SỬ DỤNG BÀN GIAO HÀNG CHO SHIPPER (`?view=staff`)

### 7.1. Cách Shipper mở bàn giao hàng
1. Mở link: **`https://xjithemx.github.io/heni_webapp/?view=staff`** (hoặc cuộn xuống cuối trang web app và bấm dòng **"🛵 Bàn Giao Hàng Cho Shipper & Bếp"**).
2. Nhập email của shipper (ví dụ: `shipper@example.com`) hoặc bấm nút **Đăng nhập bằng Google**.
3. Khi vào giao diện, hệ thống hiển thị ngay:
   - **Hôm nay**: Chỉ hiển thị đúng các đơn và số chai sữa cần giao trong ca sáng hôm nay.
   - **Ngày mai**: Xem trước danh sách đơn để Bếp và Shipper chuẩn bị.
   - **Tất cả đơn**: Gom nhóm gọn gàng 1 thẻ cho mỗi đơn hàng để tra cứu toàn bộ tiến độ.

### 7.2. Các thao tác giao hàng thông minh (Đã nâng cấp v2.6.0)
* **Liên hệ khách 1 chạm**:
  - Bấm nút **📞 Gọi** để gọi điện thoại trực tiếp.
  - Bấm nút **💬 Zalo** để mở ngay khung chat Zalo với khách (không cần lưu danh bạ).
  - Bấm vào địa chỉ khách để mở Google Maps dẫn đường.
* **Giao đơn tuần & Giao gộp ca tiếp theo (Combined Drop)**:
  - Nếu khách đặt nhiều ngày trong tuần (VD: Thứ 2, Thứ 3, Thứ 4):
    - Mặc định, app chỉ hiện món và số tiền thu của ca hôm nay.
    - **Khi khách nhờ: "Giao luôn món Thứ 3 vào sáng Thứ 2 giúp mình"**:
      1. Shipper nhìn vào khung vàng: `📦 Khách muốn giao gộp thêm ca tiếp theo vào hôm nay?`.
      2. Bấm chọn **☑️ Gộp Thứ 3**.
      3. Danh sách kiểm đếm tức thì mở rộng hiện cả món hôm nay + món ngày mai. Tiền thu ca hôm nay tự động cộng dồn (VD: 50k + 50k = 100k).
      4. Bấm **🚚 Đã giao xong (Gộp 2 ca)**.
  - **Sáng mai (Thứ 3) mở app**: Đơn này tự động nằm trong tab **Đã giao** với nhãn `⚡ Đã giao sớm (gộp 16-11)`. Bếp biết không nấu dư và Shipper không mang đi giao lại!
* **Thu tiền mặt linh hoạt**:
  - Nếu khách trả từng ca: Bấm **💵 Thu ca này (XX.XXXđ)** $\rightarrow$ Sheet ghi rõ `Đã thu 50.000đ/130.000đ (16-11)`.
  - Nếu khách trả hết cả tuần: Bấm **💰 Trả trọn đơn** $\rightarrow$ Sheet tự động gạch nợ thành **`Paid`**.
  - Nếu bấm nhầm: Luôn có đồng hồ đếm ngược **↩️ Hoàn tác (10s)** để khôi phục trạng thái ban đầu.


---

## 🌿 8. HƯỚNG DẪN BẬT/TẮT MENU & HẸN GIỜ NGHỈ QUÁN CHO CHỦ TIỆM

### Cách 1: Thiết lập ngay trên Web App (Nhanh nhất)
1. Mở `?view=staff` và đăng nhập bằng email Chủ tiệm (`owner`).
2. Cuộn xuống mục **"Quản Lý Lịch Nghỉ Quán (Dim_Closures)"**:
   - Chọn **Nghỉ từ**: Điền thứ (VD: `Thứ 6`) hoặc ngày cụ thể (`2026-11-13`).
   - Chọn **Đến hết**: Điền thứ (VD: `Thứ 7`) hoặc ngày cụ thể (`2026-11-14`).
   - Nhập **Lời nhắn**: Ví dụ *"Tiệm nâng cấp máy nấu sữa, hẹn gặp lại cả nhà vào Thứ 2 nhé!"*.
   - Bấm **🌿 Kích hoạt lịch nghỉ**.
3. **Khi muốn mở lại menu sớm**: Chỉ cần bấm nút đỏ **"Mở lại menu ngay"**, menu sẽ tự động mở lại cho khách đặt hàng.

### Cách 2: Thiết lập trực tiếp trên Google Sheets
1. Mở file Google Sheets **`heni_webapp`**, chọn tab **`Dim_Closures`**.
2. Thêm dòng mới:
   - Cột A (`date_from`): `Thứ 6` (hoặc ngày ISO `2026-11-13`).
   - Cột B (`date_to`): `Thứ 7` (hoặc ngày ISO `2026-11-14`).
   - Cột C (`message`): Lời nhắn gửi khách.
   - Cột F (`active`): Đổi thành `TRUE` để đóng menu, đổi thành `FALSE` để mở lại menu.

---

## 👥 9. HƯỚNG DẪN THÊM BỚT SHIPPER TRONG TAB `Staff`
1. Mở file Google Sheets **`heni_webapp`**, vào tab **`Staff`**.
2. Điền thông tin nhân sự:
   - Cột A (`email`): Email Google của shipper (VD: `shipper1@gmail.com`).
   - Cột B (`role`): Điền `shipper` (hoặc `owner` nếu là chủ tiệm).
   - Cột C (`active`): Điền `TRUE` (cho phép làm việc) hoặc `FALSE` (khóa quyền truy cập ngay lập tức).
   - Cột D (`name`): Tên hiển thị (VD: `Hoàng Shipper`).

---

## 🚀 10. HƯỚNG DẪN TRIỂN KHAI BẢN MỚI TRÊN GOOGLE APPS SCRIPT
Sau khi code được cập nhật, chủ tiệm làm theo các bước sau để Google Apps Script áp dụng ngay:
1. Mở Google Sheets -> menu **Tiện ích mở rộng (Extensions)** -> **Apps Script**.
2. Mở file `code.gs`, chọn toàn bộ code cũ (`Ctrl+A` -> `Delete`).
3. Mở file [code_gs_clean_copy.md](./code_gs_clean_copy.md) trên repo, bấm icon Copy khung code và dán vào Apps Script (`Ctrl+V`).
4. Nhấn **Ctrl+S** để lưu.
5. Ở góc trên bên phải, bấm nút **Triển khai (Deploy)** -> **Quản lý bản triển khai (Manage deployments)**.
6. Chọn bản Web app đang hoạt động -> Bấm icon **Bút chì (Chỉnh sửa)**.
7. Tại mục **Phiên bản (Version)**: Chọn **Phiên bản mới (New version)**.
8. Bấm **Triển khai (Deploy)** -> **Xong (Done)**.

---

## 🔒 11. HƯỚNG DẪN KHÓA QUYỀN TRUY CẬP GOOGLE SHEET VỀ RIÊNG TƯ (RESTRICTED) ĐỂ BẢO MẬT 100%

### Tại sao nên khóa file Google Sheets về "Hạn chế" (Restricted)?
* Trước đây, khi còn cơ chế đọc qua GViz JSONP, bảng tính bắt buộc phải để ở chế độ "Bất kỳ ai có đường liên kết đều có thể xem". Điều này tiềm ẩn rủi ro lộ toàn bộ SĐT, họ tên, địa chỉ khách hàng nếu ai đó biết ID bảng tính.
* Từ phiên bản **v2.6.1**, toàn bộ luồng tra cứu đơn hàng và đồng bộ đã chuyển qua **Google Apps Script Web App API (`searchOrders`)** có cơ chế che giấu danh tính (**Incognito Masking**).
* Khi triển khai Web App với cấu hình chuẩn:
  - **Thực thi dưới dạng (Execute as)**: `Tôi (Me / Chủ sở hữu)`
  - **Người có quyền truy cập (Who has access)**: `Bất kỳ ai (Anyone)`
  $\rightarrow$ Google Apps Script chạy dưới quyền của bạn (Chủ tiệm), do đó nó **vẫn đọc và ghi dữ liệu bình thường 100%** ngay cả khi bạn khóa toàn bộ bảng tính lại chỉ mình bạn xem được!

### Các bước khóa file Google Sheets về Riêng tư:
1. Mở file Google Sheets **`heni_webapp`**.
2. Bấm nút màu xanh **Chia sẻ (Share)** ở góc trên cùng bên phải.
3. Tại khung **Quyền truy cập chung (General access)**:
   - Nhấp vào menu thả xuống và chuyển từ `Bất kỳ ai có đường liên kết (Anyone with the link)` $\rightarrow$ **`Hạn chế (Restricted)`**.
4. Bấm nút **Xong (Done)**.
5. **Kiểm tra**:
   - Mở cửa sổ Ẩn danh (Incognito) trên trình duyệt, dán link Google Sheets vào $\rightarrow$ Google sẽ yêu cầu đăng nhập và báo không có quyền truy cập (hoàn toàn an toàn!).
   - Mở Web App tại `https://xjithemx.github.io/heni_webapp/` $\rightarrow$ Web App vẫn tải thực đơn, đặt đơn mới và tra cứu đơn hàng nhanh chóng, mượt mà!

# PRODUCT REQUIREMENTS DOCUMENT (PRD) — GÓC BẾP NHÀ HENÍ (`heni_webapp`)

> **Phiên bản tài liệu:** v2.0  
> **Cập nhật lần cuối:** 2026-11-08  
> **Mô hình vận hành mục tiêu:** Doanh nghiệp 1 người (Solo-Founder / Micro D2C Healthy Kitchen)  
> **Live Production URL:** [https://xjithemx.github.io/heni_webapp/](https://xjithemx.github.io/heni_webapp/)

---

## 1. TỔNG QUAN SẢN PHẨM (PRODUCT VISION & BUSINESS MODEL)

**Góc Bếp Nhà Hení** là ứng dụng đặt sữa hạt thủ công tươi mới mỗi sáng (không chất bảo quản, ngọt dịu từ chà là/thốt nốt, 100% màu tự nhiên), phục vụ tệp khách hàng văn phòng và cư dân đô thị (Sonatus Quận 1, Shopee/SPX Express, Bcons City...).

### Đặc thù Mô hình Vận hành 1 Người (Solo-Operator Constraints):
1. **Batch Kitchen Loop (Chốt mẻ nấu 20h00 mỗi tối)**:
   - Khách đặt trước (Pre-order) cho sáng hôm sau hoặc đặt lịch uống sữa cho cả tuần (Thứ 2 – Thứ 7, nghỉ Chủ Nhật).
   - Đúng **20h00 mỗi tối**, hệ thống tự động khóa nhận đơn cho ca sáng mai (chuyển sang ngày kế tiếp) và tự động tổng hợp số lượng từng loại sữa + danh sách giao hàng gửi về email của bếp (`ll.huyhoang.1412@gmail.com`).
2. **Zero-Code Daily Maintenance (Quản trị không cần sửa code)**:
   - Chủ tiệm chỉ cần dùng **Google Sheets** (`heni_webapp`) và file cấu hình nhanh [`config.js`](./config.js) trên GitHub để cập nhật giá, bật/tắt món, đổi nội dung thông báo hàng tuần và thêm email nhận báo cáo bếp.
3. **Privacy-First & Minimalist UX (Quyền riêng tư & Tối giản)**:
   - Tuyệt đối **không lưu thông tin cá nhân của khách hàng vào trình duyệt (`localStorage`)** để tránh cảm giác bị theo dõi đối với khách hàng không rành công nghệ.

---

## 2. KIẾN TRÚC KỸ THUẬT (HYBRID ARCHITECTURE: GITHUB CDN + GOOGLE SHEETS DB)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    KHÁCH HÀNG (MOBILE / DESKTOP WEB)                    │
│                 https://xjithemx.github.io/heni_webapp/                 │
└───────────────────┬─────────────────────────────────┬───────────────────┘
                    │ 1. Tải UI & Ảnh (0.1s)          │ 2. Đồng bộ Menu / Đặt đơn / Tra cứu
                    ▼                                 ▼
┌───────────────────────────────────┐ ┌───────────────────────────────────┐
│         GITHUB PAGES CDN          │ │     GOOGLE APPS SCRIPT (API)      │
│  - index.html (Vue 3 + Tailwind)  │ │  - doGet(action=init): Menu,      │
│  - config.js (Cấu hình nhanh)     │ │    Config, Payment (JSON ~3KB)    │
│  - images/ (22 ảnh tĩnh chuẩn):   │ │  - doGet(action=searchOrders):    │
│    logo-only.jpg, base.jpg,       │ │    Tra cứu theo Tên/SĐT/Mã đơn    │
│    momo.jpg, t2_s1.png..t7_p1.png │ │  - doPost(action=processOrder):   │
└───────────────────────────────────┘ │    Ghi Sheet + Gửi Bill Email     │
                                      │  - Trigger 20h00: Báo cáo Bếp     │
                                      └─────────────────┬─────────────────┘
                                                        │
                                                        ▼
                                      ┌───────────────────────────────────┐
                                      │   GOOGLE SHEETS (heni_webapp)     │
                                      │  - Dim_Menu        (Thực đơn)     │
                                      │  - Dim_Config      (Cấu hình)     │
                                      │  - payment_method  (MoMo / VCB)   │
                                      │  - Orders_Master   (Đơn tổng)     │
                                      │  - Fact_Order_Items(Chi tiết món) │
                                      │  - Tracking        (Log hệ thống) │
                                      └───────────────────────────────────┘
```

### Tại sao sử dụng kiến trúc Hybrid này?
* **Loại bỏ nút thắt cổ chai Base64 của Google Drive**: Bản cũ dùng `getStoreImages()` đọc 18 ảnh trên Drive rồi mã hóa thành 4MB Base64 mỗi lần mở trang, gây trễ 5–8 giây và dễ chạm trần hạn mức của Google. Nay toàn bộ ảnh nằm trong `/images/` trên GitHub CDN, hiển thị tức thì trong **0.1 giây**.
* **Không giới hạn lượt truy cập**: Giao diện tĩnh được phân phối qua hạ tầng CDN toàn cầu của GitHub, kèm `FALLBACK_MENU` trong `config.js` giúp khách thấy ngay thực đơn trong tích tắc kể cả khi mạng yếu.

---

## 3. CẤU TRÚC CƠ SỞ DỮ LIỆU TRÊN GOOGLE SHEETS (`heni_webapp`)

* **Sheet ID:** `1sjkxZS37_g-R3JowKI99AkaNTCb_HjhcAgrDAInrgb8`

### 3.1. Tab `Dim_Menu` (Danh mục Thực đơn)
| Cột | Tên Cột | Kiểu dữ liệu / Quy ước | Mô tả |
| :--- | :--- | :--- | :--- |
| **A** | `ID Món (SKU)` | Chuỗi (`t2_s1`, `t2_p1`...) | Mã định danh món, khớp với tên file ảnh trong `images/{id}.png` |
| **B** | `Tên Món` | Chuỗi | Tên hiển thị trên thẻ món ăn |
| **C** | `Phân Loại` | `Tiêu chuẩn` / `Cao cấp` | Tự động phân vào nhóm Standard (25k) hoặc Premium (30k) |
| **D** | `Giá Bán` | Số (`25000`, `30000`) | Đơn giá VNĐ |
| **E** | `Lịch Nấu` | `Thứ 2` .. `Thứ 7` | Ngày nấu cố định trong tuần (Map sang `dayOfWeek`: 1 -> 6) |
| **F** | `Mô Tả` | Chuỗi | Hương vị và công dụng sức khỏe |
| **G** | `status` | `active` / `inactive` | Chỉ những dòng có `active` (không phân biệt hoa/thường) mới hiển thị |
| **H** | `Link_Anh` | Tên file (`t2_s1.png`) hoặc URL | Ưu tiên URL đầy đủ, nếu là tên file sẽ lấy từ `images/{sku}.png` |
| **I** | `kcalo` | Số (`154` – `231`) | Năng lượng (kcal) hiển thị trên huy hiệu `🔥 xxx kcal` |

### 3.2. Tab `Orders_Master` (Sổ cái Đơn hàng)
| Cột | Tên Cột | Mô tả |
| :--- | :--- | :--- |
| **A** | `Mã Đơn` | Mã đơn tự sinh theo định dạng `HN-xxxxxx` (6 số cuối của timestamp) |
| **B** | `Timestamp` | Thời điểm khách đặt đơn |
| **C** | `Tên Khách` | Họ tên hoặc biệt danh khách nhập (VD: `C Ngọc`, `Anh Đào`, `Suri`) |
| **D** | `SĐT` | Số điện thoại / Zalo của khách |
| **E** | `Email` | Email nhận hóa đơn xác nhận tự động |
| **F** | `Địa chỉ` | Địa chỉ giao hàng (Tòa nhà, tầng, phòng...) |
| **G** | `Raw_JSON_Items` | Chuỗi JSON lưu toàn bộ danh sách món và ngày giao trong đơn |
| **H** | `Tổng Tiền` | Tổng giá trị đơn hàng (VNĐ) |
| **I** | `Ghi chú` | Lời nhắn của khách cho bếp (VD: ít ngọt, giữ chai...) |
| **J / K**| `Status` | Mặc định khi mới đặt: `Đã tiếp nhận`. Khi khách trả tiền, chủ tiệm đổi thành `Paid` hoặc `Đã thanh toán` |

### 3.3. Tab `Fact_Order_Items` (Bảng Phẳng Chi Tiết Từng Món Để Nấu Sữa)
* **Cấu trúc cột (A -> I)**: `Mã Đơn` | `Ngày Giao` | `Tên Món` | `ID Món` | `Số Lượng` | `Tên Khách` | `SĐT` | `week` | `Status/Feedback`.
* Khi khách đặt đơn qua `processOrder()`, hệ thống tự động tách từng món trong giỏ thành từng dòng riêng biệt và **tự động điền mã tuần hiện hành (`w1`, `w2`...)** vào cột H (`week`).

### 3.4. Tab `payment_method` (Thông tin Thanh toán)
* **Cấu trúc cột**: `type` (`MoMo`, `VCB`) | `info` (Số tài khoản/SĐT) | `qr_screenshot`.
* Hệ thống đọc an toàn cả khi ô `qr_screenshot` để trống (đã xử lý chống lỗi `null.toString()`).

### 3.5. Tab `Dim_Config` (Cấu hình Động & Thông báo Tuần)
* Cho phép điều khiển nội dung trên giao diện mà không cần sửa code:
  - `video_thu_gian`: ID video Google Drive hoặc link nhúng trong Sidebar.
  - `weekly_badge`: Nhãn nhỏ phía trên khung thông báo tuần.
  - `weekly_title`: Tiêu đề khung thông báo tuần (Xóa trống ô này sẽ tự động ẩn khung thông báo tuần).
  - `weekly_content`: Nội dung chi tiết thông báo tuần.
  - `weekly_footer`: Dòng nhấn mạnh dưới chân khung thông báo tuần.
  - `kitchen_emails`: Danh sách email nhận báo cáo bếp 20h00 (ngoài các email trong `config.js`).

---

## 4. ĐẶC TẢ CHI TIẾT CÁC TÍNH NĂNG (FUNCTIONAL SPECIFICATIONS)

### 4.1. Giao diện & Nhận diện Thương hiệu (Giữ nguyên 100% Bản sắc Gốc)
* **Bảng màu (Brand Tokens)**:
  - `brand-bone` (`#F9F8F6`): Nền kem ấm chủ đạo.
  - `brand-green` (`#4F6B4A`): Xanh lá thảo mộc chủ đạo.
  - `brand-gold` (`#C49A45`): Vàng đồng điểm nhấn dòng Cao Cấp (Premium).
  - `brand-dark` (`#2C3D29`): Xanh đen đậm cho chữ và thanh giỏ hàng nổi.
* **Typography**: Tiêu đề dùng `Playfair Display` (Serif), nội dung dùng `DM Sans` (Sans-serif).

### 4.2. Logic Lịch Đặt Sữa Thông Minh (Cut-off 20h00 & Bỏ qua Chủ Nhật)
* Nếu khách truy cập **trước 20h00**: Mục **"Menu Sáng Mai"** hiển thị thực đơn của ngày mai (`dayOffset = 1`).
* Nếu khách truy cập **từ 20h00 trở đi**: Mẻ sữa sáng mai đã chốt, mục **"Menu Sáng Mai"** tự động nhảy sang ngày kế tiếp (`dayOffset = 2`).
* Nếu ngày giao rơi vào **Chủ Nhật (`dayOfWeek === 0`)**: Tự động nhảy qua Thứ 2 tuần kế tiếp.
* Mục **"Lịch Đặt Trước Cả Tuần"**: Hiển thị 5 ngày làm việc tiếp theo kèm chủ đề từng ngày (*Thứ 2: Năng lượng, Thứ 3: Thanh mát, Thứ 4: Dưỡng nhan, Thứ 5: Dưỡng chất, Thứ 6: Ấm bụng, Thứ 7: Thảnh thơi*).

### 4.3. Giỏ Hàng Đa Ngày & Thanh Toán (Multi-Day Cart & Checkout)
* Khách có thể chọn nhiều món của nhiều ngày khác nhau vào chung 1 giỏ hàng.
* Trong Modal Giỏ hàng, các món được tự động gom nhóm theo từng ngày giao (`Giao Sáng Thứ 3 (03/11)`, `Giao Sáng Thứ 5 (05/11)`...).
* Tích hợp nút **`Copy` 1 chạm** bên cạnh Số MoMo, Số TK Vietcombank và Số tiền để khách dễ dàng dán vào ứng dụng ngân hàng.
* Kiểm tra tính hợp lệ của Số điện thoại (9–11 chữ số) trước khi gửi đơn.

### 4.4. Tra Cứu Lịch Sử Đơn Hàng Đa Năng (Smart Order History Search)
* Nằm trong Sidebar trượt (**"Tra cứu & Giải trí"**).
* **Khả năng tìm kiếm 3-trong-1**:
  1. **Tìm theo Tên khách hàng**: Không phân biệt chữ hoa/thường và không phân biệt dấu tiếng Việt (gõ `C Ngọc`, `c ngoc`, `Ngọc`, `Anh Đào`, `Suri` đều khớp chính xác).
  2. **Tìm theo Số điện thoại**: Tự động xử lý lỗi mất số `0` ở đầu hoặc định dạng số khoa học (`3.79524516E8`) của Google Sheets. Hỗ trợ tìm theo SĐT đầy đủ (`0379524516`) hoặc 4–9 số cuối (`4516`).
  3. **Tìm theo Mã đơn hàng**: Khớp mã `HN-751646` hoặc `751646`.
* **Hiển thị kết quả**:
  - Gom nhóm đơn hàng theo từng tuần (`Tuần dd/MM – dd/MM`).
  - Đơn hàng có trạng thái `Paid` hoặc `Đã thanh toán` sẽ hiển thị huy hiệu xanh lá **`Đã thanh toán`** và thu gọn lại.
  - Đơn hàng **`Chưa thanh toán`** mới nhất sẽ tự động mở rộng (expand) danh sách món để khách kiểm tra nhanh.

### 4.5. Tự Động Gửi Báo Cáo Nấu Sữa Lúc 20h00 Hàng Ngày (`sendDailyKitchenReport`)
* Đúng **20h00 mỗi tối** (qua Time-driven Trigger `setupDaily20hTrigger`), hệ thống tự động:
  1. Xác định ngày giao hàng tiếp theo (nếu ngày mai là Chủ Nhật thì lấy Thứ 2).
  2. Quét bảng `Fact_Order_Items` và đối chiếu địa chỉ/ghi chú từ `Orders_Master`.
  3. Cộng tổng số lượng chai cần nấu cho từng món và lập danh sách khách nhận kèm ghi chú.
  4. Tự động đọc danh sách email nhận báo cáo từ `DEFAULT_KITCHEN_EMAILS` (`ll.huyhoang.1412@gmail.com`), từ `config.js` trên GitHub (`KITCHEN_REPORT_EMAILS`), và từ tab `Dim_Config`.
  5. Gửi email báo cáo định dạng bảng rõ ràng về hộp thư của Bếp.

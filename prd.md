# PRODUCT REQUIREMENTS DOCUMENT (PRD) — GÓC BẾP NHÀ HENÍ (`heni_webapp`)

> **Phiên bản tài liệu:** v2.9.0  
> **Cập nhật lần cuối:** 2026-11-21  
> **Mô hình vận hành mục tiêu:** Doanh nghiệp 1 người (Solo-Founder / Micro D2C Healthy Kitchen)  
> **Live Production URL:** [https://xjithemx.github.io/heni_webapp/](https://xjithemx.github.io/heni_webapp/)

---

## 1. TỔNG QUAN SẢN PHẨM (PRODUCT VISION & BUSINESS MODEL)

**Góc Bếp Nhà Hení** là ứng dụng đặt sữa hạt thủ công tươi mới mỗi ngày (không chất bảo quản, ngọt dịu từ chà là/thốt nốt, 100% màu tự nhiên), phục vụ tệp khách hàng văn phòng và cư dân đô thị (Sonatus, Saigon Trade Center, Bcons City...).

### Đặc thù Mô hình Vận hành 1 Người (Solo-Operator Constraints):
1. **Batch Kitchen Loop (Chốt mẻ nấu 21h00 mỗi tối)**:
   - Khách đặt trước (Pre-order) cho sáng hôm sau hoặc đặt lịch uống sữa cho cả tuần (Thứ 2 – Thứ 7, nghỉ Chủ Nhật).
   - Đúng **21h00 mỗi tối**, hệ thống tự động khóa nhận đơn cho ca sáng mai (chuyển sang ngày kế tiếp) và tự động tổng hợp số lượng từng loại sữa + danh sách giao hàng gửi về email quản trị viên bếp cấu hình trong `Dim_Config` / `config.js` (hoặc tài khoản Google triển khai Web App).
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
                                      │  - Trigger 21h00: Báo cáo Bếp     │
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
| **C** | `Tên Khách` | Họ tên hoặc biệt danh khách nhập (VD: `Khách hàng Lan Anh`, `Bình Minh`...) |
| **D** | `SĐT` | Số điện thoại / Zalo của khách |
| **E** | `Email` | Email nhận hóa đơn xác nhận tự động |
| **F** | `Địa chỉ` | Địa chỉ giao hàng (Tòa nhà, tầng, phòng...) |
| **G** | `Raw_JSON_Items` | Chuỗi JSON lưu toàn bộ danh sách món và ngày giao trong đơn |
| **H** | `Tổng Tiền` | Tổng giá trị đơn hàng (VNĐ) |
| **I** | `Ghi chú` | Lời nhắn của khách cho bếp (VD: ít ngọt, giữ chai...) |
| **J** | `owner note` | Ghi chú riêng của chủ tiệm / bếp |
| **K** | `Status` (**Cột chuẩn gạch nợ**) | Kiểm tra thanh toán: `Paid` (đã trả đủ cả đơn); `Đã thu X/Y (tokens)` (thu tiền mặt từng ca hoặc ca gộp, VD: `Đã thu 100.000đ/230.000đ (16-11+17-11)`); `Cancelled` / `Đã hủy`; hoặc để trống (`Chưa thanh toán`) |
| **L** | `delivery_status ` | Trạng thái giao hàng theo tiến độ: Đơn 1 ngày: `Đã giao` hoặc để trống; Đơn tuần nhiều ngày: `Đang giao (X/Y ngày: tokens)` (VD: `Đang giao (2/4 ngày: 16-11, 17-11-gộp16-11)`) hoặc `Đã giao (Hoàn tất Y/Y ngày)` |
| **M** | `delivered_at` | Nhật ký thời gian từng ca giao: Đơn 1 ngày: `DD/MM/YYYY HH:mm`; Đơn tuần: `tok1: time1 | tok2: time2 (gộp tok1)` |
| **N** | `delivered_by` | Người xác nhận giao từng ca: Đơn 1 ngày: `email/tên`; Đơn tuần: `tok1: tên1 | tok2: tên2 (gộp tok1)` |
| **O** | `delivery_iso ` | Ngày giao chuẩn `yyyy-MM-dd` để lọc đơn trong ngày |

### 3.3. Tab `Fact_Order_Items` (Bảng Phẳng Chi Tiết Từng Món Để Nấu Sữa & Theo Dõi Khẩu Vị)
* **Cấu trúc cột (A -> K)**: `Mã Đơn` | `Ngày Giao` | `Tên Món` | `ID Món` | `Số Lượng` | `Tên Khách` | `SĐT` | `week` | `Status` | `Feedback` | `Độ Ngọt`.
* Khi khách đặt đơn qua `processOrder()`, hệ thống tự động tách từng món trong giỏ thành từng dòng riêng biệt, **tự động điền mã tuần hiện hành (`w1`, `w2`...)** vào cột H (`week`) và ghi nhận độ ngọt khách chọn (`Bình thường`, `Ít ngọt (Giảm ngọt)`, `Không ngọt (100% vị tự nhiên)`) vào cột K (`Độ Ngọt`).

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
  - `kitchen_emails`: Danh sách email nhận báo cáo bếp 21h00 (ngoài các email trong `config.js`).

---

## 4. ĐẶC TẢ CHI TIẾT CÁC TÍNH NĂNG (FUNCTIONAL SPECIFICATIONS)

### 4.1. Giao diện, Nhận diện Thương hiệu & Trải nghiệm Đầu trang (`v2.9.0`)
* **Bảng màu (Brand Tokens)**:
  - `brand-bone` (`#F9F8F6`): Nền kem ấm chủ đạo.
  - `brand-green` (`#4F6B4A`): Xanh lá thảo mộc chủ đạo.
  - `brand-gold` (`#C49A45`): Vàng đồng điểm nhấn dòng Cao Cấp (Premium).
  - `brand-dark` (`#2C3D29`): Xanh đen đậm cho chữ và thanh giỏ hàng nổi.
* **Typography**: Tiêu đề dùng `Playfair Display` (Serif), nội dung dùng `DM Sans` (Sans-serif).
* **Unified Hero Showcase**: Hợp nhất thanh nhận diện thương hiệu (*"Sữa hạt tươi nấu mới mỗi ngày · Chốt đơn 21h00"*), hình ảnh `base.jpg` (chứa sẵn tiêu đề nghệ thuật) và dải 3 cam kết (`Không chất bảo quản`, `Ngọt dịu chà là, thốt nốt`, `100% màu tự nhiên`) thành một thể thống nhất.
* **Cụm Hover Tooltip Tiện Ích (`taste-v3`)**:
  - **`📘 Facebook`**: Rê chuột hiển thị thẻ xem trước Fanpage [Góc Bếp Nhà Hení](https://www.facebook.com/profile.php?id=61595353216988) và bấm mở trực tiếp.
  - **`💳 Mã QR`**: Rê chuột hiển thị ngay mã QR MoMo/Ngân hàng (`images/momo.jpg?v=2.8.1`) kèm nút Copy nhanh để thanh toán hóa đơn tuần tức thì.
  - **`💬 Liên hệ`**: Rê chuột hiển thị giờ chốt đơn (`21h00`), Hotline **`0834983524`**, chính sách giao hàng chi tiết (*Freeship 100% tòa nhà Sonatus, Saigon Trade Center và Bcons City kèm bán kính 3km quanh Bcons City; khu vực khác giao theo phí app thực tế và Freeship ngay cho đơn từ 10 chai tính trong cùng 1 ngày*) và nút nhắn tin Facebook / Tra cứu đơn.
* **Weekly Banner Pop-up (3.5 giây)**: Thông báo tuần hiển thị dạng Pop-up tinh tế khi vừa mở trang, tự động tắt sau **3.5 giây** kèm thanh tiến trình đếm ngược (tạm dừng khi rê chuột vào đọc), nút **`✕`** đóng rõ ràng và nút **`💌 Bản tin`** trên thanh đầu trang để mở xem lại.

### 4.2. Logic Lịch Đặt Sữa Thông Minh (Cut-off 21h00 & Bỏ qua Chủ Nhật)
* Nếu khách truy cập **trước 21h00**: Mục **"Menu Sáng Mai"** hiển thị thực đơn của ngày mai (`dayOffset = 1`).
* Nếu khách truy cập **từ 21h00 trở đi**: Mẻ sữa sáng mai đã chốt, mục **"Menu Sáng Mai"** tự động nhảy sang ngày kế tiếp (`dayOffset = 2`).
* Nếu ngày giao rơi vào **Chủ Nhật (`dayOfWeek === 0`)**: Tự động nhảy qua Thứ 2 tuần kế tiếp.
* Mục **"Lịch Đặt Trước Cả Tuần"**: Hiển thị 5 ngày làm việc tiếp theo kèm chủ đề từng ngày (*Thứ 2: Năng lượng, Thứ 3: Thanh mát, Thứ 4: Dưỡng nhan, Thứ 5: Dưỡng chất, Thứ 6: Ấm bụng, Thứ 7: Thảnh thơi*).

### 4.3. Giỏ Hàng Đa Ngày, Tùy Chọn Độ Ngọt & Thanh Toán (Multi-Day Cart, Sweetness & Checkout)
* Khách có thể tùy chọn **Độ ngọt trên từng món** ngay tại thẻ sản phẩm hoặc đổi nhanh trong giỏ hàng với 3 mức chuẩn trên giao diện:
  - `🍯 Bình thường` *(Mặc định)*
  - `🌿 Ít đường (Giảm đường)`
  - `🥥 Không đường (100% vị tự nhiên)`
* Grain giỏ hàng (`uniqueId = item.id + '_' + date.id + '_' + sweetnessCode`) cho phép đặt cùng 1 món trong cùng 1 ngày với nhiều mức độ ngọt khác nhau.
* Trong Modal Giỏ hàng, các món được tự động gom nhóm theo từng ngày giao (`Giao Sáng Thứ 3 (03/11)`, `Giao Sáng Thứ 5 (05/11)`...).
* Tích hợp nút **`Copy` 1 chạm** bên cạnh Số MoMo, Số TK Vietcombank và Số tiền để khách dễ dàng dán vào ứng dụng ngân hàng.
* Kiểm tra tính hợp lệ của Số điện thoại (9–11 chữ số) trước khi gửi đơn.

### 4.4. Tra Cứu Lịch Sử Đơn Hàng Đa Năng Bảo Mật (Smart & Incognito Order History Search)
* Nằm trong Sidebar trượt (**"Tra cứu & Giải trí"**).
* **Khả năng tìm kiếm 3-trong-1**:
  1. **Tìm theo Tên khách hàng**: Không phân biệt chữ hoa/thường và không phân biệt dấu tiếng Việt (gõ `Lan Anh`, `lan anh`, `Anh`, `Bình Minh` đều khớp chính xác).
  2. **Tìm theo Số điện thoại**: Tự động xử lý lỗi mất số `0` ở đầu hoặc định dạng số khoa học (`9.01234567E8`) của Google Sheets. Hỗ trợ tìm theo SĐT đầy đủ (`0901234567`) hoặc 4–9 số cuối (`4567`).
  3. **Tìm theo Mã đơn hàng**: Khớp mã `HN-751646` hoặc `751646`.
* **Cơ Chế Bảo Mật Tuyệt Đối & Ẩn Danh Hóa (Incognito Privacy Masking)**:
  1. **Triệt tiêu lỗ hổng cào dữ liệu qua GViz**: Đã gỡ bỏ toàn bộ việc gọi trực tiếp `Orders_Master` qua JSONP GViz trên trình duyệt. Mọi truy vấn tra cứu bắt buộc đi qua Google Apps Script Web App API (`searchOrders`).
  2. **Hỗ trợ Google Sheets Riêng tư (Restricted Mode)**: Chủ tiệm có thể khóa file Google Sheets về chế độ "Chỉ những người được thêm mới mở được" mà Web App vẫn hoạt động bình thường, vì Google Apps Script chạy dưới quyền của Chủ sở hữu (*Execute as: Me*).
  3. **Che giấu PII trả về**: Tên khách được ẩn ký tự giữa (VD: `L** A**`), SĐT được che giấu (`090****567`), không trả về địa chỉ giao hàng và yêu cầu từ khóa tối thiểu 3 ký tự (giới hạn tối đa 10 đơn gần nhất) để chống quét dữ liệu tự động.
* **Hiển thị kết quả**:
  - Gom nhóm đơn hàng theo từng tuần (`Tuần dd/MM – dd/MM`).
  - Đơn hàng có Cột K là `Paid` hoặc `Đã thanh toán` hiển thị huy hiệu xanh lá **`Đã thanh toán`**.
  - Đơn hàng có Cột K là `Cancelled` hoặc `Đã hủy` hiển thị huy hiệu xám **`Đã hủy`**.
  - Đơn hàng **`Chưa thanh toán`** mới nhất sẽ tự động mở rộng (expand) danh sách món; nếu toàn bộ đơn của khách đều đã thanh toán thì tự động mở rộng đơn mới nhất để khách tiện đối chiếu.

### 4.5. Tự Động Gửi Báo Cáo Nấu Sữa Lúc 21h00 Hàng Ngày (`sendDailyKitchenReport`)
* Đúng **21h00 mỗi tối** (qua Time-driven Trigger `setupDaily21hTrigger`), hệ thống tự động:
  1. Xác định ngày giao hàng tiếp theo (nếu ngày mai là Chủ Nhật thì lấy Thứ 2).
  2. Quét bảng `Fact_Order_Items` (bỏ qua các dòng `Cancelled`/`Đã hủy`), đọc cột K (`Độ Ngọt`) và đối chiếu địa chỉ/ghi chú từ `Orders_Master`.
  3. Cộng tổng số lượng chai cần nấu cho từng món kèm **phân rã theo từng mức độ ngọt** (`🍯 Bình thường`, `🌿 Ít ngọt`, `🥥 Không ngọt`) và lập danh sách khách nhận kèm badge độ ngọt + ghi chú.
  4. Tự động đọc danh sách email nhận báo cáo từ tài khoản Google triển khai Web App, từ `config.js` trên GitHub (`KITCHEN_REPORT_EMAILS`), và từ tab `Dim_Config`.
  5. Gửi email báo cáo định dạng bảng rõ ràng về hộp thư của Bếp.

---

## 5. 🚧 TÍNH NĂNG ĐANG THIẾT KẾ — v2.5.0 (CHỜ DUYỆT, CHƯA TRIỂN KHAI)

> Trạng thái: **Bản đặc tả để review.** Chưa có dòng code nào được viết cho các tính năng dưới đây.

### 5.0. Điều kiện tiên quyết
1. `GAS_API_URL` trong `config.js` phải được cấu hình (Apps Script Web App: *Execute as: Me*, *Access: Anyone*). Mọi thao tác ghi và mọi dữ liệu nhạy cảm (địa chỉ, SĐT) chỉ đi qua Apps Script.
2. Một **OAuth Client ID** (Google Cloud Console) cho Google Sign-In, khai báo trong `config.js` (`GOOGLE_CLIENT_ID` — giá trị công khai, không phải bí mật) và trong `code.gs`.
3. Gỡ `FALLBACK_ORDERS` (dữ liệu đơn hàng thật) khỏi `config.js` và `index.html` — vi phạm Quy tắc số 2 của `AGENTS.md`; tra cứu đơn chuyển hẳn sang `searchOrders` qua Apps Script.

### 5.1. Tính năng: Tab Shipper / Staff (`?view=staff`)
* **Truy cập**: `https://xjithemx.github.io/heni_webapp/?view=staff`. Không có nút dẫn vào trên giao diện khách.
* **Xác thực**: Google Identity Services → ID token → mỗi request gửi kèm token → `code.gs` xác minh qua `https://oauth2.googleapis.com/tokeninfo` (`aud` = Client ID, `email_verified = true`, `exp` còn hạn) → đối chiếu tab `Staff`.
* **Phân quyền** (kiểm tra phía server cho từng request):
  | Vai trò | Xem đơn trong ngày | Đánh dấu Đã giao | Đánh dấu Đã thu tiền | Bật/Tắt menu |
  | :--- | :---: | :---: | :---: | :---: |
  | `owner` | ✅ | ✅ | ✅ | ✅ |
  | `shipper` | ✅ | ✅ | ✅ *(chờ chốt)* | ❌ |
* **Không lưu token** vào `localStorage`/`sessionStorage`; chỉ giữ trong bộ nhớ trang.
* **Màn hình**: chọn ngày (mặc định hôm nay), danh sách đơn có món giao trong ngày; mỗi thẻ hiện tên, SĐT (gọi/Zalo), địa chỉ, ghi chú, món & số chai trong ngày, tổng tiền đơn, trạng thái thanh toán; nút **✅ Đã giao** (theo đơn + ngày giao) và **💰 Đã thu tiền** (theo cả đơn); hoàn tác 10 giây; thanh tiến độ "Đã giao x/y".
* **API (`doPost`, bắt buộc `idToken`)**: `staffWhoAmI`, `staffGetDeliveries {date}`, `staffMarkDelivered {orderId, isoDate, value}`, `staffMarkPaid {orderId, value}`. Ghi có `LockService`; mọi thao tác ghi log vào `Tracking` (email, hành động, mã đơn).
* **Cột đã tạo trên `Orders_Master` (Cột L -> O)**:
  - `L: delivery_status `: Trạng thái giao (`Đã giao` hoặc để trống).
  - `M: delivered_at`: Thời điểm shipper bấm hoàn tất đơn.
  - `N: delivered_by`: Email shipper thực hiện giao.
  - `O: delivery_iso `: Ngày giao chuẩn định dạng `yyyy-MM-dd` (VD: `2026-11-13`) dùng lọc nhanh đơn trong ngày.
* **Cột J & K trên `Orders_Master`**:
  - `J: owner note`: Ghi chú nội bộ.
  - `K: Status`: Cột gạch nợ thanh toán chuẩn (`Paid` / `Cancelled`). Khi shipper bấm "Đã thu tiền", server ghi trực tiếp `Paid` vào Cột K.
* **Tab `Staff`**: `A: email` | `B: role` (`owner`/`shipper`) | `C: active` (`TRUE`/`FALSE`) | `D: name`.
* **Tab `Dim_Closures`**: `A: date_from ` | `B: date_to ` | `C: message ` | `D: created_by ` | `E: created_at ` | `F: active`.

### 5.2. Tính năng: Bật/Tắt Menu & Hẹn ngày mở lại (Lịch nghỉ)
* **Tab mới `Dim_Closures`**: `A: date_from` | `B: date_to` (trống = nghỉ vô thời hạn đến khi mở lại thủ công) | `C: message` (mặc định *"Ngày này quán tạm nghỉ"*) | `D: created_by` | `E: created_at` | `F: active`.
* **Quy tắc**: Ngày giao `D` bị đóng nếu tồn tại dòng `active` với `date_from ≤ D` và (`date_to` trống hoặc `D ≤ date_to`). Múi giờ `Asia/Ho_Chi_Minh`. Hết `date_to` → tự động mở lại.
* **Thao tác của owner**: trong `?view=staff` mục "Lịch nghỉ" (công tắc từng ngày trong 6 ngày giao tới, "Tạm nghỉ từ… đến…", "Mở lại ngay"), hoặc sửa trực tiếp tab `Dim_Closures`.
* **Giao diện khách**: ngày nghỉ vẫn hiển thị trong "Menu Sáng Mai" và "Lịch Đặt Trước"; món làm mờ, nút thêm vào giỏ bị khóa, dải thông báo *"🌿 Ngày này quán tạm nghỉ"* + lời nhắn; nút ngày có nhãn "Nghỉ"; món của ngày nghỉ trong giỏ được cảnh báo và loại bỏ.
* **Bảo vệ phía server**: `processOrder` từ chối món thuộc ngày nghỉ; `getDynamicMenu`/`init` trả kèm `closures`.
* **Cảnh báo khi tắt ngày đã có đơn**: trả về số đơn/số chai và danh sách khách (tên, SĐT) cần báo nghỉ.
* **Báo cáo bếp 21h00**: nếu ngày giao kế tiếp nghỉ → email ghi rõ "Ngày mai quán nghỉ".
* **Đơn mới lưu thêm `deliveryISO`** trong `Raw_JSON_Items` và `Fact_Order_Items.M` để so khớp ngày chính xác.

### 5.3. Lộ trình
`P1 GAS_API_URL` → `P3 gỡ dữ liệu khách` → `Lịch nghỉ (phía khách + Sheet)` → `P2 OAuth + Tab Staff` → `Bật/tắt menu trên app` → `Tài liệu & kiểm thử`.

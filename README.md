# 🌿 Góc Bếp Nhà Hení — Sữa Hạt Thủ Công Mộc Mạc

Hệ thống Web App đặt sữa hạt theo ngày & đặt trước cả tuần, tối ưu hóa cho **doanh nghiệp 1 người vận hành**:
- **Giao diện giữ nguyên 100% nguyên bản**: Ấm cúng, tối giản, dễ đặt món chỉ trong vài chạm.
- **Tốc độ tải ảnh tức thì (0.1s)**: Toàn bộ hình ảnh món ăn (`images/`) được phục vụ trực tiếp từ GitHub CDN thay vì phải chờ tải Base64 từ Google Drive.
- **Không lưu thông tin cá nhân trên trình duyệt**: Đảm bảo quyền riêng tư tuyệt đối cho khách hàng.
- **Tự động gửi Báo cáo Nấu Sữa lúc 20h00 hàng ngày**: Gửi thẳng về email mặc định `ll.huyhoang.1412@gmail.com` (và các email khai báo thêm trong [`config.js`](./config.js)).

---

## 🛠️ HƯỚNG DẪN CẬP NHẬT NHANH CHO CHỦ TIỆM (1 NGƯỜI VẬN HÀNH)

### 1. Thêm Email nhận Báo Cáo Nấu Sữa 20h00 trên GitHub
Mở file [`config.js`](./config.js) ngay trên GitHub và thêm email vào danh sách `KITCHEN_REPORT_EMAILS`:
```javascript
KITCHEN_REPORT_EMAILS: [
  'll.huyhoang.1412@gmail.com',
  'email-moi-cua-ban@gmail.com'
],
```
*(Hệ thống Google Apps Script sẽ tự động đọc file `config.js` này trên GitHub lúc 20h00 mỗi tối để gửi báo cáo nấu sữa cho ngày hôm sau).*

### 2. Cập nhật Menu, Giá bán, Calo, Bật/Tắt món ăn
Mở file Google Sheets `heni_webapp` -> Chọn tab **`Dim_Menu`**:
- **Bật/Tắt món**: Gõ `active` vào cột `status` để hiện món, hoặc đổi sang `inactive` (hoặc xóa trống) để ẩn món trên web.
- **Đổi giá / tên / mô tả / kcalo**: Sửa trực tiếp trên dòng của món đó, web sẽ tự động cập nhật.

### 3. Cập nhật Thông Báo Hàng Tuần (Khung cảm ơn / Chương trình tuần mới)
Bạn có **2 cách** cực kỳ đơn giản:
- **Cách 1 (Sửa ngay trên Google Sheets)**: Mở tab **`Dim_Config`**, thêm hoặc sửa các dòng:
  - `weekly_badge`: Nhãn nhỏ phía trên (VD: `Ưu đãi tuần mới`)
  - `weekly_title`: Tiêu đề lớn (VD: `Chân Thành Cảm Ơn 💚` — *Nếu xóa trống ô này, khung thông báo sẽ tự ẩn đi*)
  - `weekly_content`: Nội dung đoạn văn thông báo
  - `weekly_footer`: Dòng chữ nhỏ dưới cùng
- **Cách 2 (Sửa trong [`config.js`](./config.js) trên GitHub)**: Sửa mục `WEEKLY_BANNER` trong file `config.js`.

### 4. Cập nhật Ảnh Món Mới
Khi có món mới (ví dụ mã món `t2_p2`):
- Tải file ảnh `t2_p2.png` (hoặc `.jpg`) vào thư mục [`images/`](./images/) trên GitHub để web load siêu nhanh.

---

## ⚙️ CÀI ĐẶT ĐỒNG BỘ GOOGLE APPS SCRIPT (CHỈ LÀM 1 LẦN)

1. Mở Google Apps Script gắn với file Google Sheets `heni_webapp`.
2. Copy toàn bộ nội dung file [`code.gs`](./code.gs) dán đè vào file `Code.gs` trên Apps Script.
3. Trên thanh công cụ Apps Script, chọn hàm **`setupDaily20hTrigger`** và bấm **Chạy (Run)** 1 lần duy nhất -> Hệ thống sẽ tự động hẹn giờ gửi email Báo Cáo Nấu Sữa vào **20h00 mỗi tối**.
4. Bấm **Deploy** -> **New deployment** -> Chọn loại **Web app**:
   - *Execute as*: **Me**
   - *Who has access*: **Anyone**
5. Copy đường link **Web app URL** (`https://script.google.com/macros/s/.../exec`) dán vào mục `GAS_API_URL` trong file [`config.js`](./config.js) trên GitHub.

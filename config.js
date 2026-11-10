// ============================================================================
// CẤU HÌNH NHANH CHO CHỦ TIỆM HENÍ (Sửa trực tiếp trên GitHub khi cần)
// ============================================================================
window.HENI_CONFIG = {
  // 1. Danh sách Email nhận Báo cáo Nấu Sữa tự động lúc 20h00 mỗi tối
  // (Có thể thêm nhiều email, cách nhau bằng dấu phẩy hoặc thêm vào mảng dưới đây)
  KITCHEN_REPORT_EMAILS: [
    'll.huyhoang.1412@gmail.com',
    'ntthien.524@gmail.com',
    'ntthien.0403@gmail.com'
  ],

  // 2. ID Google Sheets Database & Đường dẫn Google Apps Script Web App API
  // Khi chạy trên GitHub Pages, app tự động thử đồng bộ trực tiếp từ SHEET_ID (qua GViz JSONP)
  // hoặc qua GAS_API_URL (nếu đã dán URL Web App ".../exec" vào đây), và đối chiếu FALLBACK_ORDERS:
  SHEET_ID: '1sjkxZS37_g-R3JowKI99AkaNTCb_HjhcAgrDAInrgb8',
  GAS_API_URL: 'https://script.google.com/macros/s/AKfycbylsdvObPpSIrHHNNTEblOysNjdea5Dqh7ruT_16fRenWWLO-wt7f_SAut2DR1h0v4b7g/exec',

  // 3. Thư mục chứa ảnh tĩnh trên GitHub CDN (mặc định: './images/')
  IMAGE_BASE_URL: './images/',

  // 4. Nội dung Thông Báo Hàng Tuần (Weekly Section)
  // (Nếu trên Google Sheet tab Dim_Config có khai báo weekly_title thì sẽ ưu tiên lấy từ Sheet,
  //  nếu không có thì lấy mặc định tại đây. Đổi enabled: false nếu muốn ẩn khung này)
  WEEKLY_BANNER: {
    enabled: true,
    badge: 'Tổng kết tuần lễ ra mắt',
    title: 'Chân Thành Cảm Ơn 💚',
    content: 'Chương trình ưu đãi ra mắt đã chính thức khép lại với <b>47 phần quà</b> được trao tận tay các "thượng đế". Góc Bếp Nhà Hení vô cùng biết ơn sự ủng hộ và yêu thương của mọi người. Hẹn gặp lại cả nhà ở những chương trình ưu đãi tiếp theo nhé!',
    footer: 'Sữa hạt vẫn luôn được nấu tươi mới mỗi sáng'
  },
  WEEKLY_BANNER: {
    enabled: true,
    badge: 'Tổng kết tuần 2',
    title: 'Tiếp tục gửi tới khách hàng lời Cảm Ơn Chân Thành💚',
    content: 'Menu được cập nhật mới liên tục và luôn nhận được những phản hồi tích cực của khách hàng, khen có góp ý cải thiện cũng có và luôn đi kèm những lời động viên chân thành!',
    footer: 'Sữa hạt vẫn luôn được nấu tươi mới mỗi sáng và sẽ tiếp tục được nghiên cứu để ra những sản phẩm mới tốt hơn.'
  },

  // 5. Thông tin Thanh toán mặc định (sẽ tự động cập nhật nếu tab payment_method trên Sheet thay đổi)
  PAYMENT_DEFAULT: {
    momo: '',
    vcb: 'Updating',
    momoQr: './images/momo.jpg',
    vcbQr: ''
  },

  // 6. Video Góc Thư Giãn (File ID trên Google Drive hoặc URL video)
  RELAX_VIDEO_ID: '1S7qneg966XvP_X_OZikjMoR3aWH77jkn',

  // 7. Thực đơn dự phòng (Hiển thị tức thì trong 0.1s ngay khi mở trang, trước khi đồng bộ từ Sheet)
  FALLBACK_MENU: [
    { id: 't2_s1', name: 'Điều - Yến Mạch - Cacao', category: 'standard', price: 25000, dayOfWeek: 1, desc: 'Giàu năng lượng, thơm lừng', imageKey: 't2_s1', kcal: 205 },
    { id: 't2_p1', name: 'Gạo Lứt - Hạnh Nhân - Táo Đỏ', category: 'premium', price: 30000, dayOfWeek: 1, desc: 'Thơm bùi, chắc bụng', imageKey: 't2_p1', kcal: 181 },
    { id: 't3_s1', name: 'Điều - Đậu Xanh -  Cải Kale', category: 'standard', price: 25000, dayOfWeek: 2, desc: 'Xanh mát, thanh lọc cơ thể', imageKey: 't3_s1', kcal: 166 },
    { id: 't3_p1', name: 'Macca - Sen - Lá dứa', category: 'premium', price: 30000, dayOfWeek: 2, desc: 'Thơm lá dứa, thanh nhiệt dịu nhẹ', imageKey: 't3_p1', kcal: 206 },
    { id: 't3_p2', name: 'Hạnh Nhân - Yến Mạch - Mè Đen', category: 'premium', price: 30000, dayOfWeek: 2, desc: 'Thơm lừng, tuyệt vời cho tim mạch', imageKey: 't3_p2', kcal: 210 },
    { id: 't4_s1', name: 'Đậu Đỏ - Yến Mạch - Củ Dền', category: 'standard', price: 25000, dayOfWeek: 3, desc: 'Bổ máu, nhuận sắc rạng rỡ', imageKey: 't4_s1', kcal: 168 },
    { id: 't4_s2', name: 'Yến Mạch - Hoa Đậu Biếc - Hạt Chia', category: 'standard', price: 25000, dayOfWeek: 3, desc: 'Sắc xanh dịu mát, giàu dưỡng chất & Omega-3', imageKey: 't4_s2', kcal: 166 },
    { id: 't4_p1', name: 'Điều - Hạnh Nhân - Khoai Lang Tím', category: 'premium', price: 30000, dayOfWeek: 3, desc: 'Béo ngậy, giàu chất chống oxy hóa', imageKey: 't4_p1', kcal: 170 },
    { id: 't5_s1', name: 'Bí đỏ - Sen - Điều', category: 'standard', price: 25000, dayOfWeek: 4, desc: 'Giàu vitamin và khoáng chất thiết yếu', imageKey: 't5_s1', kcal: 155 },
    { id: 't5_s2', name: 'Đậu Xanh - Sen - Lá Dứa', category: 'standard', price: 25000, dayOfWeek: 4, desc: 'Hương thơm lá dứa, thanh nhiệt bùi ngọt', imageKey: 't5_s2', kcal: 188 },
    { id: 't5_p1', name: 'Óc Chó - Đậu Đen - Hạnh Nhân', category: 'premium', price: 30000, dayOfWeek: 4, desc: 'Bồi bổ sức khỏe, đen tóc mượt da', imageKey: 't5_p1', kcal: 201 },
    { id: 't6_s1', name: 'Đậu Phộng - Mè Đen - Điều', category: 'standard', price: 25000, dayOfWeek: 5, desc: 'Dễ tiêu hóa, ấm áp dạ dày', imageKey: 't6_s1', kcal: 231 },
    { id: 't6_p1', name: 'Macca - Bí Đỏ - Cốt Dừa', category: 'premium', price: 30000, dayOfWeek: 5, desc: 'Ngậy béo tự nhiên, bổ não và tốt cho mắt', imageKey: 't6_p1', kcal: 154 },
    { id: 't7_s1', name: 'Bắp Ngọt Thanh -  Hạt Điều - Dừa Non', category: 'standard', price: 25000, dayOfWeek: 6, desc: 'Vị ngọt thanh mộc mạc tự nhiên', imageKey: 't7_s1', kcal: 185 },
    { id: 't7_p1', name: 'Cốm - Sen - Điều', category: 'premium', price: 30000, dayOfWeek: 6, desc: 'Thơm lừng hương vị mùa thu Hà Nội', imageKey: 't7_p1', kcal: 191 }
  ],

  // 8. Google OAuth Client ID cho Tab Shipper / Quản lý (?view=staff)
  // Tạo 1 lần trên Google Cloud Console (miễn phí) và dán vào đây:
  GOOGLE_CLIENT_ID: '',

  // 9. Danh sách đơn fallback (chỉ giữ rỗng, dữ liệu đơn bảo mật 100% qua Apps Script)
  FALLBACK_ORDERS: []
};

// ============================================================================
// CẤU HÌNH NHANH CHO CHỦ TIỆM HENÍ (Sửa trực tiếp trên GitHub khi cần)
// ============================================================================
window.HENI_CONFIG = {
  // 1. Danh sách Email nhận Báo cáo Nấu Sữa tự động lúc 20h00 mỗi tối
  // (Có thể thêm nhiều email, cách nhau bằng dấu phẩy hoặc thêm vào mảng dưới đây)
  KITCHEN_REPORT_EMAILS: [
    'll.huyhoang.1412@gmail.com'
  ],

  // 2. ID Google Sheets Database & Đường dẫn Google Apps Script Web App API
  // Khi chạy trên GitHub Pages, app tự động thử đồng bộ trực tiếp từ SHEET_ID (qua GViz JSONP)
  // hoặc qua GAS_API_URL (nếu đã dán URL Web App ".../exec" vào đây), và đối chiếu FALLBACK_ORDERS:
  SHEET_ID: '1sjkxZS37_g-R3JowKI99AkaNTCb_HjhcAgrDAInrgb8',
  GAS_API_URL: '',

  // 3. Thư mục chứa ảnh tĩnh trên GitHub CDN (mặc định: './images/')
  IMAGE_BASE_URL: './images/',

  // 4. Nội dung Thông Báo Hàng Tuần (Weekly Section)
  // (Nếu trên Google Sheet tab Dim_Config có khai báo weekly_title thì sẽ ưu tiên lấy từ Sheet,
  //  nếu không có thì lấy mặc định tại đây. Đổi enabled: false nếu muốn ẩn khung này)
  WEEKLY_BANNER: {
    enabled: true,
    badge: 'Tổng kết tuần lễ ra mắt',
    title: 'Chân Thành Cảm Ơn 💚',
    content: 'Chương trình ưu đãi ra mắt đã chính thức khép lại với <b>17 phần quà</b> được trao tận tay các "thượng đế". Góc Bếp Nhà Hení vô cùng biết ơn sự ủng hộ và yêu thương của mọi người. Hẹn gặp lại cả nhà ở những chương trình ưu đãi tiếp theo nhé!',
    footer: 'Sữa hạt vẫn luôn được nấu tươi mới mỗi sáng'
  },

  // 5. Thông tin Thanh toán mặc định (sẽ tự động cập nhật nếu tab payment_method trên Sheet thay đổi)
  PAYMENT_DEFAULT: {
    momo: '0834983524',
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

  // 8. Bản sao đồng bộ 100% từ tab Orders_Master (bao gồm cột K Status mới nhất)
  FALLBACK_ORDERS: [
      {
          "orderId": "HN-509264",
          "customerName": "Ngoc Nguyen",
          "phone": "0938728073",
          "date": "07/11/2026",
          "timestamp": "2026-11-07T22:48:29+07:00",
          "total": 110000,
          "status": "Chưa thanh toán",
          "items": [
              {
                  "name": "Điều - Yến Mạch - Cacao",
                  "quantity": 1,
                  "price": 25000,
                  "deliveryDate": "Thứ 2 (09-11)"
              },
              {
                  "name": "Gạo Lứt - Hạnh Nhân - Táo Đỏ",
                  "quantity": 1,
                  "price": 30000,
                  "deliveryDate": "Thứ 2 (09-11)"
              },
              {
                  "name": "Macca - Sen - Lá dứa",
                  "quantity": 1,
                  "price": 30000,
                  "deliveryDate": "Thứ 3 (10-11)"
              },
              {
                  "name": "Điều - Đậu Xanh -  Cải Kale",
                  "quantity": 1,
                  "price": 25000,
                  "deliveryDate": "Thứ 3 (10-11)"
              }
          ]
      },
      {
          "orderId": "HN-658487",
          "customerName": "Suri",
          "phone": "0948667431",
          "date": "04/11/2026",
          "timestamp": "2026-11-04T10:24:18+07:00",
          "total": 25000,
          "status": "Paid",
          "items": [
              {
                  "name": "Bí đỏ - Sen - Điều",
                  "quantity": 1,
                  "price": 25000,
                  "deliveryDate": "Thứ 5 (05-11)"
              }
          ]
      },
      {
          "orderId": "HN-425216",
          "customerName": "Sang Nguyễn",
          "phone": "0898361274",
          "date": "03/11/2026",
          "timestamp": "2026-11-03T13:30:25+07:00",
          "total": 50000,
          "status": "Paid",
          "items": [
              {
                  "name": "Đậu Đỏ - Yến Mạch - Củ Dền",
                  "quantity": 1,
                  "price": 25000,
                  "deliveryDate": "Thứ 4 (04-11)"
              },
              {
                  "name": "Yến Mạch - Hoa Đậu Biếc - Hạt Chia",
                  "quantity": 1,
                  "price": 25000,
                  "deliveryDate": "Thứ 4 (04-11)"
              }
          ]
      },
      {
          "orderId": "HN-452620",
          "customerName": "Anh Đào",
          "phone": "0942685872",
          "date": "03/11/2026",
          "timestamp": "2026-11-03T10:10:52+07:00",
          "total": 80000,
          "status": "Paid",
          "items": [
              {
                  "name": "Yến Mạch - Hoa Đậu Biếc - Hạt Chia",
                  "quantity": 1,
                  "price": 25000,
                  "deliveryDate": "Thứ 4 (04-11)"
              },
              {
                  "name": "Đậu Đỏ - Yến Mạch - Củ Dền",
                  "quantity": 1,
                  "price": 25000,
                  "deliveryDate": "Thứ 4 (04-11)"
              },
              {
                  "name": "Điều - Hạnh Nhân - Khoai Lang Tím",
                  "quantity": 1,
                  "price": 30000,
                  "deliveryDate": "Thứ 4 (04-11)"
              }
          ]
      },
      {
          "orderId": "HN-905051",
          "customerName": "Phạm Tiến Đạt",
          "phone": "0962766627",
          "date": "03/11/2026",
          "timestamp": "2026-11-03T09:11:45+07:00",
          "total": 50000,
          "status": "Paid",
          "items": [
              {
                  "name": "Điều - Yến Mạch - Cacao",
                  "quantity": 2,
                  "price": 25000,
                  "deliveryDate": "Thứ 2 (09-11)"
              }
          ]
      },
      {
          "orderId": "HN-607612",
          "customerName": "C Hayley",
          "phone": "0379524516",
          "date": "02/11/2026",
          "timestamp": "2026-11-02T23:06:47+07:00",
          "total": 165000,
          "status": "Paid",
          "items": [
              {
                  "name": "Điều - Đậu Xanh -  Cải Kale",
                  "quantity": 1,
                  "price": 25000,
                  "deliveryDate": "Thứ 3 (10-11)"
              },
              {
                  "name": "Macca - Sen - Lá dứa",
                  "quantity": 1,
                  "price": 30000,
                  "deliveryDate": "Thứ 3 (10-11)"
              },
              {
                  "name": "Đậu Đỏ - Yến Mạch - Củ Dền",
                  "quantity": 1,
                  "price": 25000,
                  "deliveryDate": "Thứ 4 (04-11)"
              },
              {
                  "name": "Điều - Hạnh Nhân - Khoai Lang Tím",
                  "quantity": 1,
                  "price": 30000,
                  "deliveryDate": "Thứ 4 (04-11)"
              },
              {
                  "name": "Bí đỏ - Sen - Điều",
                  "quantity": 1,
                  "price": 25000,
                  "deliveryDate": "Thứ 5 (05-11)"
              },
              {
                  "name": "Macca - Bí Đỏ - Cốt Dừa",
                  "quantity": 1,
                  "price": 30000,
                  "deliveryDate": "Thứ 6 (06-11)"
              }
          ]
      },
      {
          "orderId": "HN-624495",
          "customerName": "Sang Nguyễn",
          "phone": "0898361274",
          "date": "02/11/2026",
          "timestamp": "2026-11-02T14:13:44+07:00",
          "total": 55000,
          "status": "Paid",
          "items": [
              {
                  "name": "Điều - Đậu Xanh -  Cải Kale",
                  "quantity": 1,
                  "price": 25000,
                  "deliveryDate": "Thứ 3 (03-11)"
              },
              {
                  "name": "Macca - Sen - Lá dứa",
                  "quantity": 1,
                  "price": 30000,
                  "deliveryDate": "Thứ 3 (03-11)"
              }
          ]
      },
      {
          "orderId": "HN-592467",
          "customerName": "Vy",
          "phone": "0984676449",
          "date": "02/11/2026",
          "timestamp": "2026-11-02T14:13:12+07:00",
          "total": 30000,
          "status": "Paid",
          "items": [
              {
                  "name": "Macca - Sen - Lá dứa",
                  "quantity": 1,
                  "price": 30000,
                  "deliveryDate": "Thứ 3 (03-11)"
              }
          ]
      },
      {
          "orderId": "HN-751646",
          "customerName": "C Ngọc",
          "phone": "0379524516",
          "date": "02/11/2026",
          "timestamp": "2026-11-02T09:15:51+07:00",
          "total": 140000,
          "status": "Paid",
          "items": [
              {
                  "name": "Điều - Đậu Xanh -  Cải Kale",
                  "quantity": 1,
                  "price": 25000,
                  "deliveryDate": "Thứ 3 (03-11)"
              },
              {
                  "name": "Điều - Hạnh Nhân - Khoai Lang Tím",
                  "quantity": 1,
                  "price": 30000,
                  "deliveryDate": "Thứ 4 (04-11)"
              },
              {
                  "name": "Macca - Bí Đỏ - Cốt Dừa",
                  "quantity": 1,
                  "price": 30000,
                  "deliveryDate": "Thứ 6 (06-11)"
              },
              {
                  "name": "Bắp Ngọt Thanh -  Hạt Điều - Dừa Non",
                  "quantity": 1,
                  "price": 25000,
                  "deliveryDate": "Thứ 7 (07-11)"
              },
              {
                  "name": "Cốm - Sen - Điều",
                  "quantity": 1,
                  "price": 30000,
                  "deliveryDate": "Thứ 7 (07-11)"
              }
          ]
      },
      {
          "orderId": "HN-078663",
          "customerName": "Anh Đào",
          "phone": "0942685872",
          "date": "31/10/2026",
          "timestamp": "2026-10-31T22:04:38+07:00",
          "total": 110000,
          "status": "Paid",
          "items": [
              {
                  "name": "Điều yến mạch cacao",
                  "quantity": 2,
                  "price": 25000,
                  "deliveryDate": "Thứ 2 (02-11)"
              },
              {
                  "name": "Gạo lứt rang hạnh nhân điều",
                  "quantity": 2,
                  "price": 30000,
                  "deliveryDate": "Thứ 2 (02-11)"
              }
          ]
      },
      {
          "orderId": "HN-897186",
          "customerName": "Suri SPX",
          "phone": "0948667431",
          "date": "30/10/2026",
          "timestamp": "2026-10-30T15:28:17+07:00",
          "total": 140000,
          "status": "Paid",
          "items": [
              {
                  "name": "Gạo lứt rang hạnh nhân điều",
                  "quantity": 1,
                  "price": 30000,
                  "deliveryDate": "Thứ 2 (02-11)"
              },
              {
                  "name": "Điều đậu xanh cải Kale",
                  "quantity": 1,
                  "price": 25000,
                  "deliveryDate": "Thứ 3 (03-11)"
              },
              {
                  "name": "Macca hạt sen lá dứa",
                  "quantity": 1,
                  "price": 30000,
                  "deliveryDate": "Thứ 3 (03-11)"
              },
              {
                  "name": "Đậu đỏ óc chó củ dền",
                  "quantity": 1,
                  "price": 25000,
                  "deliveryDate": "Thứ 4 (04-11)"
              },
              {
                  "name": "Điều hạnh nhân khoai lang tím",
                  "quantity": 1,
                  "price": 30000,
                  "deliveryDate": "Thứ 4 (04-11)"
              }
          ]
      },
      {
          "orderId": "HN-807053",
          "customerName": "Nic",
          "phone": "0796600161",
          "date": "30/10/2026",
          "timestamp": "2026-10-30T12:56:47+07:00",
          "total": 90000,
          "status": "Paid",
          "items": [
              {
                  "name": "Macca hạt sen lá dứa",
                  "quantity": 3,
                  "price": 30000,
                  "deliveryDate": "Thứ 3 (03-11)"
              }
          ]
      },
      {
          "orderId": "HN-229629",
          "customerName": "uyên",
          "phone": "0388948533",
          "date": "29/10/2026",
          "timestamp": "2026-10-29T16:47:09+07:00",
          "total": 25000,
          "status": "Paid",
          "items": [
              {
                  "name": "Đậu phộng mè đen điều",
                  "quantity": 1,
                  "price": 25000,
                  "deliveryDate": "Thứ 6 (30-10)"
              }
          ]
      },
      {
          "orderId": "HN-066384",
          "customerName": "Vy",
          "phone": "0984676449",
          "date": "29/10/2026",
          "timestamp": "2026-10-29T16:44:26+07:00",
          "total": 25000,
          "status": "Paid",
          "items": [
              {
                  "name": "Bắp ngọt thanh hạt điều",
                  "quantity": 1,
                  "price": 25000,
                  "deliveryDate": "Thứ 7 (31-10)"
              }
          ]
      },
      {
          "orderId": "HN-139779",
          "customerName": "Thanh Tâm",
          "phone": "0764392747",
          "date": "29/10/2026",
          "timestamp": "2026-10-29T13:42:19+07:00",
          "total": 25000,
          "status": "Paid",
          "items": [
              {
                  "name": "Đậu phộng mè đen điều",
                  "quantity": 1,
                  "price": 25000,
                  "deliveryDate": "Thứ 6 (30-10)"
              }
          ]
      },
      {
          "orderId": "HN-429812",
          "customerName": "Ahihi Thắng vip pro",
          "phone": "0398270997",
          "date": "29/10/2026",
          "timestamp": "2026-10-29T08:13:49+07:00",
          "total": 30000,
          "status": "Cancelled",
          "items": [
              {
                  "name": "Hạnh nhân yến mạch mè đen",
                  "quantity": 1,
                  "price": 30000,
                  "deliveryDate": "Thứ 6 (30-10)"
              }
          ]
      }
  ]
};

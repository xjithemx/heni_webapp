const CONFIG = {
  SHEET_ID: '1sjkxZS37_g-R3JowKI99AkaNTCb_HjhcAgrDAInrgb8', // ID Google Sheets của bạn
  FOLDER_ID: '1t4ATTufnr7ZXJM45Ek-V7f--mKGO6i4J', // ID thư mục Drive
  FOLDER_ID_menu: '1UNKQJYm3nmjf_j6EA8QmRSXpyxzPOo6z', // ID thư mục Ảnh món
  PAYMENT_QR_MOMO_ID: '1w2QoGQoc9tjgv2AqWXt9yGU1eN1zMK_e', // QR MoMo tĩnh (fallback khi ô Sheet không có link)
  DEFAULT_KITCHEN_EMAILS: 'll.huyhoang.1412@gmail.com', // Email mặc định nhận Báo cáo Nấu Sữa 20h00
  GITHUB_CONFIG_URL: 'https://raw.githubusercontent.com/xjithemx/heni_webapp/main/config.js' // Tự động đọc danh sách email từ GitHub config.js
};

// Helper: bỏ đuôi file (VD: "t2_s1.jpg" -> "t2_s1")
function stripExt(fileName) {
  const i = fileName.lastIndexOf('.');
  return i > 0 ? fileName.substring(0, i) : fileName;
}

// Helper: map cột H (Link_Anh)
// - URL đầy đủ (https://...) -> dùng trực tiếp
// - Tên file (VD: 1.png) -> key để tra ảnh
// - Trống -> fallback theo SKU (cột A)
function resolveImage(rawLink, skuId) {
  const link = (rawLink || '').toString().trim();
  if (/^https?:\/\//i.test(link)) return { imageUrl: link, imageKey: null };
  return { imageUrl: null, imageKey: link ? stripExt(link) : skuId.toString().trim() };
}

// Helper: map cột I (kcalo)
function parseKcal(rawKcal) {
  const s = (rawKcal === null || rawKcal === undefined ? '' : rawKcal).toString().replace(/kcal/i, '').trim();
  if (s === '') return null;
  const n = Number(s);
  return isNaN(n) ? s : n;
}

// Helper: trả về JSON chuẩn cho GitHub Pages fetch API
function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// 1. Khởi tạo Web App & Cổng API GET cho GitHub Pages
function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) ? e.parameter.action : '';

  if (action === 'init') {
    logTracking({ action: 'open_app', details: 'User loaded the web app (GitHub CDN)' });
    const paymentRes = getPaymentInfo(true); // Light mode: không tốn thời gian encode Base64 nếu không cần
    return jsonResponse({
      success: true,
      menu: getDynamicMenu(),
      payment: paymentRes.success ? paymentRes.data : null,
      config: getAppConfig()
    });
  }

  if (action === 'searchOrders') {
    const q = (e && e.parameter && (e.parameter.query || e.parameter.q || e.parameter.phone)) || '';
    return jsonResponse(searchOrders(q));
  }

  if (action === 'sendKitchenReport') {
    return jsonResponse(sendDailyKitchenReport());
  }

  logTracking({ action: 'open_app', details: 'User loaded the web app' });
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('Góc Bếp Nhà Hení')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no');
}

// 1b. Cổng API POST cho GitHub Pages (Xử lý đặt hàng & tracking)
function doPost(e) {
  try {
    const body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const action = body.action || '';
    const payload = body.payload || body;

    if (action === 'processOrder') {
      return jsonResponse(processOrder(payload));
    }
    if (action === 'logTracking') {
      logTracking(payload);
      return jsonResponse({ success: true });
    }
    return jsonResponse({ success: false, message: 'Unknown action' });
  } catch (err) {
    return jsonResponse({ success: false, message: err.toString() });
  }
}

// 2. Fetch Hình Ảnh từ Drive (Fallback khi chạy trực tiếp trên GAS)
function getStoreImages() {
  try {
    const folder = DriveApp.getFolderById(CONFIG.FOLDER_ID_menu);
    const files = folder.getFiles();
    const images = {};

    while (files.hasNext()) {
      const file = files.next();
      const fileName = file.getName();
      const mimeType = file.getMimeType();

      if (mimeType.indexOf('image/') === 0) {
        const bytes = file.getBlob().getBytes();
        const base64 = Utilities.base64Encode(bytes);
        const skuKey = stripExt(fileName);
        images[skuKey] = 'data:' + mimeType + ';base64,' + base64;
      }
    }
    return { success: true, data: images };
  } catch (error) {
    return { success: false, message: 'Lỗi Drive: ' + error.toString() };
  }
}

// 3. Lấy Thực Đơn Động từ tab Dim_Menu
function getDynamicMenu() {
  const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  const sheet = ss.getSheetByName('Dim_Menu');

  if (!sheet) return [];

  const data = sheet.getDataRange().getValues();
  const menuItems = [];

  const parseDayOfWeek = (dayStr) => {
    const str = (dayStr || '').toString().toLowerCase().trim();
    if (str.includes('2')) return 1;
    if (str.includes('3')) return 2;
    if (str.includes('4')) return 3;
    if (str.includes('5')) return 4;
    if (str.includes('6')) return 5;
    if (str.includes('7')) return 6;
    return 1;
  };

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const status = (row[6] || '').toString().trim().toLowerCase();

    if (status === 'active') {
      const phanLoai = (row[2] || '').toString().trim().toLowerCase();
      const categoryEn = phanLoai.includes('cao cấp') ? 'premium' : 'standard';

      menuItems.push({
        id: row[0].toString().trim(),
        name: row[1].toString().trim(),
        category: categoryEn,
        price: Number(row[3]) || 0,
        dayOfWeek: parseDayOfWeek(row[4]),
        desc: row[5].toString().trim(),
        ...resolveImage(row[7], row[0]),
        kcal: parseKcal(row[8])
      });
    }
  }

  return menuItems;
}

// 3b. Lấy Cấu Hình Ứng Dụng & Content Tuần từ tab Dim_Config
function getAppConfig() {
  try {
    const sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName('Dim_Config');
    if (!sheet) return {};
    const rows = sheet.getDataRange().getValues();
    const conf = {};
    for (let i = 1; i < rows.length; i++) {
      const k = (rows[i][0] || '').toString().trim();
      const v = rows[i][1] !== undefined && rows[i][1] !== null ? rows[i][1].toString().trim() : '';
      if (k) conf[k] = v;
    }
    return conf;
  } catch (e) {
    return {};
  }
}

// 4. Tra cứu đơn hàng theo Tên Khách, SĐT, hoặc Mã Đơn
function searchOrders(rawQuery) {
  try {
    const q = (rawQuery || '').toString().trim();
    if (!q) return { success: false, message: 'Vui lòng nhập Tên, Số điện thoại hoặc Mã đơn hàng.' };

    const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    const sheet = ss.getSheetByName('Orders_Master');
    if (!sheet) return { success: false, message: 'Hệ thống đang bảo trì tính năng tra cứu.' };

    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return { success: false, message: 'Chưa có dữ liệu đơn hàng.' };

    const headers = data[0].map(h => (h || '').toString().trim().toLowerCase());
    let statusCol = headers.indexOf('status');
    if (statusCol < 0) statusCol = 9;
    const ITEMS_COL = 6; // Raw_JSON_Items (cột G)

    // Helper bỏ dấu tiếng Việt để tìm kiếm không phân biệt dấu
    const removeAccents = (str) => {
      if (!str) return '';
      return str.toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
    };

    // Helper chuẩn hóa số điện thoại: xử lý cả scientific notation (3.795E8) và bỏ số 0 đầu
    const cleanPhone = (val) => {
      if (val === null || val === undefined || val === '') return '';
      try {
        const n = Number(val);
        const s = (!isNaN(n) && val !== '') ? n.toLocaleString('fullwide', { useGrouping: false }) : val.toString();
        return s.replace(/\D/g, '').replace(/^0+/, '');
      } catch (e) {
        return val.toString().replace(/\D/g, '').replace(/^0+/, '');
      }
    };

    const qClean = q.toLowerCase();
    const qNorm = removeAccents(q);
    const qPhone = cleanPhone(q);

    const orders = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const orderId = (row[0] || '').toString().trim();
      if (!orderId) continue;

      const custName = (row[2] || '').toString().trim();
      const custPhone = row[3];
      const custPhoneClean = cleanPhone(custPhone);
      const custNameNorm = removeAccents(custName);

      // 1. Khớp mã đơn
      const matchId = qClean && orderId.toLowerCase().indexOf(qClean) !== -1;
      // 2. Khớp tên khách hàng (không phân biệt hoa thường và dấu tiếng Việt)
      const matchName = qNorm && custNameNorm.indexOf(qNorm) !== -1;
      // 3. Khớp số điện thoại (từ 4 số trở lên, khớp chính xác hoặc khớp đuôi)
      const matchPhone = (qPhone && qPhone.length >= 4 && custPhoneClean) &&
                         (custPhoneClean === qPhone || custPhoneClean.endsWith(qPhone));

      if (!matchId && !matchName && !matchPhone) continue;

      let items = [];
      try { items = JSON.parse(row[ITEMS_COL]) || []; } catch (e) { items = []; }

      const ts = row[1] instanceof Date ? row[1] : new Date(row[1]);
      const statusJ = (row[9] || '').toString().trim();
      const statusK = (row[10] || '').toString().trim();
      const statusHeader = (row[statusCol] || '').toString().trim();
      const combinedStatus = `${statusJ} ${statusK} ${statusHeader}`.toLowerCase();
      const isPaid = combinedStatus.indexOf('paid') !== -1 || combinedStatus.indexOf('đã thanh toán') !== -1;

      orders.push({
        orderId: orderId,
        customerName: custName,
        phone: custPhoneClean ? ('0' + custPhoneClean) : '',
        date: Utilities.formatDate(ts, Session.getScriptTimeZone() || 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy'),
        timestamp: ts.toISOString(),
        total: Number(row[7]) || 0,
        items: items.map(it => ({
          name: it.name || '',
          quantity: Number(it.quantity) || 0,
          price: Number(it.price) || 0,
          deliveryDate: it.deliveryDate || ''
        })),
        status: isPaid ? 'Paid' : (statusJ || statusHeader || 'Chưa thanh toán')
      });
    }

    if (orders.length === 0) {
      return { success: false, message: `Không tìm thấy đơn hàng nào khớp với "${q}".` };
    }
    return { success: true, data: orders };
  } catch (error) {
    return { success: false, message: 'Lỗi hệ thống: ' + error.toString() };
  }
}

// 4b. Thông tin thanh toán (tab payment_method)
function getPaymentInfo(skipDriveBase64) {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    const sheet = ss.getSheetByName('payment_method');
    if (!sheet) return { success: false, message: 'Thiếu tab payment_method' };

    const rows = sheet.getDataRange().getValues();
    const info = { momo: '0834983524', vcb: 'Updating', momoQr: '', vcbQr: '' };
    for (let i = 1; i < rows.length; i++) {
      const type = (rows[i][0] || '').toString().trim().toLowerCase();
      if (type !== 'momo' && type !== 'vcb') continue;
      info[type] = (rows[i][1] || '').toString().trim();

      // Chỉ đọc ảnh từ Drive nếu không bật cờ skipDriveBase64
      if (!skipDriveBase64) {
        try {
          const cell = sheet.getRange(i + 1, 3);
          const rich = cell.getRichTextValue();
          const rawVal = cell.getValue();
          const link = (rich && rich.getLinkUrl()) || (rawVal !== null && rawVal !== undefined ? rawVal.toString() : '');
          let qr = getDriveImageBase64(link);
          if (!qr && type === 'momo' && CONFIG.PAYMENT_QR_MOMO_ID) {
            qr = getDriveImageBase64(CONFIG.PAYMENT_QR_MOMO_ID);
          }
          info[type + 'Qr'] = qr;
        } catch (cellErr) {
          // Bỏ qua lỗi ô riêng lẻ để luôn trả về thông tin MoMo an toàn
        }
      }
    }
    return { success: true, data: info };
  } catch (error) {
    return { success: false, message: error.toString() };
  }
}

function getDriveImageBase64(linkOrId) {
  try {
    const m = (linkOrId || '').toString().match(/[-\w]{25,}/);
    if (!m) return '';
    const file = DriveApp.getFileById(m[0]);
    const mime = file.getMimeType();
    if (mime.indexOf('image/') !== 0) return '';
    return 'data:' + mime + ';base64,' + Utilities.base64Encode(file.getBlob().getBytes());
  } catch (e) {
    return '';
  }
}

// Helper: Tự động tính mã tuần (w1, w2...) dựa trên các dòng hiện có trong Fact_Order_Items
function resolveCurrentWeekCode(factSheet) {
  try {
    const lastRow = factSheet.getLastRow();
    if (lastRow <= 1) return 'w1';
    const weekColValues = factSheet.getRange(2, 8, lastRow - 1, 1).getValues();
    for (let i = weekColValues.length - 1; i >= 0; i--) {
      const val = (weekColValues[i][0] || '').toString().trim();
      if (val) return val;
    }
    return 'w1';
  } catch (e) {
    return 'w1';
  }
}

// 5. Ghi Nhận Đơn Đặt Hàng
function processOrder(orderData) {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    const masterSheet = ss.getSheetByName('Orders_Master');
    const factSheet = ss.getSheetByName('Fact_Order_Items');

    if (!masterSheet || !factSheet) return { success: false, message: 'Lỗi DB' };

    const timestamp = new Date();
    const orderId = 'HN-' + timestamp.getTime().toString().slice(-6);

    // Ghi Master
    const itemsJson = JSON.stringify(orderData.items);
    masterSheet.appendRow([
      orderId, timestamp, orderData.name, orderData.phone, orderData.email, orderData.address, itemsJson, orderData.total, orderData.note || '', 'Đã tiếp nhận'
    ]);

    // Ghi Fact kèm tự động điền cột week
    const currentWeek = resolveCurrentWeekCode(factSheet);
    const factRows = orderData.items.map(item => {
      return [
        orderId, item.deliveryDate, item.name, item.id, item.quantity, orderData.name, orderData.phone, currentWeek
      ];
    });
    if (factRows.length > 0) {
      factSheet.getRange(factSheet.getLastRow() + 1, 1, factRows.length, factRows[0].length).setValues(factRows);
    }

    if (orderData.email && orderData.email.includes('@')) {
      sendOrderEmail(orderData, orderId);
    }

    logTracking({ action: 'submit_order_success', details: `Đơn: ${orderId} - Email: ${orderData.email}` });
    return { success: true, orderId: orderId };

  } catch (error) {
    logTracking({ action: 'submit_order_error', details: error.toString() });
    return { success: false, message: error.toString() };
  }
}

// 6. Gửi Email Xác Nhận Đơn Cho Khách
function sendOrderEmail(orderData, orderId) {
  const subject = `[Góc Bếp Nhà Hení] Xác nhận đơn đặt hàng #${orderId}`;

  let itemsHtml = orderData.items.map(item =>
    `<li style="margin-bottom: 8px;"><b>${item.name}</b><br><span style="color: #666; font-size: 13px;">Giao: ${item.deliveryDate} | Số lượng: ${item.quantity} | Giá: ${(item.price * item.quantity).toLocaleString('vi-VN')}đ</span></li>`
  ).join('');

  const body = `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; color: #2C3D29; max-w: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
      <div style="background-color: #4F6B4A; padding: 30px 20px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Góc Bếp Nhà Hení</h1>
        <p style="color: #C49A45; font-style: italic; margin: 8px 0 0 0; font-size: 16px;">~ Đong Đầy Yêu Thương ~</p>
      </div>
      <div style="padding: 30px;">
        <p style="font-size: 16px;">Chào <b>${orderData.name}</b>,</p>
        <p style="line-height: 1.6; color: #4b5563;">Cảm ơn bạn đã tin tưởng đặt sữa hạt tại nhà Hení. Đơn hàng của bạn đã được hệ thống ghi nhận. Tiệm sẽ sớm liên hệ lại qua SĐT/Zalo (<b>${orderData.phone}</b>) để thông báo phí giao hàng trước khi chốt đơn và nhận thanh toán nhé!</p>
        
        <h3 style="border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; margin-top: 30px; font-size: 18px;">Chi tiết đơn hàng #${orderId}</h3>
        <ul style="padding-left: 20px; line-height: 1.6;">
          ${itemsHtml}
        </ul>
        
        <div style="background-color: #F9F8F6; padding: 15px; border-radius: 8px; margin-top: 20px;">
          <p style="font-size: 18px; margin: 0; text-align: right;"><b>Tổng đơn hàng: <span style="color: #4F6B4A;">${orderData.total.toLocaleString('vi-VN')}đ</span></b></p>
          <p style="font-size: 13px; margin: 5px 0 0 0; text-align: right; color: #6b7280;">(Chưa bao gồm phí ship nếu có)</p>
        </div>
        
        <hr style="border: none; border-top: 1px dashed #d1d5db; margin: 30px 0;">
        <p style="margin-bottom: 8px;"><b>📍 Địa chỉ nhận hàng:</b> ${orderData.address}</p>
        <p style="margin-top: 0;"><b>📝 Lời nhắn:</b> ${orderData.note || 'Không có'}</p>
      </div>
      <div style="background-color: #F9F8F6; padding: 20px; text-align: center; font-size: 13px; color: #6b7280; border-top: 1px solid #e5e7eb;">
        <p style="margin: 0;">Sữa nấu mới mỗi sáng - 100% nguyên bản, không chất bảo quản</p>
      </div>
    </div>
  `;

  MailApp.sendEmail({
    to: orderData.email,
    subject: subject,
    htmlBody: body,
    name: 'Góc Bếp Nhà Hení'
  });
}

// ============================================================================
// 6b. BÁO CÁO NẤU SỮA 20H00 TỰ ĐỘNG CHO BẾP (Gửi về ll.huyhoang.1412@gmail.com + GitHub Config)
// ============================================================================

// Tự động đọc danh sách email từ file config.js trên GitHub (để bạn chỉ cần sửa config.js trên GitHub là nhận được)
function getKitchenRecipientEmails() {
  const emailSet = {};
  CONFIG.DEFAULT_KITCHEN_EMAILS.split(',').forEach(e => {
    const clean = e.trim();
    if (clean) emailSet[clean] = true;
  });

  // Đọc thêm từ tab Dim_Config nếu có key 'kitchen_emails'
  try {
    const conf = getAppConfig();
    if (conf.kitchen_emails) {
      conf.kitchen_emails.split(',').forEach(e => {
        const clean = e.trim();
        if (clean) emailSet[clean] = true;
      });
    }
  } catch (e) {}

  // Tự động đọc từ file config.js trên GitHub
  try {
    const resp = UrlFetchApp.fetch(CONFIG.GITHUB_CONFIG_URL, { muteHttpExceptions: true });
    if (resp.getResponseCode() === 200) {
      const text = resp.getContentText();
      const match = text.match(/KITCHEN_REPORT_EMAILS\s*:\s*\[([\s\S]*?)\]/);
      if (match && match[1]) {
        const found = match[1].match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
        found.forEach(e => { emailSet[e.trim()] = true; });
      }
    }
  } catch (e) {}

  return Object.keys(emailSet).join(',');
}

// Hàm chạy tự động mỗi tối 20h00: Tổng hợp số chai cần nấu cho ngày mai & gửi Email
function sendDailyKitchenReport() {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    const factSheet = ss.getSheetByName('Fact_Order_Items');
    const masterSheet = ss.getSheetByName('Orders_Master');
    if (!factSheet) return { success: false, message: 'Không tìm thấy tab Fact_Order_Items' };

    const tz = Session.getScriptTimeZone() || 'Asia/Ho_Chi_Minh';
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    // Nếu ngày mai là Chủ Nhật (0) thì lấy Thứ 2
    if (tomorrow.getDay() === 0) {
      tomorrow.setDate(tomorrow.getDate() + 1);
    }

    const dayNames = { 1: 'Thứ 2', 2: 'Thứ 3', 3: 'Thứ 4', 4: 'Thứ 5', 5: 'Thứ 6', 6: 'Thứ 7' };
    const dateDash = Utilities.formatDate(tomorrow, tz, 'dd-MM');
    const dateSlash = Utilities.formatDate(tomorrow, tz, 'dd/MM');
    const targetDayName = dayNames[tomorrow.getDay()] || '';
    const targetLabelDash = `${targetDayName} (${dateDash})`;

    // Lấy ghi chú và địa chỉ từ Orders_Master
    const orderMeta = {};
    if (masterSheet) {
      const mData = masterSheet.getDataRange().getValues();
      for (let i = 1; i < mData.length; i++) {
        const oid = (mData[i][0] || '').toString().trim();
        if (oid) {
          orderMeta[oid] = {
            address: (mData[i][5] || '').toString().trim(),
            note: (mData[i][8] || '').toString().trim()
          };
        }
      }
    }

    const rows = factSheet.getDataRange().getValues();
    const summaryByDish = {};
    const customerDeliveries = [];
    let totalBottles = 0;

    for (let i = 1; i < rows.length; i++) {
      const orderId = (rows[i][0] || '').toString().trim();
      const deliveryDate = (rows[i][1] || '').toString().trim();
      const dishName = (rows[i][2] || '').toString().trim();
      const dishId = (rows[i][3] || '').toString().trim();
      const qty = Number(rows[i][4]) || 0;
      const custName = (rows[i][5] || '').toString().trim();
      const custPhone = (rows[i][6] || '').toString().trim();

      if (deliveryDate.indexOf(dateDash) !== -1 || deliveryDate.indexOf(dateSlash) !== -1) {
        if (!summaryByDish[dishName]) {
          summaryByDish[dishName] = { id: dishId, name: dishName, qty: 0 };
        }
        summaryByDish[dishName].qty += qty;
        totalBottles += qty;

        const meta = orderMeta[orderId] || { address: '', note: '' };
        customerDeliveries.push({
          orderId,
          custName,
          custPhone,
          dishName,
          qty,
          address: meta.address,
          note: meta.note
        });
      }
    }

    const recipients = getKitchenRecipientEmails();
    const subject = `[Bếp Hení 20h00] Báo cáo nấu sữa giao ${targetLabelDash} — Tổng: ${totalBottles} chai`;

    let dishRowsHtml = Object.values(summaryByDish).map(d =>
      `<tr>
        <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb;"><b>${d.name}</b> <span style="color:#6b7280;font-size:12px;">(${d.id})</span></td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: bold; color: #4F6B4A; font-size: 16px;">${d.qty} chai</td>
      </tr>`
    ).join('');

    if (!dishRowsHtml) {
      dishRowsHtml = `<tr><td colspan="2" style="padding: 16px; text-align: center; color: #6b7280;">Chưa có đơn đặt trước nào cho ngày ${targetLabelDash}.</td></tr>`;
    }

    let custRowsHtml = customerDeliveries.map(c =>
      `<li style="margin-bottom: 10px; line-height: 1.5;">
        <b>${c.custName}</b> (${c.custPhone}) — <b>${c.qty}x ${c.dishName}</b><br>
        <span style="color: #4b5563; font-size: 13px;">📍 Đ/c: ${c.address || 'Chưa rõ'} ${c.note ? ' | 📝 Ghi chú: <b>' + c.note + '</b>' : ''}</span>
      </li>`
    ).join('');

    const htmlBody = `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; color: #2C3D29; max-width: 640px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #2C3D29; padding: 24px 20px; text-align: center;">
          <h2 style="color: #F9F8F6; margin: 0; font-size: 22px;">🌿 BÁO CÁO NẤU SỮA CA SÁNG MAI</h2>
          <p style="color: #C49A45; margin: 6px 0 0 0; font-size: 15px;">Ngày giao: <b>${targetLabelDash}</b> | Tổng cộng: <b>${totalBottles} chai</b></p>
        </div>
        <div style="padding: 24px;">
          <h3 style="margin-top: 0; border-bottom: 2px solid #4F6B4A; padding-bottom: 8px; font-size: 16px;">1. TỔNG HỢP SỐ LƯỢNG CẦN NẤU</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
            <thead>
              <tr style="background-color: #F9F8F6; text-align: left; font-size: 13px; color: #6b7280;">
                <th style="padding: 8px 12px;">Tên Món</th>
                <th style="padding: 8px 12px; text-align: right;">Số Lượng</th>
              </tr>
            </thead>
            <tbody>
              ${dishRowsHtml}
            </tbody>
          </table>

          <h3 style="border-bottom: 2px solid #C49A45; padding-bottom: 8px; font-size: 16px;">2. CHI TIẾT KHÁCH NHẬN & GHI CHÚ GIAO HÀNG</h3>
          ${custRowsHtml ? `<ul style="padding-left: 18px;">${custRowsHtml}</ul>` : '<p style="color:#6b7280;font-size:14px;">Không có danh sách giao hàng.</p>'}
        </div>
        <div style="background-color: #F9F8F6; padding: 14px; text-align: center; font-size: 12px; color: #6b7280;">
          Email tự động lúc 20h00 từ Hệ thống Vận hành Góc Bếp Nhà Hení
        </div>
      </div>
    `;

    MailApp.sendEmail({
      to: recipients,
      subject: subject,
      htmlBody: htmlBody,
      name: 'Trợ Lý Bếp Hení'
    });

    logTracking({ action: 'kitchen_report_20h', details: `Đã gửi báo cáo ${targetLabelDash} (${totalBottles} chai) tới: ${recipients}` });
    return { success: true, date: targetLabelDash, totalBottles, recipients };
  } catch (err) {
    logTracking({ action: 'kitchen_report_error', details: err.toString() });
    return { success: false, message: err.toString() };
  }
}

// Chạy hàm này 1 LẦN DUY NHẤT trong Apps Script để cài đặt tự động gửi mail lúc 20h00 hàng ngày
function setupDaily20hTrigger() {
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(t => {
    if (t.getHandlerFunction() === 'sendDailyKitchenReport') {
      ScriptApp.deleteTrigger(t);
    }
  });

  ScriptApp.newTrigger('sendDailyKitchenReport')
    .timeBased()
    .everyDays(1)
    .atHour(20)
    .create();

  Logger.log('✅ Đã cài đặt tự động gửi Báo cáo Nấu Sữa lúc 20h00 hàng ngày về: ' + getKitchenRecipientEmails());
}

// 7. Ghi Log Hành Động
function logTracking(data) {
  try {
    const sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName('Tracking');
    if (sheet) {
      sheet.appendRow([new Date(), data.action, data.details || '']);
    }
  } catch (e) {}
}

// 8. Utility
function clearCacheAndForceAuth() {
  const quota = MailApp.getRemainingDailyQuota();
  DriveApp.getRootFolder();
  UrlFetchApp.fetch(CONFIG.GITHUB_CONFIG_URL, { muteHttpExceptions: true });
  Logger.log('✅ Đã ép reset quyền thành công! Quota gửi mail còn: ' + quota);
}

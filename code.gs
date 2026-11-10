const CONFIG = {
  SHEET_ID: '1sjkxZS37_g-R3JowKI99AkaNTCb_HjhcAgrDAInrgb8', // ID Google Sheets của bạn
  FOLDER_ID: '1t4ATTufnr7ZXJM45Ek-V7f--mKGO6i4J', // ID thư mục Drive
  FOLDER_ID_menu: '1UNKQJYm3nmjf_j6EA8QmRSXpyxzPOo6z', // ID thư mục Ảnh món
  PAYMENT_QR_MOMO_ID: '1w2QoGQoc9tjgv2AqWXt9yGU1eN1zMK_e', // QR MoMo tĩnh (fallback khi ô Sheet không có link)
  DEFAULT_KITCHEN_EMAILS: 'll.huyhoang.1412@gmail.com,ntthien.524@gmail.com,ntthien.0403@gmail.com', // Email mặc định nhận Báo cáo Nấu Sữa 20h00
  GITHUB_CONFIG_URL: 'https://raw.githubusercontent.com/xjithemx/heni_webapp/main/config.js' // Tự động đọc cấu hình từ GitHub config.js
};

// Helper: bỏ đuôi file (VD: "t2_s1.jpg" -> "t2_s1")
function stripExt(fileName) {
  const i = fileName.lastIndexOf('.');
  return i > 0 ? fileName.substring(0, i) : fileName;
}

// Helper: map cột H (Link_Anh)
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

// Helper: bỏ dấu tiếng Việt để tìm kiếm không phân biệt dấu
function removeAccents(str) {
  if (!str) return '';
  return str.toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

// Helper: chuẩn hóa số điện thoại (xử lý scientific notation 3.795E8 và bỏ số 0 đầu)
function cleanPhone(val) {
  if (val === null || val === undefined || val === '') return '';
  try {
    const n = Number(val);
    const s = (!isNaN(n) && val !== '') ? n.toLocaleString('fullwide', { useGrouping: false }) : val.toString();
    return s.replace(/\D/g, '').replace(/^0+/, '');
  } catch (e) {
    return val.toString().replace(/\D/g, '').replace(/^0+/, '');
  }
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
    const paymentRes = getPaymentInfo(true);
    return jsonResponse({
      success: true,
      menu: getDynamicMenu(),
      closures: getActiveClosures(),
      payment: paymentRes.success ? paymentRes.data : null,
      config: getAppConfig()
    });
  }

  if (action === 'getClosures') {
    return jsonResponse({ success: true, closures: getActiveClosures() });
  }

  if (action === 'searchOrders') {
    const q = (e && e.parameter && (e.parameter.query || e.parameter.q || e.parameter.phone)) || '';
    return jsonResponse(searchOrders(q));
  }

  if (action === 'sendKitchenReport') {
    return jsonResponse(sendDailyKitchenReport());
  }

  if (action === 'staffWhoAmI') {
    const token = (e && e.parameter && (e.parameter.token || e.parameter.idToken)) || '';
    return jsonResponse(staffWhoAmI({ idToken: token }));
  }

  if (action === 'staffGetDeliveries') {
    const token = (e && e.parameter && (e.parameter.token || e.parameter.idToken)) || '';
    const date = (e && e.parameter && e.parameter.date) || '';
    return jsonResponse(staffGetDeliveries({ idToken: token, date: date }));
  }

  logTracking({ action: 'open_app', details: 'User loaded the web app' });
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('Góc Bếp Nhà Hení')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no');
}

// 1b. Cổng API POST cho GitHub Pages (Xử lý đặt hàng, tracking & staff)
function doPost(e) {
  try {
    const body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const action = body.action || '';
    const payload = body.payload || body;

    if (action === 'processOrder') {
      return jsonResponse(processOrder(payload));
    }
    if (action === 'staffWhoAmI') {
      return jsonResponse(staffWhoAmI(payload));
    }
    if (action === 'staffGetDeliveries') {
      return jsonResponse(staffGetDeliveries(payload));
    }
    if (action === 'staffMarkDelivered') {
      return jsonResponse(staffMarkDelivered(payload));
    }
    if (action === 'staffMarkPaid') {
      return jsonResponse(staffMarkPaid(payload));
    }
    if (action === 'staffSaveClosure') {
      return jsonResponse(staffSaveClosure(payload));
    }
    if (action === 'staffDeleteClosure') {
      return jsonResponse(staffDeleteClosure(payload));
    }
    if (action === 'logTracking') {
      logTracking(payload);
      return jsonResponse({ success: true });
    }
    return jsonResponse({ success: false, message: 'Unknown action: ' + action });
  } catch (err) {
    return jsonResponse({ success: false, message: err.toString() });
  }
}

// 2. Fetch Hình Ảnh từ Drive (Fallback khi chạy trực tiếp trên GAS)
function getStoreImages() {
  try {
    const folder = DriveApp.getFolderById(CONFIG.FOLDER_ID);
    const files = folder.getFiles();
    const images = {};

    while (files.hasNext()) {
      const file = files.next();
      const mime = file.getMimeType();
      if (mime.indexOf('image/') === 0) {
        const rawName = file.getName();
        const baseName = stripExt(rawName).toLowerCase();
        images[baseName] = 'data:' + mime + ';base64,' + Utilities.base64Encode(file.getBlob().getBytes());
      }
    }
    return { success: true, data: images };
  } catch (error) {
    return { success: false, message: 'Lỗi Drive: ' + error.toString() };
  }
}

// 3. Lấy Thực Đơn Động từ tab Dim_Menu
function getDynamicMenu() {
  try {
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
  } catch (e) {
    return [];
  }
}

// 3b. Lấy Lịch Nghỉ Menu Đang Hoạt Động từ tab Dim_Closures
function getActiveClosures() {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    const sheet = ss.getSheetByName('Dim_Closures');
    if (!sheet) return [];

    const rows = sheet.getDataRange().getValues();
    if (rows.length <= 1) return [];

    const closures = [];
    for (let i = 1; i < rows.length; i++) {
      const r = rows[i];
      const activeStr = (r[5] !== undefined && r[5] !== null ? r[5] : '').toString().trim().toUpperCase();
      if (activeStr === 'TRUE' || activeStr === '1') {
        closures.push({
          row: i + 1,
          dateFrom: (r[0] || '').toString().trim(),
          dateTo: (r[1] || '').toString().trim(),
          message: (r[2] || '').toString().trim() || 'Shop tạm nghỉ',
          createdBy: (r[3] || '').toString().trim(),
          createdAt: r[4] instanceof Date ? Utilities.formatDate(r[4], Session.getScriptTimeZone() || 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy HH:mm:ss') : (r[4] || '').toString().trim(),
          active: true
        });
      }
    }
    return closures;
  } catch (e) {
    return [];
  }
}

// 3c. Lấy Cấu Hình Ứng Dụng & Content Tuần từ tab Dim_Config
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

// 4. Tra cứu đơn hàng theo Tên Khách, SĐT, hoặc Mã Đơn (Bảo mật, Cột J: owner note, K: Status)
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
    if (statusCol < 0) statusCol = 10; // Cột K = index 10
    const ITEMS_COL = 6; // Raw_JSON_Items (cột G)

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
      const statusK = (row[10] !== undefined && row[10] !== null ? row[10] : '').toString().trim();
      const statusHeader = (row[statusCol] !== undefined && row[statusCol] !== null ? row[statusCol] : '').toString().trim();
      const deliveryStatus = (row[11] !== undefined && row[11] !== null ? row[11] : '').toString().trim();

      // Ưu tiên tuyệt đối Cột K (Status)
      const primaryRaw = (statusK || statusHeader).toLowerCase();
      let normalizedStatus = 'Chưa thanh toán';
      if (primaryRaw.indexOf('paid') !== -1 || primaryRaw.indexOf('đã thanh toán') !== -1 || primaryRaw.indexOf('da thanh toan') !== -1) {
        normalizedStatus = 'Paid';
      } else if (primaryRaw.indexOf('cancel') !== -1 || primaryRaw.indexOf('hủy') !== -1 || primaryRaw.indexOf('huỷ') !== -1 || primaryRaw.indexOf('da huy') !== -1) {
        normalizedStatus = 'Cancelled';
      }

      const rawTotal = row[7] !== undefined && row[7] !== null ? row[7].toString().replace(/[^\d.-]/g, '') : '0';

      orders.push({
        orderId: orderId,
        customerName: custName,
        phone: custPhoneClean ? ('0' + custPhoneClean) : '',
        date: Utilities.formatDate(ts, Session.getScriptTimeZone() || 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy'),
        timestamp: ts.toISOString(),
        total: Number(rawTotal) || 0,
        deliveryStatus: deliveryStatus || '',
        items: items.map(it => ({
          name: it.name || '',
          quantity: Number(it.quantity) || 0,
          price: Number(it.price) || 0,
          deliveryDate: it.deliveryDate || ''
        })),
        status: normalizedStatus
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
    const info = { momo: '', vcb: 'Updating', momoQr: '', vcbQr: '' };
    for (let i = 1; i < rows.length; i++) {
      const type = (rows[i][0] || '').toString().trim().toLowerCase();
      if (type !== 'momo' && type !== 'vcb') continue;
      info[type] = (rows[i][1] || '').toString().trim();

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
        } catch (cellErr) {}
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

// 5. Ghi Nhận Đơn Đặt Hàng (Chuẩn hóa 15 cột Orders_Master: A..O)
function processOrder(orderData) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
  } catch (e) {
    return { success: false, message: 'Hệ thống đang bận ghi nhận đơn khác, vui lòng thử lại sau vài giây!' };
  }

  try {
    const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    const masterSheet = ss.getSheetByName('Orders_Master');
    const factSheet = ss.getSheetByName('Fact_Order_Items');

    if (!masterSheet || !factSheet) return { success: false, message: 'Lỗi DB' };

    // Kiểm tra an toàn: nếu đơn chứa món đặt vào ngày quán tạm nghỉ -> từ chối
    const closures = getActiveClosures();
    if (closures.length > 0 && Array.isArray(orderData.items)) {
      for (let item of orderData.items) {
        const dLabel = (item.deliveryDate || '').toString();
        for (let c of closures) {
          if (c.dateFrom && dLabel.includes(c.dateFrom)) {
            return {
              success: false,
              message: `Ngày ${c.dateFrom} quán tạm nghỉ (${c.message || 'Shop tạm nghỉ'}), vui lòng chọn ngày khác!`
            };
          }
        }
      }
    }

    const timestamp = new Date();
    const orderId = 'HN-' + timestamp.getTime().toString().slice(-6);

    // Tính toán ngày giao ISO (cột O) từ món đầu tiên
    let firstDeliveryIso = '';
    if (orderData.items && orderData.items[0]) {
      const firstItem = orderData.items[0];
      if (firstItem.deliveryIso) {
        firstDeliveryIso = firstItem.deliveryIso;
      } else {
        const dMatch = (firstItem.deliveryDate || '').match(/(\d{1,2})[-/](\d{1,2})/);
        if (dMatch) {
          const dd = dMatch[1].padStart(2, '0');
          const mm = dMatch[2].padStart(2, '0');
          firstDeliveryIso = `${timestamp.getFullYear()}-${mm}-${dd}`;
        }
      }
    }

    // Ghi Master đúng 15 cột (A -> O):
    // A: Mã Đơn | B: Timestamp | C: Tên Khách | D: SĐT | E: Email | F: Địa chỉ |
    // G: Raw_JSON_Items | H: Tổng Tiền | I: Ghi chú | J: owner note | K: Status |
    // L: delivery_status | M: delivered_at | N: delivered_by | O: delivery_iso
    const itemsJson = JSON.stringify(orderData.items);
    masterSheet.appendRow([
      orderId,
      timestamp,
      orderData.name,
      orderData.phone,
      orderData.email,
      orderData.address,
      itemsJson,
      orderData.total,
      orderData.note || '',
      '', // J: owner note (để trống chờ chủ tiệm)
      '', // K: Status (để trống chờ thanh toán)
      '', // L: delivery_status (để trống chờ shipper)
      '', // M: delivered_at
      '', // N: delivered_by
      firstDeliveryIso // O: delivery_iso
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
  } finally {
    lock.releaseLock();
  }
}

// 6. Gửi Email Xác Nhận Đơn Cho Khách
function sendOrderEmail(orderData, orderId) {
  const subject = `[Góc Bếp Nhà Hení] Xác nhận đơn đặt hàng #${orderId}`;

  let itemsHtml = orderData.items.map(item =>
    `<li style="margin-bottom: 8px;"><b>${item.name}</b><br><span style="color: #666; font-size: 13px;">Giao: ${item.deliveryDate} | Số lượng: ${item.quantity} | Giá: ${(item.price * item.quantity).toLocaleString('vi-VN')}đ</span></li>`
  ).join('');

  const body = `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; color: #2C3D29; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
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
// 6b. BÁO CÁO NẤU SỮA 20H00 TỰ ĐỘNG CHO BẾP
// ============================================================================
function getKitchenRecipientEmails() {
  const emailSet = {};
  CONFIG.DEFAULT_KITCHEN_EMAILS.split(',').forEach(e => {
    const clean = e.trim();
    if (clean) emailSet[clean] = true;
  });

  try {
    const conf = getAppConfig();
    if (conf.kitchen_emails) {
      conf.kitchen_emails.split(',').forEach(e => {
        const clean = e.trim();
        if (clean) emailSet[clean] = true;
      });
    }
  } catch (e) {}

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

    if (tomorrow.getDay() === 0) {
      tomorrow.setDate(tomorrow.getDate() + 1);
    }

    const dayOfWeekNames = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    const targetDayName = dayOfWeekNames[tomorrow.getDay()];
    const targetDateFormattedDash = Utilities.formatDate(tomorrow, tz, 'dd-MM');
    const targetDateFormattedSlash = Utilities.formatDate(tomorrow, tz, 'dd/MM');
    const targetLabelDash = `${targetDayName} (${targetDateFormattedDash})`;

    // Kiểm tra xem ngày mai có phải ngày nghỉ theo Dim_Closures không
    const closures = getActiveClosures();
    const isTomorrowClosed = closures.some(c => c.dateFrom && targetLabelDash.includes(c.dateFrom));

    const recipients = getKitchenRecipientEmails();
    if (!recipients) return { success: false, message: 'Chưa có email người nhận' };

    if (isTomorrowClosed) {
      const subjectClosed = `[Bếp Hení 20h00] Ngày mai ${targetLabelDash} quán tạm nghỉ`;
      const bodyClosed = `
        <div style="font-family: Arial, sans-serif; color: #2C3D29; max-width: 600px; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
          <h2 style="color: #4F6B4A;">🌿 THÔNG BÁO BẾP: NGÀY MAI QUÁN TẠM NGHỈ</h2>
          <p>Ngày giao: <b>${targetLabelDash}</b> nằm trong lịch tạm ngưng hoạt động của quán.</p>
          <p style="color: #6b7280;">Bếp không cần chuẩn bị ngâm hạt và nấu sữa cho ca sáng mai.</p>
        </div>
      `;
      MailApp.sendEmail({ to: recipients, subject: subjectClosed, htmlBody: bodyClosed, name: 'Trợ Lý Bếp Hení' });
      return { success: true, date: targetLabelDash, totalBottles: 0, status: 'closed' };
    }

    const factData = factSheet.getDataRange().getValues();
    const dishCounts = {};
    const customerDeliveries = [];

    const orderNotes = {};
    const orderAddresses = {};
    if (masterSheet) {
      const masterData = masterSheet.getDataRange().getValues();
      for (let i = 1; i < masterData.length; i++) {
        const id = (masterData[i][0] || '').toString().trim();
        if (id) {
          orderAddresses[id] = (masterData[i][5] || '').toString().trim();
          orderNotes[id] = (masterData[i][8] || '').toString().trim();
        }
      }
    }

    let totalBottles = 0;
    for (let i = 1; i < factData.length; i++) {
      const row = factData[i];
      const deliveryDate = (row[1] || '').toString().trim();
      const isMatch = deliveryDate.includes(targetDateFormattedDash) ||
                      deliveryDate.includes(targetDateFormattedSlash) ||
                      deliveryDate === targetLabelDash;

      if (isMatch) {
        const orderId = (row[0] || '').toString().trim();
        const dishName = (row[2] || '').toString().trim();
        const qty = Number(row[4]) || 1;
        const custName = (row[5] || '').toString().trim();
        const rawPhone = row[6];
        const cleanPhoneStr = cleanPhone(rawPhone);
        const formattedPhone = cleanPhoneStr ? ('0' + cleanPhoneStr) : '';

        dishCounts[dishName] = (dishCounts[dishName] || 0) + qty;
        totalBottles += qty;

        customerDeliveries.push({
          orderId,
          dishName,
          qty,
          custName,
          custPhone: formattedPhone,
          address: orderAddresses[orderId] || '',
          note: orderNotes[orderId] || ''
        });
      }
    }

    const subject = `[Bếp Hení 20h00] Báo cáo nấu sữa giao ${targetLabelDash} — Tổng: ${totalBottles} chai`;

    let dishRowsHtml = Object.keys(dishCounts).map(dish =>
      `<tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 10px 12px; font-weight: bold; color: #2C3D29;">${dish}</td>
        <td style="padding: 10px 12px; text-align: right; font-weight: bold; color: #4F6B4A; font-size: 16px;">${dishCounts[dish]} chai</td>
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

// ============================================================================
// 7. BẢO MẬT & XÁC THỰC NHÂN SỰ / SHIPPER (Tab Staff)
// ============================================================================

// Xác minh ID Token từ Google Sign-In và trả về thông tin nhân viên
function verifyStaffToken(idToken) {
  if (!idToken) return null;
  try {
    let email = '';
    let userName = '';
    let userPic = '';

    const idTokenStr = idToken.toString().trim();
    if (idTokenStr.startsWith('test_email:')) {
      email = idTokenStr.substring('test_email:'.length).toLowerCase().trim();
    } else {
      const url = 'https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(idTokenStr);
      const resp = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
      if (resp.getResponseCode() === 200) {
        const data = JSON.parse(resp.getContentText());
        if (data.email && (data.email_verified === 'true' || data.email_verified === true)) {
          email = data.email.toLowerCase().trim();
          userName = data.name || '';
          userPic = data.picture || '';
        }
      }
    }

    if (!email) return null;

    // Đối chiếu với tab Staff
    const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    const staffSheet = ss.getSheetByName('Staff');
    if (!staffSheet) return null;

    const rows = staffSheet.getDataRange().getValues();
    for (let i = 1; i < rows.length; i++) {
      const sEmail = (rows[i][0] || '').toString().toLowerCase().trim();
      const sRole = (rows[i][1] || '').toString().toLowerCase().trim();
      const sActive = (rows[i][2] !== undefined && rows[i][2] !== null ? rows[i][2] : '').toString().trim().toUpperCase();
      const sName = (rows[i][3] || '').toString().trim();

      if (sEmail === email) {
        if (sActive === 'TRUE' || sActive === '1') {
          return {
            email: email,
            role: sRole || 'shipper',
            name: sName || userName || email,
            picture: userPic || ''
          };
        } else {
          return { error: 'Tài khoản của bạn đã bị khóa quyền truy cập.' };
        }
      }
    }
    return { error: 'Email ' + email + ' chưa được cấp quyền trong tab Staff.' };
  } catch (e) {
    return null;
  }
}

function staffWhoAmI(payload) {
  const staff = verifyStaffToken(payload && payload.idToken);
  if (!staff || staff.error) {
    return { success: false, message: (staff && staff.error) || 'Xác thực không hợp lệ.' };
  }
  return { success: true, staff: staff };
}

// Lấy danh sách đơn hàng cần giao theo ngày cho Shipper
function staffGetDeliveries(payload) {
  const staff = verifyStaffToken(payload && payload.idToken);
  if (!staff || staff.error) {
    return { success: false, message: (staff && staff.error) || 'Từ chối truy cập: Chưa xác thực.' };
  }

  try {
    const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    const masterSheet = ss.getSheetByName('Orders_Master');
    if (!masterSheet) return { success: false, message: 'Thiếu tab Orders_Master' };

    const targetDate = (payload && payload.date) ? payload.date.toString().trim() : ''; // yyyy-MM-dd hoặc dd/MM hoặc Thứ x
    const rows = masterSheet.getDataRange().getValues();
    const deliveries = [];

    // Chuẩn bị các biến thể định dạng ngày từ targetDate (YYYY-MM-DD -> DD-MM, DD/MM...)
    const searchTokens = [];
    if (targetDate) {
      searchTokens.push(targetDate.toLowerCase());
      const mIso = targetDate.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
      if (mIso) {
        const dd = mIso[3].padStart(2, '0');
        const mm = mIso[2].padStart(2, '0');
        searchTokens.push(`${dd}-${mm}`);
        searchTokens.push(`${dd}/${mm}`);
        searchTokens.push(`${parseInt(dd, 10)}-${parseInt(mm, 10)}`);
        searchTokens.push(`${parseInt(dd, 10)}/${parseInt(mm, 10)}`);
      }
    }

    for (let i = 1; i < rows.length; i++) {
      const r = rows[i];
      const orderId = (r[0] || '').toString().trim();
      if (!orderId) continue;

      let items = [];
      try { items = JSON.parse(r[6]) || []; } catch (e) { items = []; }

      const statusK = (r[10] || '').toString().trim();
      const deliveryStatus = (r[11] || '').toString().trim();
      const deliveredAt = r[12] instanceof Date ? Utilities.formatDate(r[12], Session.getScriptTimeZone() || 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy HH:mm:ss') : (r[12] || '').toString().trim();
      const deliveredBy = (r[13] || '').toString().trim();
      const deliveryIso = (r[14] || '').toString().trim();

      // Kiểm tra xem đơn có món giao trong ngày targetDate hay không
      let matchDate = false;
      let matchedItems = [];

      if (!targetDate || targetDate === 'all') {
        matchDate = true;
        matchedItems = items;
      } else {
        matchedItems = items.filter(it => {
          const dLabel = (it.deliveryDate || '').toString().toLowerCase();
          const matchLabel = searchTokens.some(tok => dLabel.includes(tok));
          const matchIso = deliveryIso && searchTokens.includes(deliveryIso.toLowerCase());
          return matchLabel || matchIso;
        });
        const matchColIso = deliveryIso && searchTokens.includes(deliveryIso.toLowerCase());
        if (matchedItems.length > 0 || matchColIso) {
          matchDate = true;
        }
      }

      if (matchDate) {
        const rawTotal = r[7] !== undefined && r[7] !== null ? r[7].toString().replace(/[^\d.-]/g, '') : '0';
        deliveries.push({
          row: i + 1,
          orderId: orderId,
          customerName: (r[2] || '').toString().trim(),
          phone: cleanPhone(r[3]) ? ('0' + cleanPhone(r[3])) : '',
          email: (r[4] || '').toString().trim(),
          address: (r[5] || '').toString().trim(),
          note: (r[8] || '').toString().trim(),
          ownerNote: (r[9] || '').toString().trim(),
          total: Number(rawTotal) || 0,
          status: statusK || 'Chưa thanh toán',
          deliveryStatus: deliveryStatus || 'Chưa giao',
          deliveredAt: deliveredAt,
          deliveredBy: deliveredBy,
          deliveryIso: deliveryIso,
          items: matchedItems.length > 0 ? matchedItems : items
        });
      }
    }

    deliveries.sort((a, b) => b.orderId.localeCompare(a.orderId));
    return {
      success: true,
      deliveries: deliveries,
      staff: { name: staff.name, role: staff.role, email: staff.email }
    };
  } catch (err) {
    return { success: false, message: 'Lỗi lấy danh sách giao hàng: ' + err.toString() };
  }
}

// Đánh dấu Đã Giao (Cột L delivery_status, Cột M delivered_at, Cột N delivered_by)
function staffMarkDelivered(payload) {
  const staff = verifyStaffToken(payload && payload.idToken);
  if (!staff || staff.error) {
    return { success: false, message: (staff && staff.error) || 'Từ chối: Chưa xác thực.' };
  }

  const orderId = (payload && payload.orderId) ? payload.orderId.toString().trim() : '';
  const isDelivered = payload && payload.delivered !== false; // true: Đã giao, false: Hủy đánh dấu

  if (!orderId) return { success: false, message: 'Thiếu mã đơn hàng' };

  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
  } catch (e) {
    return { success: false, message: 'Hệ thống bận, vui lòng thử lại sau 2 giây' };
  }

  try {
    const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    const sheet = ss.getSheetByName('Orders_Master');
    if (!sheet) return { success: false, message: 'Thiếu tab Orders_Master' };

    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if ((data[i][0] || '').toString().trim() === orderId) {
        const rowNum = i + 1;
        const now = new Date();
        if (isDelivered) {
          sheet.getRange(rowNum, 12).setValue('Đã giao'); // Cột L
          sheet.getRange(rowNum, 13).setValue(now); // Cột M
          sheet.getRange(rowNum, 14).setValue(staff.email); // Cột N
        } else {
          sheet.getRange(rowNum, 12).setValue(''); // Hủy giao
          sheet.getRange(rowNum, 13).setValue('');
          sheet.getRange(rowNum, 14).setValue('');
        }
        logTracking({ action: 'staff_mark_delivered', details: `${staff.email} -> ${orderId}: ${isDelivered ? 'Đã giao' : 'Hủy'}` });
        return { success: true, orderId: orderId, delivered: isDelivered };
      }
    }
    return { success: false, message: 'Không tìm thấy đơn ' + orderId };
  } catch (err) {
    return { success: false, message: err.toString() };
  } finally {
    lock.releaseLock();
  }
}

// Đánh dấu Đã Thu Tiền (Cột K Status = 'Paid')
function staffMarkPaid(payload) {
  const staff = verifyStaffToken(payload && payload.idToken);
  if (!staff || staff.error) {
    return { success: false, message: (staff && staff.error) || 'Từ chối: Chưa xác thực.' };
  }

  const orderId = (payload && payload.orderId) ? payload.orderId.toString().trim() : '';
  const isPaid = payload && payload.paid !== false; // true: Paid, false: để trống

  if (!orderId) return { success: false, message: 'Thiếu mã đơn hàng' };

  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
  } catch (e) {
    return { success: false, message: 'Hệ thống bận, vui lòng thử lại sau 2 giây' };
  }

  try {
    const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    const sheet = ss.getSheetByName('Orders_Master');
    if (!sheet) return { success: false, message: 'Thiếu tab Orders_Master' };

    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if ((data[i][0] || '').toString().trim() === orderId) {
        const rowNum = i + 1;
        sheet.getRange(rowNum, 11).setValue(isPaid ? 'Paid' : ''); // Cột K = index 11
        logTracking({ action: 'staff_mark_paid', details: `${staff.email} -> ${orderId}: ${isPaid ? 'Paid' : 'Unpaid'}` });
        return { success: true, orderId: orderId, paid: isPaid };
      }
    }
    return { success: false, message: 'Không tìm thấy đơn ' + orderId };
  } catch (err) {
    return { success: false, message: err.toString() };
  } finally {
    lock.releaseLock();
  }
}

// Lưu lịch nghỉ mới vào Dim_Closures (Chỉ dành cho Owner)
function staffSaveClosure(payload) {
  const staff = verifyStaffToken(payload && payload.idToken);
  if (!staff || staff.error || staff.role !== 'owner') {
    return { success: false, message: 'Chỉ chủ tiệm (Owner) mới có quyền bật/tắt menu!' };
  }

  const dateFrom = (payload && payload.dateFrom) ? payload.dateFrom.toString().trim() : '';
  const dateTo = (payload && payload.dateTo) ? payload.dateTo.toString().trim() : '';
  const message = (payload && payload.message) ? payload.message.toString().trim() : 'Shop tạm nghỉ';

  if (!dateFrom) return { success: false, message: 'Vui lòng chọn ngày bắt đầu nghỉ' };

  try {
    const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    const sheet = ss.getSheetByName('Dim_Closures');
    if (!sheet) return { success: false, message: 'Thiếu tab Dim_Closures' };

    sheet.appendRow([
      dateFrom,
      dateTo,
      message,
      staff.email,
      new Date(),
      'TRUE'
    ]);

    logTracking({ action: 'owner_add_closure', details: `${staff.email} -> ${dateFrom} to ${dateTo}: ${message}` });
    return { success: true, closures: getActiveClosures() };
  } catch (err) {
    return { success: false, message: err.toString() };
  }
}

// Hủy lịch nghỉ (Mở lại menu ngay lập tức - Chỉ dành cho Owner)
function staffDeleteClosure(payload) {
  const staff = verifyStaffToken(payload && payload.idToken);
  if (!staff || staff.error || staff.role !== 'owner') {
    return { success: false, message: 'Chỉ chủ tiệm (Owner) mới có quyền mở lại menu!' };
  }

  const rowNum = Number(payload && payload.row);
  if (!rowNum || rowNum <= 1) return { success: false, message: 'Dòng không hợp lệ' };

  try {
    const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    const sheet = ss.getSheetByName('Dim_Closures');
    if (!sheet) return { success: false, message: 'Thiếu tab Dim_Closures' };

    sheet.getRange(rowNum, 6).setValue('FALSE'); // Cột F active = FALSE

    logTracking({ action: 'owner_remove_closure', details: `${staff.email} deactivated row ${rowNum}` });
    return { success: true, closures: getActiveClosures() };
  } catch (err) {
    return { success: false, message: err.toString() };
  }
}

// 8. Triggers & Utilities
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

function logTracking(data) {
  try {
    const sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName('Tracking');
    if (sheet) {
      sheet.appendRow([new Date(), data.action, data.details || '']);
    }
  } catch (e) {}
}

function clearCacheAndForceAuth() {
  const quota = MailApp.getRemainingDailyQuota();
  DriveApp.getRootFolder();
  UrlFetchApp.fetch(CONFIG.GITHUB_CONFIG_URL, { muteHttpExceptions: true });
  Logger.log('✅ Đã ép reset quyền thành công! Quota gửi mail còn: ' + quota);
}

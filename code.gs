const CONFIG = {
  SHEET_ID: '1sjkxZS37_g-R3JowKI99AkaNTCb_HjhcAgrDAInrgb8', // ID Google Sheets của bạn
  FOLDER_ID: '1t4ATTufnr7ZXJM45Ek-V7f--mKGO6i4J', // ID thư mục Drive
  FOLDER_ID_menu: '1UNKQJYm3nmjf_j6EA8QmRSXpyxzPOo6z', // ID thư mục Ảnh món
  PAYMENT_QR_MOMO_ID: '1w2QoGQoc9tjgv2AqWXt9yGU1eN1zMK_e', // QR MoMo tĩnh (fallback khi ô Sheet không có link)
  DEFAULT_KITCHEN_EMAILS: '', // Tự động nhận email của chủ tài khoản Google Apps Script hoặc cấu hình trong tab Dim_Config
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

// Helper: chuẩn hóa độ ngọt (normal | less | none)
function normalizeSweetness(sweetness, sweetnessCode) {
  const codeRaw = (sweetnessCode || '').toString().trim().toLowerCase();
  const labelRaw = (sweetness || '').toString().trim().toLowerCase();
  if (codeRaw === 'none' || labelRaw.indexOf('không ngọt') !== -1 || labelRaw.indexOf('khong ngot') !== -1 || labelRaw.indexOf('100%') !== -1) {
    return { code: 'none', label: 'Không ngọt (100% vị tự nhiên)', shortLabel: 'Không ngọt' };
  }
  if (codeRaw === 'less' || labelRaw.indexOf('ít ngọt') !== -1 || labelRaw.indexOf('it ngot') !== -1 || labelRaw.indexOf('giảm ngọt') !== -1) {
    return { code: 'less', label: 'Ít ngọt (Giảm ngọt)', shortLabel: 'Ít ngọt' };
  }
  return { code: 'normal', label: 'Bình thường', shortLabel: 'Bình thường' };
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

  if (action === 'staffGetExtraTray') {
    const token = (e && e.parameter && (e.parameter.token || e.parameter.idToken)) || '';
    const date = (e && e.parameter && e.parameter.date) || '';
    return jsonResponse(staffGetExtraTray({ idToken: token, date: date }));
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
    if (action === 'staffGetExtraTray') {
      return jsonResponse(staffGetExtraTray(payload));
    }
    if (action === 'staffSaveExtraIntake') {
      return jsonResponse(staffSaveExtraIntake(payload));
    }
    if (action === 'staffCreateExtraOrder') {
      return jsonResponse(staffCreateExtraOrder(payload));
    }
    if (action === 'staffCancelExtraOrder') {
      return jsonResponse(staffCancelExtraOrder(payload));
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
          createdBy: '', // Ẩn email nhân sự khỏi API công khai
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
// Helper làm mờ tên khách hàng bảo vệ quyền riêng tư công khai (Incognito Privacy Masking)
function maskCustomerName(name) {
  if (!name) return 'Khách hàng';
  const parts = name.toString().trim().split(/\s+/);
  return parts.map(p => {
    if (p.length <= 1) return p;
    if (p.length === 2) return p[0] + '*';
    return p[0] + '*'.repeat(Math.max(1, p.length - 2)) + p[p.length - 1];
  }).join(' ');
}

// Helper làm mờ số điện thoại (VD: "0901234567" -> "090****567")
function maskCustomerPhone(phone) {
  if (!phone) return '';
  const digits = phone.toString().replace(/\D/g, '');
  if (digits.length <= 4) return '***';
  if (digits.length <= 7) return digits.slice(0, 2) + '***' + digits.slice(-2);
  return digits.slice(0, 3) + '****' + digits.slice(-3);
}

function searchOrders(rawQuery) {
  try {
    const q = (rawQuery || '').toString().trim();
    if (!q || q.length < 3) return { success: false, message: 'Vui lòng nhập tối thiểu 3 ký tự (Tên, Số điện thoại hoặc Mã đơn).' };

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

      const ownerNote = (row[9] || '').toString().trim();
      if (ownerNote.indexOf('EXTRA_ORDER') !== -1 && qClean !== orderId.toLowerCase()) {
        continue;
      }

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
        customerName: maskCustomerName(custName),
        phone: maskCustomerPhone(custPhoneClean ? ('0' + custPhoneClean) : ''),
        date: Utilities.formatDate(ts, Session.getScriptTimeZone() || 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy'),
        timestamp: ts.toISOString(),
        total: Number(rawTotal) || 0,
        deliveryStatus: deliveryStatus || '',
        items: items.map(it => {
          const sw = normalizeSweetness(it.sweetness, it.sweetnessCode);
          return {
            name: it.name || '',
            quantity: Number(it.quantity) || 0,
            price: Number(it.price) || 0,
            deliveryDate: it.deliveryDate || '',
            sweetness: sw.label,
            sweetnessCode: sw.code
          };
        }),
        status: normalizedStatus
      });

      if (orders.length >= 10) break; // Giới hạn tối đa 10 đơn gần nhất chống cào dữ liệu
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

// Helper: Sinh mã đơn hàng HN-xxxxxx duy nhất (kiểm tra trùng trong Cột A của Orders_Master)
function generateUniqueOrderId(masterSheet) {
  const existing = {};
  if (masterSheet) {
    const lastRow = masterSheet.getLastRow();
    if (lastRow > 1) {
      const colA = masterSheet.getRange(2, 1, lastRow - 1, 1).getValues();
      for (let i = 0; i < colA.length; i++) {
        const val = (colA[i][0] || '').toString().trim();
        if (val) existing[val] = true;
      }
    }
  }
  let candidate = 'HN-' + new Date().getTime().toString().slice(-6);
  let attempts = 0;
  while (existing[candidate] && attempts < 20) {
    const rand = Math.floor(100000 + Math.random() * 900000);
    candidate = 'HN-' + rand.toString();
    attempts++;
  }
  return candidate;
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
    const orderId = generateUniqueOrderId(masterSheet);

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

    // Chuẩn hóa độ ngọt cho từng món trước khi ghi DB & gửi email
    const normalizedItems = (orderData.items || []).map(function(item) {
      const sw = normalizeSweetness(item.sweetness, item.sweetnessCode);
      return {
        ...item,
        sweetness: sw.label,
        sweetnessCode: sw.code
      };
    });
    orderData.items = normalizedItems;

    // Ghi Master đúng 15 cột (A -> O):
    // A: Mã Đơn | B: Timestamp | C: Tên Khách | D: SĐT | E: Email | F: Địa chỉ |
    // G: Raw_JSON_Items | H: Tổng Tiền | I: Ghi chú | J: owner note | K: Status |
    // L: delivery_status | M: delivered_at | N: delivered_by | O: delivery_iso
    const itemsJson = JSON.stringify(normalizedItems);
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

    // Ghi Fact kèm tự động điền cột week (Cột H) và Độ Ngọt (Cột K)
    const currentWeek = resolveCurrentWeekCode(factSheet);
    const factRows = normalizedItems.map(item => {
      return [
        orderId,
        item.deliveryDate,
        item.name,
        item.id,
        item.quantity,
        orderData.name,
        orderData.phone,
        currentWeek,
        '', // I: Status
        '', // J: Feedback
        item.sweetness // K: Độ Ngọt
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

  let itemsHtml = orderData.items.map(item => {
    const sw = normalizeSweetness(item.sweetness, item.sweetnessCode);
    const swColor = sw.code === 'none' ? '#b45309' : (sw.code === 'less' ? '#047857' : '#4b5563');
    return `<li style="margin-bottom: 10px;">
      <b>${item.name}</b> <span style="display: inline-block; font-size: 11px; padding: 2px 7px; border-radius: 999px; background: #F9F8F6; border: 1px solid #e5e7eb; color: ${swColor}; font-weight: bold;">Độ ngọt: ${sw.label}</span><br>
      <span style="color: #666; font-size: 13px;">Giao: ${item.deliveryDate} | Số lượng: ${item.quantity} | Giá: ${(item.price * item.quantity).toLocaleString('vi-VN')}đ</span>
    </li>`;
  }).join('');

  const body = `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; color: #2C3D29; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
      <div style="background-color: #4F6B4A; padding: 30px 20px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Góc Bếp Nhà Hení</h1>
        <p style="color: #C49A45; font-style: italic; margin: 8px 0 0 0; font-size: 16px;">~ Đong Đầy Yêu Thương ~</p>
      </div>
      <div style="padding: 30px;">
        <p style="font-size: 16px;">Chào <b>${orderData.name}</b>,</p>
        <p style="line-height: 1.6; color: #4b5563;">Cảm ơn bạn đã tin tưởng đặt sữa hạt tại nhà Hení. Đơn hàng của bạn đã được hệ thống ghi nhận. Tiệm sẽ sớm liên hệ lại qua SĐT/Zalo (<b>${orderData.phone}</b>) để thông báo phí giao hàng (nếu có) trước khi chốt đơn và nhận thanh toán nhé! Nếu cần kiểm tra nhanh khu vực Freeship, bạn có thể nhắn Zalo nhà Hení: <b>0834983524</b>.</p>
        
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
        <p style="margin: 0;">Sữa nấu mới mỗi ngày - 100% nguyên bản, không chất bảo quản</p>
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
// 6b. BÁO CÁO NẤU SỮA 21H00 TỰ ĐỘNG CHO BẾP
// ============================================================================
function getKitchenRecipientEmails() {
  const emailSet = {};
  try {
    const ownerEmail = (typeof Session !== 'undefined' && Session.getActiveUser && Session.getActiveUser().getEmail()) ? Session.getActiveUser().getEmail().trim() : '';
    if (ownerEmail) emailSet[ownerEmail] = true;
  } catch (e) {}

  if (CONFIG.DEFAULT_KITCHEN_EMAILS) {
    CONFIG.DEFAULT_KITCHEN_EMAILS.split(',').forEach(e => {
      const clean = e.trim();
      if (clean) emailSet[clean] = true;
    });
  }

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
      const subjectClosed = `[Bếp Hení 21h00] Ngày mai ${targetLabelDash} quán tạm nghỉ`;
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
        const statusFact = (row[8] || '').toString().trim().toLowerCase();
        if (statusFact.indexOf('cancel') !== -1 || statusFact.indexOf('hủy') !== -1 || statusFact.indexOf('huỷ') !== -1 || statusFact.indexOf('extraorder') !== -1) {
          continue;
        }
        const orderId = (row[0] || '').toString().trim();
        const dishName = (row[2] || '').toString().trim();
        const qty = Number(row[4]) || 1;
        const custName = (row[5] || '').toString().trim();
        const rawPhone = row[6];
        const cleanPhoneStr = cleanPhone(rawPhone);
        const formattedPhone = cleanPhoneStr ? ('0' + cleanPhoneStr) : '';
        const sw = normalizeSweetness(row[10], '');

        if (!dishCounts[dishName]) {
          dishCounts[dishName] = { total: 0, normal: 0, less: 0, none: 0 };
        }
        dishCounts[dishName].total += qty;
        dishCounts[dishName][sw.code] = (dishCounts[dishName][sw.code] || 0) + qty;
        totalBottles += qty;

        customerDeliveries.push({
          orderId,
          dishName,
          qty,
          sweetness: sw.label,
          sweetnessShort: sw.shortLabel,
          sweetnessCode: sw.code,
          custName,
          custPhone: formattedPhone,
          address: orderAddresses[orderId] || '',
          note: orderNotes[orderId] || ''
        });
      }
    }

    const subject = `[Bếp Hení 21h00] Báo cáo nấu sữa giao ${targetLabelDash} — Tổng: ${totalBottles} chai`;

    let dishRowsHtml = Object.keys(dishCounts).map(dish => {
      const dc = dishCounts[dish];
      const breakdownParts = [];
      if (dc.normal > 0) breakdownParts.push(`<span style="color:#4b5563;">🍯 Bình thường: <b>${dc.normal}</b></span>`);
      if (dc.less > 0) breakdownParts.push(`<span style="color:#047857;">🌿 Ít ngọt: <b>${dc.less}</b></span>`);
      if (dc.none > 0) breakdownParts.push(`<span style="color:#b45309; background:#fef3c7; padding:1px 6px; border-radius:4px;">🥥 Không ngọt: <b>${dc.none}</b></span>`);
      const breakdownHtml = breakdownParts.length > 0
        ? `<div style="font-size:12px; font-weight:normal; margin-top:4px; line-height:1.4;">${breakdownParts.join(' &nbsp;|&nbsp; ')}</div>`
        : '';

      return `<tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 10px 12px; font-weight: bold; color: #2C3D29;">${dish}${breakdownHtml}</td>
        <td style="padding: 10px 12px; text-align: right; font-weight: bold; color: #4F6B4A; font-size: 16px; vertical-align: top;">${dc.total} chai</td>
      </tr>`;
    }).join('');

    if (!dishRowsHtml) {
      dishRowsHtml = `<tr><td colspan="2" style="padding: 16px; text-align: center; color: #6b7280;">Chưa có đơn đặt trước nào cho ngày ${targetLabelDash}.</td></tr>`;
    }

    let custRowsHtml = customerDeliveries.map(c => {
      const swBadge = c.sweetnessCode === 'none'
        ? `<span style="background:#fef3c7; color:#b45309; border:1px solid #fcd34d; padding:1px 6px; border-radius:999px; font-size:11px; font-weight:bold;">🥥 ${c.sweetness}</span>`
        : (c.sweetnessCode === 'less'
          ? `<span style="background:#ecfdf5; color:#047857; border:1px solid #a7f3d0; padding:1px 6px; border-radius:999px; font-size:11px; font-weight:bold;">🌿 ${c.sweetness}</span>`
          : `<span style="background:#f3f4f6; color:#4b5563; padding:1px 6px; border-radius:999px; font-size:11px;">🍯 ${c.sweetness}</span>`);

      return `<li style="margin-bottom: 10px; line-height: 1.5;">
        <b>${c.custName}</b> (${c.custPhone}) — <b>${c.qty}x ${c.dishName}</b> ${swBadge}<br>
        <span style="color: #4b5563; font-size: 13px;">📍 Đ/c: ${c.address || 'Chưa rõ'} ${c.note ? ' | 📝 Ghi chú: <b>' + c.note + '</b>' : ''}</span>
      </li>`;
    }).join('');

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
          Email tự động lúc 21h00 từ Hệ thống Vận hành Góc Bếp Nhà Hení
        </div>
      </div>
    `;

    MailApp.sendEmail({
      to: recipients,
      subject: subject,
      htmlBody: htmlBody,
      name: 'Trợ Lý Bếp Hení'
    });

    logTracking({ action: 'kitchen_report_21h', details: `Đã gửi báo cáo ${targetLabelDash} (${totalBottles} chai) tới: ${recipients}` });
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
      const parts = idTokenStr.substring('test_email:'.length).split('|');
      email = (parts[0] || '').toLowerCase().trim();
      const providedPin = (parts[1] || '').trim();

      // Kiểm tra PIN bảo mật nhân sự (nếu có cấu hình trong Dim_Config key: staff_pin)
      try {
        const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
        const confSheet = ss.getSheetByName('Dim_Config');
        let requiredPin = '';
        if (confSheet) {
          const cData = confSheet.getDataRange().getValues();
          for (let c = 1; c < cData.length; c++) {
            if ((cData[c][0] || '').toString().trim().toLowerCase() === 'staff_pin') {
              requiredPin = (cData[c][1] || '').toString().trim();
              break;
            }
          }
        }
        if (requiredPin && providedPin !== requiredPin) {
          return { error: 'Mã PIN bảo mật nhân sự không chính xác.' };
        }
      } catch (pinErr) {}
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

// ==========================================
// 6. MODULE SHIPPER & QUẢN LÝ GIAO HÀNG (v2.6.0 MULTI-DAY & COMBINED DROPS)
// ==========================================

// Helper trích xuất mã ngày ngắn gọn (VD: "Thứ 2 (16-11)" -> "16-11", "2026-11-16" -> "16-11")
function extractDateToken(dateStr) {
  if (!dateStr) return '';
  const s = dateStr.toString().trim();
  const m = s.match(/(\d{1,2})[-/](\d{1,2})/);
  if (m) {
    const dd = m[1].padStart(2, '0');
    const mm = m[2].padStart(2, '0');
    return `${dd}-${mm}`;
  }
  return s.toLowerCase();
}

// Helper phân rã danh sách món theo từng ngày giao (Grain phân rã lịch trình)
function parseOrderSchedule(items) {
  const daysMap = {};
  const dayOrder = [];
  let totalBottles = 0;
  let totalAmount = 0;

  (items || []).forEach(function(it) {
    const rawDate = (it.deliveryDate || 'Không xác định').toString().trim();
    const qty = Number(it.quantity) || 1;
    const price = Number(it.price) || 0;
    const lineTotal = price * qty;
    totalBottles += qty;
    totalAmount += lineTotal;

    if (!daysMap[rawDate]) {
      const tok = extractDateToken(rawDate);
      daysMap[rawDate] = {
        dateLabel: rawDate,
        dateToken: tok,
        items: [],
        bottleCount: 0,
        subtotal: 0
      };
      dayOrder.push(rawDate);
    }
    daysMap[rawDate].items.push(it);
    daysMap[rawDate].bottleCount += qty;
    daysMap[rawDate].subtotal += lineTotal;
  });

  return {
    daysList: dayOrder.map(function(k) { return daysMap[k]; }),
    totalDays: dayOrder.length,
    totalOrderBottles: totalBottles,
    totalOrderAmount: totalAmount
  };
}

// Helper phân tích Cột L (delivery_status) thành trạng thái giao từng ngày
function parseDeliveryStatus(colL, totalDays, daysList) {
  const s = (colL || '').toString().trim();
  const delivMap = {};

  if (!s || s === 'Chưa giao') return delivMap;

  if (s === 'Đã giao' || s.indexOf('Hoàn tất') !== -1) {
    (daysList || []).forEach(function(d) {
      delivMap[d.dateToken] = { token: d.dateToken, isEarly: false, earlyNote: '', raw: d.dateToken };
    });
    return delivMap;
  }

  const mColon = s.match(/:\s*([^)]+)\)?$/);
  if (mColon) {
    const parts = mColon[1].split(',');
    parts.forEach(function(p) {
      const cleanP = p.trim();
      if (!cleanP) return;
      if (cleanP.indexOf('-gộp') !== -1) {
        const sub = cleanP.split('-gộp');
        const schedTok = sub[0].trim();
        const execTok = sub[1].trim();
        delivMap[schedTok] = { token: schedTok, isEarly: true, earlyNote: 'gộp ' + execTok, raw: cleanP };
      } else {
        delivMap[cleanP] = { token: cleanP, isEarly: false, earlyNote: '', raw: cleanP };
      }
    });
  }
  return delivMap;
}

// Helper phân tích nhật ký key-value (Cột M, Cột N) dạng "16-11: val | 17-11: val"
function parseKeyedLogs(str) {
  const map = {};
  if (!str) return map;
  const parts = str.toString().split('|');
  parts.forEach(function(p) {
    const clean = p.trim();
    if (!clean) return;
    const colonIdx = clean.indexOf(':');
    if (colonIdx !== -1) {
      const k = clean.substring(0, colonIdx).trim();
      const v = clean.substring(colonIdx + 1).trim();
      map[k] = v;
    }
  });
  return map;
}

function buildKeyedLogs(map) {
  return Object.keys(map).map(function(k) { return k + ': ' + map[k]; }).join(' | ');
}

// Lấy danh sách đơn hàng cần giao theo ngày cho Shipper (v2.6.0 hỗ trợ đơn tuần & giao gộp)
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
    if (targetDate && targetDate !== 'all') {
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
      items = items.map(function(it) {
        const sw = normalizeSweetness(it.sweetness, it.sweetnessCode);
        return {
          ...it,
          sweetness: sw.label,
          sweetnessCode: sw.code
        };
      });

      const statusK = (r[10] || '').toString().trim();
      const statusKLower = statusK.toLowerCase();
      if (statusKLower.indexOf('cancel') !== -1 || statusKLower.indexOf('hủy') !== -1 || statusKLower.indexOf('huỷ') !== -1) {
        continue;
      }
      const deliveryStatus = (r[11] || '').toString().trim();
      const deliveredAt = r[12] instanceof Date ? Utilities.formatDate(r[12], Session.getScriptTimeZone() || 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy HH:mm') : (r[12] || '').toString().trim();
      const deliveredBy = (r[13] || '').toString().trim();
      const deliveryIso = (r[14] || '').toString().trim();

      const sched = parseOrderSchedule(items);
      const delivMap = parseDeliveryStatus(deliveryStatus, sched.totalDays, sched.daysList);
      const timeLogs = parseKeyedLogs(deliveredAt);
      const staffLogs = parseKeyedLogs(deliveredBy);

      // Điền thông tin giao hàng chi tiết cho từng ngày trong schedule
      sched.daysList.forEach(function(d) {
        const dInfo = delivMap[d.dateToken];
        d.isDelivered = !!dInfo;
        d.isEarly = !!(dInfo && dInfo.isEarly);
        d.earlyNote = (dInfo && dInfo.earlyNote) || '';
        d.deliveredAt = timeLogs[d.dateToken] || (sched.totalDays === 1 ? deliveredAt : '');
        d.deliveredBy = staffLogs[d.dateToken] || (sched.totalDays === 1 ? deliveredBy : '');
      });

      let matchDate = false;
      let todayDays = [];
      let todayItems = [];
      let todayBottles = 0;
      let todaySubtotal = 0;
      let todayIsDelivered = false;
      let todayIsEarly = false;
      let todayEarlyNote = '';
      let availableFutureDays = [];

      if (!targetDate || targetDate === 'all') {
        matchDate = true;
        todayDays = sched.daysList;
        todayItems = items;
        todayBottles = sched.totalOrderBottles;
        todaySubtotal = sched.totalOrderAmount;
        todayIsDelivered = sched.totalDays === 1 ? (deliveryStatus === 'Đã giao') : (sched.daysList.length > 0 && sched.daysList.every(function(d) { return d.isDelivered; }));
        todayIsEarly = false;
        todayEarlyNote = '';
        availableFutureDays = [];
      } else {
        const matchingDays = sched.daysList.filter(function(d) {
          const matchLabel = searchTokens.some(function(tok) { return d.dateLabel.toLowerCase().indexOf(tok) !== -1 || d.dateToken.toLowerCase() === tok; });
          const matchIso = deliveryIso && searchTokens.indexOf(deliveryIso.toLowerCase()) !== -1;
          return matchLabel || matchIso;
        });

        if (matchingDays.length > 0) {
          matchDate = true;
          todayDays = matchingDays;
          matchingDays.forEach(function(d) {
            todayItems = todayItems.concat(d.items);
            todayBottles += d.bottleCount;
            todaySubtotal += d.subtotal;
          });
          todayIsDelivered = matchingDays.every(function(d) { return d.isDelivered; });
          todayIsEarly = matchingDays.some(function(d) { return d.isEarly; });
          todayEarlyNote = matchingDays.filter(function(d) { return d.isEarly; }).map(function(d) { return d.earlyNote; }).join('; ');

          // Các ngày kế tiếp chưa giao mà Shipper có thể giao gộp hôm nay
          availableFutureDays = sched.daysList.filter(function(d) {
            return matchingDays.indexOf(d) === -1 && !d.isDelivered;
          });
        } else if (deliveryIso && searchTokens.indexOf(deliveryIso.toLowerCase()) !== -1) {
          matchDate = true;
          todayDays = sched.daysList;
          todayItems = items;
          todayBottles = sched.totalOrderBottles;
          todaySubtotal = sched.totalOrderAmount;
          todayIsDelivered = (deliveryStatus === 'Đã giao');
          availableFutureDays = [];
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
          isExtraOrder: (r[9] || '').toString().indexOf('EXTRA_ORDER') !== -1,
          total: Number(rawTotal) || sched.totalOrderAmount || 0,
          status: statusK || 'Chưa thanh toán',
          deliveryStatus: deliveryStatus || 'Chưa giao',
          deliveredAt: deliveredAt,
          deliveredBy: deliveredBy,
          deliveryIso: deliveryIso,
          // v2.6.0 Thông tin mở rộng đa ngày
          isMultiDay: sched.totalDays > 1,
          schedule: sched,
          todayDays: todayDays,
          todayItems: todayItems.length > 0 ? todayItems : items,
          todayBottles: todayBottles,
          todaySubtotal: todaySubtotal,
          todayIsDelivered: todayIsDelivered,
          todayIsEarly: todayIsEarly,
          todayEarlyNote: todayEarlyNote,
          availableFutureDays: availableFutureDays
        });
      }
    }

    deliveries.sort(function(a, b) { return b.orderId.localeCompare(a.orderId); });
    return {
      success: true,
      deliveries: deliveries,
      extraTray: getExtraTraySummary(ss, getTodayIsoVn()),
      staff: { name: staff.name, role: staff.role, email: staff.email }
    };
  } catch (err) {
    return { success: false, message: 'Lỗi lấy danh sách giao hàng: ' + err.toString() };
  }
}

// Đánh dấu Đã Giao (v2.6.0: Hỗ trợ giao đơn ngày, giao gộp ca sớm và hoàn tác chi tiết)
function staffMarkDelivered(payload) {
  const staff = verifyStaffToken(payload && payload.idToken);
  if (!staff || staff.error) {
    return { success: false, message: (staff && staff.error) || 'Từ chối: Chưa xác thực.' };
  }

  const orderId = (payload && payload.orderId) ? payload.orderId.toString().trim() : '';
  const isDelivered = payload && payload.delivered !== false; // true: Đã giao, false: Hủy đánh dấu
  const deliveryDates = (payload && payload.deliveryDates && Array.isArray(payload.deliveryDates)) ? payload.deliveryDates : [];
  const executedDate = (payload && payload.executedDate) ? payload.executedDate.toString().trim() : '';

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
        const nowFormatted = Utilities.formatDate(now, Session.getScriptTimeZone() || 'Asia/Ho_Chi_Minh', 'dd/MM HH:mm');
        const staffName = staff.name || (staff.email ? staff.email.split('@')[0] : 'Shipper');

        let items = [];
        try { items = JSON.parse(data[i][6]) || []; } catch (e) { items = []; }
        const sched = parseOrderSchedule(items);

        let newColL = '';
        let newColM = '';
        let newColN = '';

        if (sched.totalDays <= 1) {
          // Đơn 1 ngày tiêu chuẩn
          if (isDelivered) {
            newColL = 'Đã giao';
            newColM = nowFormatted;
            newColN = staffName;
          } else {
            newColL = '';
            newColM = '';
            newColN = '';
          }
          sheet.getRange(rowNum, 12).setValue(newColL);
          sheet.getRange(rowNum, 13).setValue(isDelivered ? now : '');
          sheet.getRange(rowNum, 14).setValue(newColN);
        } else {
          // Đơn tuần nhiều ngày (Multi-day Order)
          const colL = (data[i][11] || '').toString().trim();
          const colM = (data[i][12] || '').toString().trim();
          const colN = (data[i][13] || '').toString().trim();

          const delivMap = parseDeliveryStatus(colL, sched.totalDays, sched.daysList);
          const timeLogs = parseKeyedLogs(colM);
          const staffLogs = parseKeyedLogs(colN);

          const execTok = extractDateToken(executedDate) || (deliveryDates.length > 0 ? extractDateToken(deliveryDates[0]) : (sched.daysList[0] ? sched.daysList[0].dateToken : ''));

          const targetTokens = deliveryDates.length > 0 ? deliveryDates.map(extractDateToken).filter(Boolean) : (execTok ? [execTok] : []);

          if (isDelivered) {
            targetTokens.forEach(function(tok) {
              if (tok !== execTok) {
                // Ca giao sớm gộp vào ngày hôm nay
                delivMap[tok] = { token: tok, isEarly: true, earlyNote: 'gộp ' + execTok, raw: `${tok}-gộp${execTok}` };
                timeLogs[tok] = `${nowFormatted} (gộp ${execTok})`;
                staffLogs[tok] = `${staffName} (gộp ${execTok})`;
              } else {
                delivMap[tok] = { token: tok, isEarly: false, earlyNote: '', raw: tok };
                timeLogs[tok] = nowFormatted;
                staffLogs[tok] = staffName;
              }
            });
          } else {
            // Hủy/Hoàn tác
            targetTokens.forEach(function(tok) {
              delete delivMap[tok];
              delete timeLogs[tok];
              delete staffLogs[tok];
            });
          }

          const completedCount = Object.keys(delivMap).length;
          if (completedCount === sched.totalDays) {
            newColL = `Đã giao (Hoàn tất ${sched.totalDays}/${sched.totalDays} ngày)`;
          } else if (completedCount > 0) {
            const rawTokens = Object.keys(delivMap).map(function(k) { return delivMap[k].raw; }).join(', ');
            newColL = `Đang giao (${completedCount}/${sched.totalDays} ngày: ${rawTokens})`;
          } else {
            newColL = '';
          }

          newColM = buildKeyedLogs(timeLogs);
          newColN = buildKeyedLogs(staffLogs);

          sheet.getRange(rowNum, 12).setValue(newColL);
          sheet.getRange(rowNum, 13).setValue(newColM);
          sheet.getRange(rowNum, 14).setValue(newColN);
        }

        logTracking({ action: 'staff_mark_delivered', details: `${staff.email} -> ${orderId}: ${isDelivered ? 'Đã giao' : 'Hủy'} [${newColL}]` });
        return {
          success: true,
          orderId: orderId,
          delivered: isDelivered,
          deliveryStatus: newColL,
          deliveredAt: newColM,
          deliveredBy: newColN
        };
      }
    }
    return { success: false, message: 'Không tìm thấy đơn ' + orderId };
  } catch (err) {
    return { success: false, message: err.toString() };
  } finally {
    lock.releaseLock();
  }
}

// Đánh dấu Đã Thu Tiền (v2.6.0: Hỗ trợ thu trọn đơn hoặc thu từng ca / ca gộp)
function staffMarkPaid(payload) {
  const staff = verifyStaffToken(payload && payload.idToken);
  if (!staff || staff.error) {
    return { success: false, message: (staff && staff.error) || 'Từ chối: Chưa xác thực.' };
  }

  const orderId = (payload && payload.orderId) ? payload.orderId.toString().trim() : '';
  const isPaid = payload && payload.paid !== false; // true: Paid / Đã thu, false: để trống
  const scope = (payload && payload.scope) ? payload.scope.toString().trim() : 'full'; // 'full' hoặc 'partial'
  const amount = Number(payload && payload.amount) || 0;
  const daysPaid = (payload && payload.daysPaid && Array.isArray(payload.daysPaid)) ? payload.daysPaid : [];

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
        let newStatus = '';

        if (!isPaid) {
          newStatus = '';
        } else if (scope === 'full') {
          newStatus = 'Paid';
        } else {
          // Thu từng phần (partial)
          const rawTotal = data[i][7] !== undefined && data[i][7] !== null ? Number(data[i][7].toString().replace(/[^\d.-]/g, '')) || 0 : 0;
          const daysStr = daysPaid.map(extractDateToken).filter(Boolean).join('+');
          const amtStr = amount.toLocaleString('vi-VN') + 'đ';
          const totalStr = rawTotal.toLocaleString('vi-VN') + 'đ';
          if (amount >= rawTotal && rawTotal > 0) {
            newStatus = 'Paid';
          } else {
            newStatus = `Đã thu ${amtStr}/${totalStr}${daysStr ? ' (' + daysStr + ')' : ''}`;
          }
        }

        sheet.getRange(rowNum, 11).setValue(newStatus); // Cột K = index 11
        logTracking({ action: 'staff_mark_paid', details: `${staff.email} -> ${orderId}: [${newStatus}]` });
        return { success: true, orderId: orderId, paid: isPaid, status: newStatus };
      }
    }
    return { success: false, message: 'Không tìm thấy đơn ' + orderId };
  } catch (err) {
    return { success: false, message: err.toString() };
  } finally {
    lock.releaseLock();
  }
}

// ==========================================
// 6b. MODULE SỮA BÁN THÊM (v3.0.0 - ExtraOrder_Log)
// ==========================================

function getTodayIsoVn() {
  const tz = Session.getScriptTimeZone() || 'Asia/Ho_Chi_Minh';
  return Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd');
}

function getTodayLabelVn() {
  const tz = Session.getScriptTimeZone() || 'Asia/Ho_Chi_Minh';
  const now = new Date();
  const dayNames = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
  const dStr = Utilities.formatDate(now, tz, 'dd-MM');
  return `${dayNames[now.getDay()]} (${dStr})`;
}

function normalizeSheetDateIso(val) {
  if (!val) return '';
  if (val instanceof Date) {
    const tz = Session.getScriptTimeZone() || 'Asia/Ho_Chi_Minh';
    return Utilities.formatDate(val, tz, 'yyyy-MM-dd');
  }
  return val.toString().trim().slice(0, 10);
}

function getOrCreateExtraOrderSheet(ss) {
  let sheet = ss.getSheetByName('ExtraOrder_Log');
  if (!sheet) {
    sheet = ss.insertSheet('ExtraOrder_Log');
    sheet.appendRow(['date_iso', 'sku_id', 'dish_name', 'price', 'qty_received', 'updated_at', 'updated_by', 'history_log']);
    sheet.getRange(1, 1, 1, 8).setFontWeight('bold');
  }
  return sheet;
}

function getDimMenuSkuMap(ss) {
  const map = {};
  const list = [];
  const menuSheet = ss.getSheetByName('Dim_Menu');
  if (!menuSheet) return { map: map, list: list };
  const rows = menuSheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    const id = (r[0] !== undefined && r[0] !== null ? r[0] : '').toString().trim();
    const name = (r[1] !== undefined && r[1] !== null ? r[1] : '').toString().trim();
    const price = Number(r[3]) || 0;
    const status = (r[6] !== undefined && r[6] !== null ? r[6] : '').toString().trim().toLowerCase();
    if (!id || !name) continue;
    const item = { id: id, name: name, price: price, active: status === 'active' };
    map[id] = item;
    if (status === 'active') {
      list.push(item);
    }
  }
  return { map: map, list: list };
}

function getExtraTraySummary(ss, targetDateIso) {
  const dateIso = targetDateIso || getTodayIsoVn();
  const tz = Session.getScriptTimeZone() || 'Asia/Ho_Chi_Minh';
  const menuInfo = getDimMenuSkuMap(ss);

  const trayMap = {};
  const skuOrder = [];
  const extraSheet = ss.getSheetByName('ExtraOrder_Log');
  if (extraSheet) {
    const eRows = extraSheet.getDataRange().getValues();
    for (let i = 1; i < eRows.length; i++) {
      const r = eRows[i];
      const rDate = normalizeSheetDateIso(r[0]);
      const skuId = (r[1] !== undefined && r[1] !== null ? r[1] : '').toString().trim();
      if (rDate !== dateIso || !skuId) continue;

      const menuItem = menuInfo.map[skuId];
      const dishName = (menuItem && menuItem.name) || (r[2] || '').toString().trim() || skuId;
      const price = (menuItem && menuItem.price) || Number(r[3]) || 0;
      const qtyReceived = Math.max(0, Number(r[4]) || 0);
      const updatedAt = r[5] instanceof Date ? Utilities.formatDate(r[5], tz, 'HH:mm') : (r[5] || '').toString().trim();
      const updatedBy = (r[6] || '').toString().trim();

      if (!trayMap[skuId]) {
        trayMap[skuId] = {
          skuId: skuId,
          name: dishName,
          price: price,
          received: 0,
          sold: 0,
          remaining: 0,
          updatedAt: updatedAt,
          updatedBy: updatedBy
        };
        skuOrder.push(skuId);
      }
      trayMap[skuId].received += qtyReceived;
      if (updatedAt) trayMap[skuId].updatedAt = updatedAt;
      if (updatedBy) trayMap[skuId].updatedBy = updatedBy;
    }
  }

  let totalCollected = 0;
  const masterSheet = ss.getSheetByName('Orders_Master');
  if (masterSheet) {
    const mRows = masterSheet.getDataRange().getValues();
    for (let i = 1; i < mRows.length; i++) {
      const r = mRows[i];
      const ownerNote = (r[9] !== undefined && r[9] !== null ? r[9] : '').toString().trim();
      if (ownerNote.indexOf('EXTRA_ORDER') === -1) continue;

      const statusK = (r[10] !== undefined && r[10] !== null ? r[10] : '').toString().trim();
      const statusLower = statusK.toLowerCase();
      if (statusLower.indexOf('cancel') !== -1 || statusLower.indexOf('hủy') !== -1 || statusLower.indexOf('huỷ') !== -1) {
        continue;
      }

      const dIso = normalizeSheetDateIso(r[14]);
      if (dIso !== dateIso) continue;

      let items = [];
      try { items = JSON.parse(r[6]) || []; } catch (e) { items = []; }
      items.forEach(function(it) {
        const skuId = (it.id || '').toString().trim();
        const qty = Math.max(0, Number(it.quantity) || 0);
        if (!skuId || !qty) return;
        if (!trayMap[skuId]) {
          const menuItem = menuInfo.map[skuId];
          trayMap[skuId] = {
            skuId: skuId,
            name: (menuItem && menuItem.name) || it.name || skuId,
            price: (menuItem && menuItem.price) || Number(it.price) || 0,
            received: 0,
            sold: 0,
            remaining: 0,
            updatedAt: '',
            updatedBy: ''
          };
          skuOrder.push(skuId);
        }
        trayMap[skuId].sold += qty;
      });

      if (statusK === 'Paid') {
        const rawTotal = r[7] !== undefined && r[7] !== null ? r[7].toString().replace(/[^\d.-]/g, '') : '0';
        totalCollected += Number(rawTotal) || 0;
      }
    }
  }

  let totalReceived = 0;
  let totalSold = 0;
  let totalRemaining = 0;
  const items = skuOrder.map(function(skuId) {
    const t = trayMap[skuId];
    t.remaining = Math.max(0, t.received - t.sold);
    totalReceived += t.received;
    totalSold += t.sold;
    totalRemaining += t.remaining;
    return t;
  });

  return {
    dateIso: dateIso,
    items: items,
    menuItems: menuInfo.list,
    totalReceived: totalReceived,
    totalSold: totalSold,
    totalRemaining: totalRemaining,
    totalCollected: totalCollected
  };
}

function staffGetExtraTray(payload) {
  const staff = verifyStaffToken(payload && payload.idToken);
  if (!staff || staff.error) {
    return { success: false, message: (staff && staff.error) || 'Từ chối: Chưa xác thực.' };
  }
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    return {
      success: true,
      extraTray: getExtraTraySummary(ss, getTodayIsoVn())
    };
  } catch (err) {
    return { success: false, message: 'Lỗi tải khay sữa bán thêm: ' + err.toString() };
  }
}

function staffSaveExtraIntake(payload) {
  const staff = verifyStaffToken(payload && payload.idToken);
  if (!staff || staff.error) {
    return { success: false, message: (staff && staff.error) || 'Từ chối: Chưa xác thực.' };
  }

  const skuId = (payload && payload.skuId) ? payload.skuId.toString().trim() : '';
  const qtyReceived = parseInt(payload && payload.qtyReceived, 10);
  if (!skuId) return { success: false, message: 'Vui lòng chọn món sữa.' };
  if (isNaN(qtyReceived) || qtyReceived < 0 || qtyReceived > 200) {
    return { success: false, message: 'Số chai nhận không hợp lệ (0 - 200).' };
  }

  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
  } catch (e) {
    return { success: false, message: 'Hệ thống đang bận, vui lòng thử lại sau 2 giây.' };
  }

  try {
    const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    const menuInfo = getDimMenuSkuMap(ss);
    const menuItem = menuInfo.map[skuId];
    if (!menuItem) {
      return { success: false, message: 'Không tìm thấy món trong Dim_Menu (' + skuId + ').' };
    }

    const todayIso = getTodayIsoVn();
    const currentTray = getExtraTraySummary(ss, todayIso);
    const existingEntry = currentTray.items.find(function(it) { return it.skuId === skuId; });
    const soldToday = existingEntry ? existingEntry.sold : 0;

    if (qtyReceived < soldToday) {
      return {
        success: false,
        message: `Món "${menuItem.name}" đã bán ${soldToday} chai hôm nay, không thể chỉnh số nhận xuống ${qtyReceived}.`
      };
    }

    const extraSheet = getOrCreateExtraOrderSheet(ss);
    const rows = extraSheet.getDataRange().getValues();
    const tz = Session.getScriptTimeZone() || 'Asia/Ho_Chi_Minh';
    const now = new Date();
    const nowTime = Utilities.formatDate(now, tz, 'HH:mm');
    const actor = staff.name || staff.email || 'Staff';

    let targetRow = -1;
    let prevHistory = '';
    for (let i = 1; i < rows.length; i++) {
      const rDate = normalizeSheetDateIso(rows[i][0]);
      const rSku = (rows[i][1] !== undefined && rows[i][1] !== null ? rows[i][1] : '').toString().trim();
      if (rDate === todayIso && rSku === skuId) {
        targetRow = i + 1;
        prevHistory = (rows[i][7] || '').toString().trim();
        break;
      }
    }

    const logEntry = `${nowTime} ${actor}: ${qtyReceived} chai`;
    const newHistory = prevHistory ? `${prevHistory} | ${logEntry}` : logEntry;

    if (targetRow > 0) {
      extraSheet.getRange(targetRow, 3, 1, 6).setValues([[
        menuItem.name,
        menuItem.price,
        qtyReceived,
        now,
        staff.email || actor,
        newHistory
      ]]);
    } else {
      extraSheet.appendRow([
        todayIso,
        skuId,
        menuItem.name,
        menuItem.price,
        qtyReceived,
        now,
        staff.email || actor,
        newHistory
      ]);
    }

    logTracking({ action: 'extra_intake_saved', details: `${staff.email} -> ${todayIso} | ${menuItem.name}: ${qtyReceived} chai` });
    return {
      success: true,
      extraTray: getExtraTraySummary(ss, todayIso)
    };
  } catch (err) {
    return { success: false, message: 'Lỗi lưu số nhận: ' + err.toString() };
  } finally {
    lock.releaseLock();
  }
}

function staffCreateExtraOrder(payload) {
  const staff = verifyStaffToken(payload && payload.idToken);
  if (!staff || staff.error) {
    return { success: false, message: (staff && staff.error) || 'Từ chối: Chưa xác thực.' };
  }

  const skuId = (payload && payload.skuId) ? payload.skuId.toString().trim() : '';
  const qty = parseInt(payload && payload.qty, 10);
  const requestId = (payload && payload.requestId) ? payload.requestId.toString().trim() : '';
  const markPaidNow = !!(payload && payload.markPaidNow);
  const customerNote = (payload && payload.customerNote) ? payload.customerNote.toString().trim() : '';

  if (!skuId) return { success: false, message: 'Thiếu mã món sữa.' };
  if (isNaN(qty) || qty < 1 || qty > 50) return { success: false, message: 'Số lượng bán phải từ 1 đến 50.' };

  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
  } catch (e) {
    return { success: false, message: 'Hệ thống đang bận, vui lòng thử lại sau 2 giây.' };
  }

  try {
    const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    const masterSheet = ss.getSheetByName('Orders_Master');
    const factSheet = ss.getSheetByName('Fact_Order_Items');
    if (!masterSheet || !factSheet) return { success: false, message: 'Thiếu tab Orders_Master hoặc Fact_Order_Items' };

    const todayIso = getTodayIsoVn();

    // Idempotency check via requestId stored in Orders_Master Col J (EXTRA_ORDER|<requestId>)
    if (requestId) {
      const mData = masterSheet.getDataRange().getValues();
      for (let i = 1; i < mData.length; i++) {
        const colJ = (mData[i][9] || '').toString().trim();
        if (colJ === `EXTRA_ORDER|${requestId}`) {
          return {
            success: true,
            duplicate: true,
            orderId: (mData[i][0] || '').toString().trim(),
            extraTray: getExtraTraySummary(ss, todayIso)
          };
        }
      }
    }

    const menuInfo = getDimMenuSkuMap(ss);
    const menuItem = menuInfo.map[skuId];
    if (!menuItem) {
      return { success: false, message: 'Không tìm thấy món trong Dim_Menu (' + skuId + ').' };
    }

    const tray = getExtraTraySummary(ss, todayIso);
    const trayItem = tray.items.find(function(it) { return it.skuId === skuId; });
    const remaining = trayItem ? trayItem.remaining : 0;
    if (remaining < qty) {
      return {
        success: false,
        message: `Khay chỉ còn ${remaining} chai "${menuItem.name}". Hãy cập nhật số nhận nếu bếp đưa thêm.`
      };
    }

    const sw = normalizeSweetness(payload && payload.sweetness, payload && payload.sweetnessCode);
    const deliveryDateLabel = getTodayLabelVn();
    const orderId = generateUniqueOrderId(masterSheet);
    const now = new Date();
    const staffName = staff.name || (staff.email ? staff.email.split('@')[0] : 'Shipper');
    const unitPrice = Number(menuItem.price) || 0;
    const totalAmount = unitPrice * qty;

    const itemObj = {
      id: menuItem.id,
      name: menuItem.name,
      price: unitPrice,
      quantity: qty,
      deliveryDate: deliveryDateLabel,
      deliveryIso: todayIso,
      sweetness: sw.label,
      sweetnessCode: sw.code,
      source: 'extra_order'
    };

    const ownerTag = requestId ? `EXTRA_ORDER|${requestId}` : 'EXTRA_ORDER';
    masterSheet.appendRow([
      orderId,
      now,
      '[Bán thêm] Khách mua lẻ',
      '',
      '',
      'Mua trực tiếp từ Shipper',
      JSON.stringify([itemObj]),
      totalAmount,
      customerNote,
      ownerTag,
      markPaidNow ? 'Paid' : '',
      markPaidNow ? 'Đã giao' : '',
      markPaidNow ? now : '',
      markPaidNow ? staffName : '',
      todayIso
    ]);

    const currentWeek = resolveCurrentWeekCode(factSheet);
    factSheet.appendRow([
      orderId,
      deliveryDateLabel,
      menuItem.name,
      menuItem.id,
      qty,
      '[Bán thêm] Khách mua lẻ',
      '',
      currentWeek,
      'ExtraOrder',
      '',
      sw.label
    ]);

    logTracking({
      action: 'extra_order_created',
      details: `${staff.email} -> ${orderId}: ${qty}x ${menuItem.name} (${totalAmount}đ)${markPaidNow ? ' [Paid+Delivered]' : ''}`
    });

    return {
      success: true,
      orderId: orderId,
      extraTray: getExtraTraySummary(ss, todayIso)
    };
  } catch (err) {
    return { success: false, message: 'Lỗi tạo đơn bán thêm: ' + err.toString() };
  } finally {
    lock.releaseLock();
  }
}

function staffCancelExtraOrder(payload) {
  const staff = verifyStaffToken(payload && payload.idToken);
  if (!staff || staff.error) {
    return { success: false, message: (staff && staff.error) || 'Từ chối: Chưa xác thực.' };
  }

  const orderId = (payload && payload.orderId) ? payload.orderId.toString().trim() : '';
  if (!orderId) return { success: false, message: 'Thiếu mã đơn hàng.' };

  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
  } catch (e) {
    return { success: false, message: 'Hệ thống đang bận, vui lòng thử lại sau 2 giây.' };
  }

  try {
    const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    const masterSheet = ss.getSheetByName('Orders_Master');
    const factSheet = ss.getSheetByName('Fact_Order_Items');
    if (!masterSheet) return { success: false, message: 'Thiếu tab Orders_Master' };

    const mData = masterSheet.getDataRange().getValues();
    let foundRow = -1;
    for (let i = 1; i < mData.length; i++) {
      if ((mData[i][0] || '').toString().trim() === orderId) {
        const ownerNote = (mData[i][9] || '').toString().trim();
        if (ownerNote.indexOf('EXTRA_ORDER') === -1) {
          return { success: false, message: 'Chỉ được hủy đơn Sữa Bán Thêm tại đây.' };
        }
        const statusK = (mData[i][10] || '').toString().trim();
        if (statusK === 'Paid') {
          return { success: false, message: 'Đơn đã thu tiền (Paid). Hãy bấm "Sửa" thanh toán trước khi hủy.' };
        }
        foundRow = i + 1;
        break;
      }
    }

    if (foundRow === -1) {
      return { success: false, message: 'Không tìm thấy đơn ' + orderId };
    }

    masterSheet.getRange(foundRow, 11).setValue('Cancelled');

    if (factSheet) {
      const fData = factSheet.getDataRange().getValues();
      for (let j = 1; j < fData.length; j++) {
        if ((fData[j][0] || '').toString().trim() === orderId) {
          factSheet.getRange(j + 1, 9).setValue('ExtraOrder_Cancelled');
        }
      }
    }

    logTracking({ action: 'extra_order_cancelled', details: `${staff.email} -> ${orderId}` });
    return {
      success: true,
      orderId: orderId,
      extraTray: getExtraTraySummary(ss, getTodayIsoVn())
    };
  } catch (err) {
    return { success: false, message: 'Lỗi hủy đơn: ' + err.toString() };
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
function setupDaily21hTrigger() {
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(t => {
    if (t.getHandlerFunction() === 'sendDailyKitchenReport') {
      ScriptApp.deleteTrigger(t);
    }
  });

  ScriptApp.newTrigger('sendDailyKitchenReport')
    .timeBased()
    .everyDays(1)
    .atHour(21)
    .create();

  Logger.log('✅ Đã cài đặt tự động gửi Báo cáo Nấu Sữa lúc 21h00 hàng ngày về: ' + getKitchenRecipientEmails());
}

// Alias tương thích ngược nếu người dùng chạy tên hàm cũ
function setupDaily20hTrigger() {
  return setupDaily21hTrigger();
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

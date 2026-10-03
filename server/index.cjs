const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3001;
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Password hashing algorithm matching security.ts
const SALT = 'MREX_ENTERPRISE_SECURE_AUTH_2026_@!';
function hashPassword(plainText) {
  if (!plainText) return '';
  const str = SALT + plainText.trim() + SALT;
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const rawNum = 4294967296 * (2097151 & h2) + (h1 >>> 0);
  return 'mrex_hash_' + rawNum.toString(36);
}
const DEFAULT_PASSWORD_HASH = hashPassword('123456');

function verifyPassword(inputPassword, storedHash) {
  if (!inputPassword) return false;
  const inputTrimmed = inputPassword.trim();
  const inputHash = hashPassword(inputTrimmed);
  if (!storedHash) return inputHash === DEFAULT_PASSWORD_HASH;
  return storedHash === inputHash || storedHash === inputTrimmed;
}

// Initial Core Dataset with Toby Vũ, Cẩm Mơ, LOng and all company members
const DEFAULT_EMPLOYEES = [
  {
    id: 'emp-01',
    birthDate: '1988-10-15',
    name: 'Toby Vũ',
    code: 'NV-001',
    email: 'tobyvu214@mrex.vn',
    phone: '0912 345 678',
    role: 'CEO',
    roleTitle: 'Tổng Giám Đốc (CEO)',
    departmentId: 'exec',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    joinDate: '2021-03-15',
    baseSalaryGrade: 'Bậc 8 (Executive)',
    baseSalaryVND: 50000000,
    status: 'ACTIVE',
    annualLeaveRemaining: 14,
    password: DEFAULT_PASSWORD_HASH,
    accountStatus: 'ACTIVE',
  },
  {
    id: 'emp-03',
    birthDate: '1992-10-08',
    name: 'Cẩm Mơ',
    code: 'NV-003',
    email: 'cammo@mrex.vn',
    phone: '0912 888 999',
    role: 'MANAGER',
    roleTitle: 'Manager Marketing',
    departmentId: 'social',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    joinDate: '2026-10-02',
    baseSalaryGrade: 'Bậc 5 (Manager)',
    baseSalaryVND: 25000000,
    status: 'ACTIVE',
    annualLeaveRemaining: 12,
    managerId: 'emp-01',
    password: DEFAULT_PASSWORD_HASH,
    accountStatus: 'ACTIVE',
  },
  {
    id: 'emp-04',
    birthDate: '1996-10-28',
    name: 'LOng',
    code: 'NV-004',
    email: 'long@mrex.vn',
    phone: '0912 888 999',
    role: 'EMPLOYEE',
    roleTitle: 'Kỹ Sư Phần Mềm (Software Engineer)',
    departmentId: 'social',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    joinDate: '2026-10-02',
    baseSalaryGrade: 'Bậc 4 (Senior)',
    baseSalaryVND: 18000000,
    status: 'ACTIVE',
    annualLeaveRemaining: 12,
    managerId: 'emp-03',
    password: DEFAULT_PASSWORD_HASH,
    accountStatus: 'ACTIVE',
  },
  {
    id: 'emp-07',
    birthDate: '1990-10-22',
    name: 'Võ Văn Lực',
    code: 'NV-071',
    email: 'luc.vo@mrex.vn',
    phone: '0978 889 900',
    role: 'MANAGER',
    roleTitle: 'Quản Đốc Phân Xưởng Sản Xuất',
    departmentId: 'production',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    joinDate: '2022-03-15',
    baseSalaryGrade: 'Bậc 6 (Director)',
    baseSalaryVND: 38000000,
    status: 'ACTIVE',
    annualLeaveRemaining: 12,
    managerId: 'emp-01',
    password: DEFAULT_PASSWORD_HASH,
    accountStatus: 'ACTIVE',
  },
  {
    id: 'emp-08',
    birthDate: '1995-11-05',
    name: 'Hoàng Kim Oanh',
    code: 'NV-082',
    email: 'oanh.hoang@mrex.vn',
    phone: '0966 554 433',
    role: 'EMPLOYEE',
    roleTitle: 'Thủ Kho & Quản Lý Kho Vận',
    departmentId: 'production',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
    joinDate: '2022-05-10',
    baseSalaryGrade: 'Bậc 4 (Senior)',
    baseSalaryVND: 22000000,
    status: 'ACTIVE',
    annualLeaveRemaining: 10,
    managerId: 'emp-07',
    password: DEFAULT_PASSWORD_HASH,
    accountStatus: 'ACTIVE',
  },
  {
    id: 'emp-02',
    birthDate: '1993-12-14',
    name: 'Lê Phương Lan',
    code: 'NV-012',
    email: 'lan.le@mrex.vn',
    phone: '0988 765 432',
    role: 'MANAGER',
    roleTitle: 'Trưởng Phòng IT & SEO',
    departmentId: 'it_seo',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
    joinDate: '2022-06-01',
    baseSalaryGrade: 'Bậc 6 (Director)',
    baseSalaryVND: 42000000,
    status: 'ACTIVE',
    annualLeaveRemaining: 10,
    managerId: 'emp-01',
    password: DEFAULT_PASSWORD_HASH,
    accountStatus: 'ACTIVE',
  },
  {
    id: 'emp-05',
    birthDate: '1995-10-02',
    name: 'Phạm Thuỳ Linh',
    code: 'NV-053',
    email: 'linh.pham@mrex.vn',
    phone: '0934 567 890',
    role: 'EMPLOYEE',
    roleTitle: 'Trưởng Phòng Truyền Thông Nội Bộ',
    departmentId: 'internal_comms',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80',
    joinDate: '2024-02-15',
    baseSalaryGrade: 'Bậc 3 (Specialist)',
    baseSalaryVND: 20000000,
    status: 'ACTIVE',
    annualLeaveRemaining: 12,
    managerId: 'emp-02',
    password: DEFAULT_PASSWORD_HASH,
    accountStatus: 'ACTIVE',
  },
  {
    id: 'emp-06',
    birthDate: '1994-04-18',
    name: 'Vũ Quốc Bảo',
    code: 'NV-062',
    email: 'bao.vu@mrex.vn',
    phone: '0965 222 333',
    role: 'EMPLOYEE',
    roleTitle: 'Trưởng Phòng Social Media',
    departmentId: 'social',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    joinDate: '2024-04-01',
    baseSalaryGrade: 'Bậc 3 (Specialist)',
    baseSalaryVND: 18000000,
    status: 'ACTIVE',
    annualLeaveRemaining: 9,
    managerId: 'emp-01',
    password: DEFAULT_PASSWORD_HASH,
    accountStatus: 'ACTIVE',
  }
];

const DEFAULT_DEPARTMENTS = [
  {
    id: 'exec', name: 'Ban Giám Đốc', code: 'BGD', managerId: 'emp-01', employeeCount: 2, color: '#4F46E5',
    description: 'Cơ quan lãnh đạo cao nhất của doanh nghiệp, chịu trách nhiệm định hướng chiến lược và ra quyết định toàn công ty.',
    level: 1, status: 'ACTIVE', foundedDate: '2021-03-15',
  },
  {
    id: 'production', name: 'Khối Sản Xuất & Kho Vận', code: 'PROD-WH', managerId: 'emp-07', employeeCount: 14, color: '#0284C7',
    description: 'Chịu trách nhiệm gia công, quản lý hệ thống kho bãi, kiểm định chất lượng hàng hóa và lập hóa đơn nhập/xuất vật tư thành phẩm.',
    parentId: 'exec', level: 2, status: 'ACTIVE', foundedDate: '2022-03-01',
  },
  {
    id: 'hr', name: 'Phòng Nhân Sự & Hành Chính', code: 'HRAD', managerId: 'emp-03', employeeCount: 5, color: '#10B981',
    description: 'Quản lý tuyển dụng, đào tạo, phúc lợi nhân viên và các công tác hành chính nội bộ của doanh nghiệp.',
    parentId: 'exec', level: 2, status: 'ACTIVE', foundedDate: '2021-03-15',
  },
  {
    id: 'social', name: 'Phòng Social Media', code: 'SMD', managerId: 'emp-06', employeeCount: 8, color: '#EC4899',
    description: 'Quản lý và phát triển các kênh mạng xã hội, sản xuất nội dung, xây dựng thương hiệu trên nền tảng số.',
    parentId: 'exec', level: 2, status: 'ACTIVE', foundedDate: '2022-01-10',
  },
  {
    id: 'it_seo', name: 'Phòng IT & SEO', code: 'ITSEO', managerId: 'emp-02', employeeCount: 10, color: '#0EA5E9',
    description: 'Phụ trách hạ tầng công nghệ thông tin, phát triển website, tối ưu hoá công cụ tìm kiếm (SEO) và vận hành kỹ thuật.',
    parentId: 'exec', level: 2, status: 'ACTIVE', foundedDate: '2021-06-01',
  },
  {
    id: 'internal_comms', name: 'Phòng Truyền Thông Nội Bộ', code: 'TTNB', managerId: 'emp-05', employeeCount: 5, color: '#F59E0B',
    description: 'Xây dựng văn hoá doanh nghiệp, tổ chức sự kiện nội bộ, quản lý kênh truyền thông nội bộ và gắn kết nhân viên.',
    parentId: 'exec', level: 2, status: 'ACTIVE', foundedDate: '2021-09-01',
  },
];

// In-memory Database state
let db = {
  employees: DEFAULT_EMPLOYEES,
  departments: DEFAULT_DEPARTMENTS,
  tasks: [],
  attendance: [],
  leaveRequests: [],
  announcements: [],
  googleDocs: [],
  vouchers: [],
  contracts: [],
  warehouseItems: [],
  inventoryAudits: [],
  warehouseInvoices: [],
  chatMessages: [],
  budgets: [],
  payroll: [],
  brandConfig: null,
  resources: [],
  updatedAt: new Date().toISOString()
};

// Load database if exists
if (fs.existsSync(DB_FILE)) {
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    db = Object.assign({}, db, parsed);
    console.log(`[Database] Loaded persistent data from ${DB_FILE} (${db.employees.length} employees)`);
  } catch (err) {
    console.error('[Database] Failed to parse database file, initialized defaults', err);
    saveDb();
  }
} else {
  saveDb();
  console.log(`[Database] Created initial database with ${db.employees.length} employees`);
}

function saveDb() {
  db.updatedAt = new Date().toISOString();
  const tmpFile = DB_FILE + '.tmp';
  fs.writeFileSync(tmpFile, JSON.stringify(db, null, 2), 'utf8');
  fs.renameSync(tmpFile, DB_FILE);
}

// Helper to send JSON responses
function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(data));
}

// Request Body Parser Helper
function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      if (body.length > 20 * 1024 * 1024) { // 20MB limit
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    return res.end();
  }

  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;

  try {
    // 1. Health Check
    if (pathname === '/api/health') {
      return sendJson(res, 200, {
        status: 'ok',
        version: '1.0.0',
        serverTime: new Date().toISOString(),
        employeesCount: db.employees.length
      });
    }

    // 2. GET Full Data (for initial load / sync)
    if (req.method === 'GET' && (pathname === '/api/data' || pathname === '/api/sync')) {
      return sendJson(res, 200, {
        success: true,
        data: db
      });
    }

    // 3. POST Sync Data (merge client updates into server database)
    if (req.method === 'POST' && pathname === '/api/sync') {
      const payload = await readBody(req);
      
      let changed = false;
      const syncableKeys = [
        'employees', 'departments', 'tasks', 'attendance', 'leaveRequests',
        'announcements', 'googleDocs', 'vouchers', 'contracts', 'warehouseItems',
        'inventoryAudits', 'warehouseInvoices', 'chatMessages', 'budgets', 'payroll',
        'brandConfig', 'resources'
      ];

      syncableKeys.forEach(k => {
        if (payload[k] !== undefined && Array.isArray(payload[k])) {
          // If array has items or intentionally emptied
          db[k] = payload[k];
          changed = true;
        } else if (payload[k] !== undefined && typeof payload[k] === 'object') {
          db[k] = payload[k];
          changed = true;
        }
      });

      if (changed) {
        saveDb();
        console.log(`[Database] Synced update at ${db.updatedAt} (${db.employees.length} employees)`);
      }

      return sendJson(res, 200, {
        success: true,
        data: db,
        timestamp: db.updatedAt
      });
    }

    // 4. POST Login Check
    if (req.method === 'POST' && pathname === '/api/auth/login') {
      const { email, password } = await readBody(req);
      if (!email || !password) {
        return sendJson(res, 400, { success: false, message: 'Vui lòng nhập email và mật khẩu.' });
      }

      const cleanEmail = email.trim().toLowerCase();
      const user = db.employees.find(e => e.email.toLowerCase() === cleanEmail);

      if (!user) {
        return sendJson(res, 401, {
          success: false,
          message: 'Không tìm thấy tài khoản với email này trên hệ thống máy chủ.'
        });
      }

      if (user.accountStatus === 'LOCKED') {
        return sendJson(res, 403, {
          success: false,
          message: 'Tài khoản nhân sự này hiện đang tạm khóa truy cập.'
        });
      }

      if (!verifyPassword(password, user.password)) {
        return sendJson(res, 401, {
          success: false,
          message: 'Mật khẩu truy cập không chính xác. Mặc định là 123456 nếu chưa đổi.'
        });
      }

      return sendJson(res, 200, {
        success: true,
        user: user
      });
    }

    // 5. Default 404 for unknown endpoints
    return sendJson(res, 404, { success: false, message: 'Endpoint not found' });
  } catch (err) {
    console.error('API Error:', err);
    return sendJson(res, 500, { success: false, message: err.message || 'Internal Server Error' });
  }
});

server.listen(PORT, () => {
  console.log(`[Mrex Server] Running on http://127.0.0.1:${PORT}`);
  console.log(`[Mrex Server] Ready to sync and store enterprise data permanently.`);
});

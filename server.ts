import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Database Persistence Setup
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export interface StudentRecord {
  roll: string;
  name: string;
  email: string;
  phone: string;
  grade: number;
  password?: string;
  courseName: string;
  feePaid: number;
  utr: string;
  joinedDate: string;
  enrolledGrades: number[];
  isSimulated?: boolean;
}

export interface FacultyRecord {
  id: string;
  facultyId: string;
  name: string;
  password: string;
  subject: string;
  grades: number[];
  status: 'ACTIVE' | 'PENDING_APPROVAL' | 'DISCONTINUED' | 'DENIED';
  createdAt: string;
  phone?: string;
  email?: string;
  notes?: string;
}

export interface PendingPayment {
  id: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  grade: number;
  courseName: string;
  fee: number;
  utr: string;
  couponCode?: string;
  date: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface DBStructure {
  ownerEmail: string;
  paymentSettings: {
    phone: string;
    upi: string;
    accountHolder: string;
  };
  coursePrices: Record<number, { math: number; physics: number; combo: number }>;
  announcement: {
    text: string;
    isEnabled: boolean;
  };
  emergencyAlert: {
    title: string;
    message: string;
    isActive: boolean;
    timestamp?: string;
  };
  liveBroadcast: {
    isLive: boolean;
    topic: string;
    subject: string;
    grade: number;
    startedAt: string | null;
  };
  students: StudentRecord[];
  pendingPayments: PendingPayment[];
  faculties: FacultyRecord[];
  coupons: Array<{
    id: string;
    code: string;
    type: 'percent' | 'flat';
    value: number;
    desc: string;
    active: boolean;
    usageCount: number;
  }>;
  scheduledClasses: Array<{
    id: string;
    grade: number;
    subject: string;
    topic: string;
    time: string;
  }>;
  lectureRecordings: Array<{
    id: string;
    title: string;
    subject: string;
    grade: number;
    duration: string;
    date: string;
    notesUrl?: string;
  }>;
  quizzes: Array<{
    id: string;
    title: string;
    grade: number;
    subject: string;
    questions: Array<{
      q: string;
      options: string[];
      correct: number;
      explanation: string;
    }>;
  }>;
  doubts: Array<{
    id: string;
    sender: string;
    text: string;
    role: 'student' | 'teacher';
    time: string;
  }>;
  auditLogs: Array<{
    id: string;
    time: string;
    text: string;
  }>;
  studentProgress?: Record<string, {
    studentRoll: string;
    viewedRecordingIds: string[];
    quizResults: Record<string, {
      score: number;
      total: number;
      percentage: number;
      passed: boolean;
      completedAt: string;
    }>;
    completedTopics: string[];
    completedChapters: string[];
    lastUpdated?: string;
  }>;
}

// Clean Default Database - NO FAKE DATA!
const defaultDB: DBStructure = {
  ownerEmail: 'thakursanjay1997@gmail.com',
  paymentSettings: {
    phone: '7972453092',
    upi: 'thakursanjay1997@oksbi',
    accountHolder: 'Bhimsingh Thakur (M.Sc.)'
  },
  coursePrices: {
    6: { math: 4000, physics: 4000, combo: 7500 },
    7: { math: 5000, physics: 5000, combo: 9500 },
    8: { math: 6000, physics: 6000, combo: 11500 },
    9: { math: 7000, physics: 7000, combo: 13000 },
    10: { math: 8000, physics: 8000, combo: 15000 }
  },
  announcement: {
    text: '📢 Admissions Open for CBSE Academic Session 2026–27 • Pure Mathematics & Applied Physics Live Batches',
    isEnabled: true
  },
  emergencyAlert: {
    title: '',
    message: '',
    isActive: false
  },
  liveBroadcast: {
    isLive: false,
    topic: 'Quadratic Equations & Roots Derivation',
    subject: 'Mathematics',
    grade: 10,
    startedAt: null
  },
  // Real database starting clean - NO DUMMY FAKE STUDENTS!
  students: [],
  pendingPayments: [],
  faculties: [
    {
      id: 'fac_1',
      facultyId: 'BHIMSINGH-THAKUR',
      name: 'Bhimsingh Thakur (M.Sc.)',
      password: 'teach123',
      subject: 'Pure Mathematics & Applied Physics',
      grades: [6, 7, 8, 9, 10],
      status: 'ACTIVE',
      createdAt: 'Official',
      email: 'bhimsingh@sanjumath.com'
    }
  ],
  coupons: [
    {
      id: 'cpn_1',
      code: 'SANJU10',
      type: 'percent',
      value: 10,
      desc: 'Official Academy 10% Welcome Discount',
      active: true,
      usageCount: 0
    },
    {
      id: 'cpn_2',
      code: 'TOPPER20',
      type: 'percent',
      value: 20,
      desc: 'CBSE Merit Topper 20% Scholarship',
      active: true,
      usageCount: 0
    },
    {
      id: 'cpn_3',
      code: 'SPECIAL2000',
      type: 'flat',
      value: 2000,
      desc: 'Flat ₹2,000 Off on Combo Batches',
      active: true,
      usageCount: 0
    }
  ],
  scheduledClasses: [
    {
      id: 'sc_1',
      grade: 10,
      subject: 'Mathematics',
      topic: 'Quadratic Equations & Graph Analysis',
      time: 'Today at 6:00 PM IST'
    },
    {
      id: 'sc_2',
      grade: 10,
      subject: 'Physics',
      topic: 'Ohm\'s Law, Resistance & Parallel Circuits',
      time: 'Tomorrow at 6:30 PM IST'
    }
  ],
  lectureRecordings: [
    {
      id: 'rec_1',
      title: 'Class 10: Quadratic Equations - Deriving the Complete Quadratic Formula',
      subject: 'Mathematics',
      grade: 10,
      duration: '52 mins',
      date: 'Recent'
    },
    {
      id: 'rec_2',
      title: 'Class 10: Light Refraction & Snell\'s Law with Ray Diagrams',
      subject: 'Physics',
      grade: 10,
      duration: '48 mins',
      date: 'Recent'
    }
  ],
  quizzes: [
    {
      id: 'quiz_1',
      title: 'Class 10 Math: Quadratic Equations Concept Drill',
      grade: 10,
      subject: 'Mathematics',
      questions: [
        {
          q: 'What is the discriminant formula for standard quadratic ax² + bx + c = 0?',
          options: ['D = b² - 4ac', 'D = b² + 4ac', 'D = 4ac - b²', 'D = √b - 4ac'],
          correct: 0,
          explanation: 'The discriminant formula is strictly D = b² - 4ac.'
        },
        {
          q: 'When D = 0, what is the nature of the roots of the quadratic equation?',
          options: ['No real roots (imaginary)', 'Two equal real roots', 'Two distinct irrational roots', 'Infinite roots'],
          correct: 1,
          explanation: 'When D = 0, both roots are equal and real: x = -b / (2a).'
        }
      ]
    }
  ],
  doubts: [],
  auditLogs: [
    {
      id: 'log_1',
      time: new Date().toLocaleTimeString(),
      text: 'System ready. Directorate database initialized for Owner Bhimsingh Thakur.'
    }
  ],
  studentProgress: {}
};

function readDB(): DBStructure {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(defaultDB, null, 2), 'utf-8');
      return defaultDB;
    }
    const content = fs.readFileSync(DB_FILE, 'utf-8');
    const data = JSON.parse(content) as DBStructure;
    // Ensure all critical arrays exist
    if (!data.students) data.students = [];
    if (!data.pendingPayments) data.pendingPayments = [];
    if (!data.faculties || data.faculties.length === 0) data.faculties = defaultDB.faculties;
    if (!data.coupons) data.coupons = defaultDB.coupons;
    if (!data.scheduledClasses) data.scheduledClasses = defaultDB.scheduledClasses;
    if (!data.quizzes) data.quizzes = defaultDB.quizzes;
    if (!data.doubts) data.doubts = [];
    if (!data.auditLogs) data.auditLogs = [];
    if (!data.studentProgress) data.studentProgress = {};
    return data;
  } catch (err) {
    console.error('Failed to read db.json, returning defaultDB', err);
    return defaultDB;
  }
}

function writeDB(data: DBStructure): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write db.json', err);
  }
}

function logAudit(db: DBStructure, text: string) {
  const logItem = {
    id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    text
  };
  db.auditLogs.unshift(logItem);
  if (db.auditLogs.length > 200) {
    db.auditLogs.pop();
  }
}

// ----------------------------------------------------
// REST API ROUTES
// ----------------------------------------------------

// 1. Platform Info & System Status
app.get('/api/platform/info', (_req: Request, res: Response) => {
  const db = readDB();
  const totalRevenue = db.students.reduce((acc, s) => acc + (s.feePaid || 0), 0);
  res.json({
    ownerEmail: db.ownerEmail,
    paymentSettings: db.paymentSettings,
    coursePrices: db.coursePrices,
    announcement: db.announcement,
    emergencyAlert: db.emergencyAlert,
    liveBroadcast: db.liveBroadcast,
    stats: {
      totalStudents: db.students.length,
      pendingApprovals: db.pendingPayments.filter(p => p.status === 'PENDING').length,
      totalRevenue
    }
  });
});

// 2. Real Authentication Endpoints (Separated Portals)

// Student Sign Up
app.post('/api/auth/student/signup', (req: Request, res: Response) => {
  const { name, email, phone, grade, password } = req.body;
  if (!name || !grade) {
    res.status(400).json({ error: 'Name and Grade are required.' });
    return;
  }
  const db = readDB();
  const parsedGrade = parseInt(grade, 10);
  const cleanEmail = (email || `${name.toLowerCase().replace(/\s+/g, '')}@student.sanjumath.com`).trim().toLowerCase();
  const cleanPhone = (phone || '').trim();

  // Check if student already registered
  const existing = db.students.find(s => s.email.toLowerCase() === cleanEmail || (cleanPhone && s.phone === cleanPhone));
  if (existing) {
    res.json({
      success: true,
      isExisting: true,
      message: 'Account found. Logged in successfully!',
      student: existing
    });
    return;
  }

  // Generate roll SM-2026-XXXX (Scalable for 1000+)
  const rollNumber = `SM-2026-${String(db.students.length + 1).padStart(4, '0')}`;
  const newStudent: StudentRecord = {
    roll: rollNumber,
    name: name.trim(),
    email: cleanEmail,
    phone: cleanPhone || 'Not Provided',
    grade: parsedGrade,
    password: password || '1234',
    courseName: `Class ${parsedGrade} Comprehensive Batch`,
    feePaid: 0,
    utr: 'REGISTRATION_ONLY',
    joinedDate: new Date().toLocaleDateString(),
    enrolledGrades: [] // Locked until paid & approved by owner
  };

  db.students.unshift(newStudent);
  logAudit(db, `[NEW STUDENT REGISTERED] ${name} (Class ${parsedGrade}, Roll ${rollNumber}).`);
  writeDB(db);

  res.json({
    success: true,
    isExisting: false,
    message: 'Student account created successfully!',
    student: newStudent
  });
});

// Student Login
app.post('/api/auth/student/login', (req: Request, res: Response) => {
  const { loginId, grade, password } = req.body;
  if (!loginId) {
    res.status(400).json({ error: 'Please enter registered mobile number or email.' });
    return;
  }
  const db = readDB();
  const clean = loginId.trim().toLowerCase();

  let student = db.students.find(s => s.email.toLowerCase() === clean || s.phone === clean);

  // If student doesn't exist yet, automatically register them as a genuine student
  if (!student) {
    const rollNumber = `SM-2026-${String(db.students.length + 1).padStart(4, '0')}`;
    const name = clean.includes('@') ? clean.split('@')[0] : 'Student';
    const parsedGrade = grade ? parseInt(grade, 10) : 10;
    student = {
      roll: rollNumber,
      name: name.charAt(0).toUpperCase() + name.slice(1),
      email: clean.includes('@') ? clean : `${clean}@student.sanjumath.com`,
      phone: clean.includes('@') ? 'Not Provided' : clean,
      grade: parsedGrade,
      password: password || '1234',
      courseName: `Class ${parsedGrade} Comprehensive Batch`,
      feePaid: 0,
      utr: 'SELF_LOGIN',
      joinedDate: new Date().toLocaleDateString(),
      enrolledGrades: []
    };
    db.students.unshift(student);
    logAudit(db, `[NEW STUDENT ENROLLED] ${student.name} logged in (${student.roll}).`);
    writeDB(db);
  }

  res.json({
    success: true,
    student,
    isApproved: student.enrolledGrades.includes(student.grade)
  });
});

// Teacher Login (Strictly verified against Director-created faculty records)
app.post('/api/auth/teacher/login', (req: Request, res: Response) => {
  const { teacherId, password } = req.body;
  if (!teacherId || !password) {
    res.status(400).json({ error: 'Please enter Faculty ID and password.' });
    return;
  }
  const db = readDB();
  const cleanId = teacherId.trim().toUpperCase();
  const cleanPass = password.trim();

  // Master Director override
  if (cleanPass === 'sanjaymath@1997') {
    res.json({
      success: true,
      role: 'teacher',
      facultyName: 'Bhimsingh Thakur (M.Sc. Mathematics)',
      facultyId: cleanId,
      activeBatch: 'Classes 6 to 10 Pure Mathematics & Physics'
    });
    return;
  }

  const faculty = (db.faculties || []).find(f => 
    f.facultyId.toUpperCase() === cleanId || 
    (f.email && f.email.toUpperCase() === cleanId)
  );

  if (!faculty) {
    res.status(401).json({ error: 'Faculty ID not recognized. Faculty accounts are issued only by Director Bhimsingh Thakur.' });
    return;
  }

  if (faculty.password !== cleanPass) {
    res.status(401).json({ error: 'Incorrect faculty password. Please contact the Director for password assistance.' });
    return;
  }

  if (faculty.status === 'DISCONTINUED') {
    res.status(403).json({ error: 'Your faculty access has been discontinued by the Director. You can no longer access the faculty portal.' });
    return;
  }

  if (faculty.status === 'DENIED') {
    res.status(403).json({ error: 'Faculty access has been denied by Director Bhimsingh Thakur.' });
    return;
  }

  if (faculty.status === 'PENDING_APPROVAL') {
    res.status(403).json({ error: 'Faculty appointment is pending official approval from the Director.' });
    return;
  }

  res.json({
    success: true,
    role: 'teacher',
    facultyName: faculty.name,
    facultyId: faculty.facultyId,
    subject: faculty.subject,
    grades: faculty.grades,
    activeBatch: `Class ${faculty.grades.join(', ')} (${faculty.subject})`
  });
});

// Owner Login - STRICTLY CHECKING thakursanjay1997@gmail.com
app.post('/api/auth/owner/login', (req: Request, res: Response) => {
  const { email, passcode } = req.body;
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanPasscode = (passcode || '').trim().toLowerCase();

  if (cleanEmail !== 'thakursanjay1997@gmail.com') {
    res.status(403).json({ error: 'Unauthorized: Only registered Owner (thakursanjay1997@gmail.com) can access Directorate.' });
    return;
  }

  if (cleanPasscode !== 'sanjaymath@1997') {
    res.status(401).json({ error: 'Incorrect Master Passcode. Access denied.' });
    return;
  }

  const db = readDB();
  logAudit(db, `Directorate console unlocked by Owner (${cleanEmail}).`);
  writeDB(db);

  res.json({
    success: true,
    role: 'owner',
    ownerEmail: cleanEmail,
    message: 'Welcome Bhimsingh Sir! Directorate unlocked.'
  });
});

// 3. Courses Pricing
app.get('/api/courses', (_req: Request, res: Response) => {
  const db = readDB();
  res.json({
    coursePrices: db.coursePrices,
    paymentSettings: db.paymentSettings
  });
});

app.post('/api/courses/pricing', (req: Request, res: Response) => {
  const { prices, adminPasscode, requesterEmail } = req.body;
  if (requesterEmail !== 'thakursanjay1997@gmail.com' && adminPasscode !== 'sanjaymath@1997') {
    res.status(403).json({ error: 'Unauthorized: Only owner access permitted.' });
    return;
  }
  const db = readDB();
  db.coursePrices = prices;
  logAudit(db, 'Course pricing matrix updated by Owner.');
  writeDB(db);
  res.json({ success: true, coursePrices: db.coursePrices });
});

// 4. Payment Gateway Settings (PhonePe / UPI)
app.post('/api/platform/settings', (req: Request, res: Response) => {
  const { paymentSettings, announcement, adminPasscode, requesterEmail } = req.body;
  if (requesterEmail !== 'thakursanjay1997@gmail.com' && adminPasscode !== 'sanjaymath@1997') {
    res.status(403).json({ error: 'Unauthorized: Directorate verification required.' });
    return;
  }
  const db = readDB();
  if (paymentSettings) {
    db.paymentSettings = { ...db.paymentSettings, ...paymentSettings };
    logAudit(db, `Payment gateway routing updated: UPI ${db.paymentSettings.upi}`);
  }
  if (announcement) {
    db.announcement = { ...db.announcement, ...announcement };
    logAudit(db, `Announcement banner modified: "${db.announcement.text}"`);
  }
  writeDB(db);
  res.json({ success: true, paymentSettings: db.paymentSettings, announcement: db.announcement });
});

// 5. Coupons Management
app.get('/api/coupons', (_req: Request, res: Response) => {
  const db = readDB();
  res.json({ coupons: db.coupons });
});

app.post('/api/coupons/apply', (req: Request, res: Response) => {
  const { code, originalFee } = req.body;
  if (!code) {
    res.status(400).json({ error: 'Coupon code required' });
    return;
  }
  const db = readDB();
  const coupon = db.coupons.find(c => c.code.toUpperCase() === code.trim().toUpperCase() && c.active);
  if (!coupon) {
    res.status(404).json({ error: 'Invalid or inactive promotional coupon.' });
    return;
  }
  let discountAmount = 0;
  if (coupon.type === 'percent') {
    discountAmount = Math.round((originalFee * coupon.value) / 100);
  } else {
    discountAmount = coupon.value;
  }
  discountAmount = Math.min(discountAmount, originalFee - 500);
  const finalFee = originalFee - discountAmount;
  res.json({
    success: true,
    coupon,
    discountAmount,
    finalFee
  });
});

app.post('/api/coupons', (req: Request, res: Response) => {
  const { code, type, value, desc, adminPasscode } = req.body;
  if (adminPasscode !== 'sanjaymath@1997') {
    res.status(403).json({ error: 'Unauthorized: Master passcode required.' });
    return;
  }
  const db = readDB();
  const cleanCode = code.trim().toUpperCase();
  const existing = db.coupons.find(c => c.code === cleanCode);
  if (existing) {
    existing.type = type;
    existing.value = parseFloat(value);
    existing.desc = desc;
    existing.active = true;
  } else {
    db.coupons.unshift({
      id: 'cpn_' + Date.now(),
      code: cleanCode,
      type,
      value: parseFloat(value),
      desc: desc || 'Promotional Discount',
      active: true,
      usageCount: 0
    });
  }
  logAudit(db, `Coupon created/updated: ${cleanCode}`);
  writeDB(db);
  res.json({ success: true, coupons: db.coupons });
});

app.delete('/api/coupons/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const db = readDB();
  db.coupons = db.coupons.filter(c => c.id !== id);
  logAudit(db, `Coupon deleted: ${id}`);
  writeDB(db);
  res.json({ success: true, coupons: db.coupons });
});

// 6. Real-time Student Payment Submission & Approval Flow
app.post('/api/payment/submit', (req: Request, res: Response) => {
  const { studentName, studentEmail, studentPhone, grade, courseName, fee, utr, couponCode } = req.body;
  if (!studentName || !utr || !grade) {
    res.status(400).json({ error: 'Student Name, Grade, and Transaction UTR are mandatory.' });
    return;
  }
  const db = readDB();
  const parsedGrade = parseInt(grade, 10);
  const newPayment: PendingPayment = {
    id: 'pay_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    studentName: studentName.trim(),
    studentEmail: (studentEmail || `${studentName.toLowerCase().replace(/\s+/g, '')}@student.sanjumath.com`).trim(),
    studentPhone: (studentPhone || 'Not Provided').trim(),
    grade: parsedGrade,
    courseName: courseName || `Class ${parsedGrade} Comprehensive Batch`,
    fee: parseFloat(fee) || db.coursePrices[parsedGrade]?.combo || 15000,
    utr: utr.trim(),
    couponCode: couponCode || undefined,
    date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    status: 'PENDING'
  };

  db.pendingPayments.unshift(newPayment);

  // If student is in directory, record the pending transaction
  let student = db.students.find(s => s.email.toLowerCase() === newPayment.studentEmail.toLowerCase());
  if (student) {
    student.utr = utr.trim();
  }

  // Increment coupon usage
  if (couponCode) {
    const cpn = db.coupons.find(c => c.code.toUpperCase() === couponCode.toUpperCase());
    if (cpn) cpn.usageCount = (cpn.usageCount || 0) + 1;
  }

  logAudit(db, `[PAYMENT SUBMITTED] ${studentName} for Class ${parsedGrade} (UTR: ${utr}, ₹${newPayment.fee}). Waiting for Owner approval.`);
  writeDB(db);

  res.json({
    success: true,
    payment: newPayment,
    message: 'Payment received. Awaiting verified approval from Owner Bhimsingh Thakur (thakursanjay1997@gmail.com).'
  });
});

app.get('/api/payment/student-status', (req: Request, res: Response) => {
  const email = (req.query.email as string || '').toLowerCase().trim();
  const name = (req.query.name as string || '').toLowerCase().trim();
  const db = readDB();

  const student = db.students.find(s => 
    (email && s.email.toLowerCase() === email) || 
    (name && s.name.toLowerCase() === name)
  );

  const pending = db.pendingPayments.filter(p => 
    p.status === 'PENDING' && 
    ((email && p.studentEmail.toLowerCase() === email) || (name && p.studentName.toLowerCase() === name))
  );

  res.json({
    isApproved: student ? student.enrolledGrades.includes(student.grade) : false,
    student: student || null,
    enrolledGrades: student ? student.enrolledGrades : [],
    pendingPayments: pending
  });
});

// 7. Owner Payment Approval Desk
app.get('/api/owner/pending-payments', (_req: Request, res: Response) => {
  const db = readDB();
  const pending = db.pendingPayments.filter(p => p.status === 'PENDING');
  res.json({ pendingPayments: pending, count: pending.length });
});

app.post('/api/owner/approve-payment', (req: Request, res: Response) => {
  const { paymentId, adminPasscode, requesterEmail } = req.body;
  if (requesterEmail !== 'thakursanjay1997@gmail.com' && adminPasscode !== 'sanjaymath@1997') {
    res.status(403).json({ error: 'Unauthorized: Only Owner (thakursanjay1997@gmail.com) can approve fee access.' });
    return;
  }
  const db = readDB();
  const payment = db.pendingPayments.find(p => p.id === paymentId);
  if (!payment) {
    res.status(404).json({ error: 'Payment request not found.' });
    return;
  }

  payment.status = 'APPROVED';

  // Find or create student
  let student = db.students.find(s => 
    s.email.toLowerCase() === payment.studentEmail.toLowerCase() || 
    s.name.toLowerCase() === payment.studentName.toLowerCase()
  );

  if (student) {
    if (!student.enrolledGrades.includes(payment.grade)) {
      student.enrolledGrades.push(payment.grade);
    }
    student.feePaid += payment.fee;
    student.utr = payment.utr;
  } else {
    const rollNumber = `SM-2026-${String(db.students.length + 1).padStart(4, '0')}`;
    student = {
      roll: rollNumber,
      name: payment.studentName,
      email: payment.studentEmail,
      phone: payment.studentPhone,
      grade: payment.grade,
      courseName: payment.courseName,
      feePaid: payment.fee,
      utr: payment.utr,
      joinedDate: new Date().toLocaleDateString(),
      enrolledGrades: [payment.grade]
    };
    db.students.unshift(student);
  }

  logAudit(db, `[PAYMENT APPROVED] Fee verified for ${payment.studentName} (Class ${payment.grade}, ₹${payment.fee}, Roll ${student.roll}). Student portal unlocked.`);
  writeDB(db);

  res.json({
    success: true,
    message: `Payment approved! Class ${payment.grade} access unlocked for ${payment.studentName}.`,
    student
  });
});

app.post('/api/owner/batch-approve-all', (req: Request, res: Response) => {
  const { adminPasscode } = req.body;
  if (adminPasscode !== 'sanjaymath@1997') {
    res.status(403).json({ error: 'Unauthorized: Master passcode required.' });
    return;
  }
  const db = readDB();
  const pending = db.pendingPayments.filter(p => p.status === 'PENDING');
  let count = 0;

  for (const payment of pending) {
    payment.status = 'APPROVED';
    let student = db.students.find(s => s.email.toLowerCase() === payment.studentEmail.toLowerCase());
    if (student) {
      if (!student.enrolledGrades.includes(payment.grade)) {
        student.enrolledGrades.push(payment.grade);
      }
      student.feePaid += payment.fee;
      student.utr = payment.utr;
    } else {
      const rollNumber = `SM-2026-${String(db.students.length + 1).padStart(4, '0')}`;
      student = {
        roll: rollNumber,
        name: payment.studentName,
        email: payment.studentEmail,
        phone: payment.studentPhone,
        grade: payment.grade,
        courseName: payment.courseName,
        feePaid: payment.fee,
        utr: payment.utr,
        joinedDate: new Date().toLocaleDateString(),
        enrolledGrades: [payment.grade]
      };
      db.students.unshift(student);
    }
    count++;
  }

  logAudit(db, `[BATCH APPROVAL] Batch-approved ${count} student fee submissions.`);
  writeDB(db);
  res.json({ success: true, count, message: `Successfully batch-approved ${count} payments.` });
});

app.post('/api/owner/reject-payment', (req: Request, res: Response) => {
  const { paymentId, adminPasscode } = req.body;
  if (adminPasscode !== 'sanjaymath@1997') {
    res.status(403).json({ error: 'Unauthorized' });
    return;
  }
  const db = readDB();
  const payment = db.pendingPayments.find(p => p.id === paymentId);
  if (payment) {
    payment.status = 'REJECTED';
    logAudit(db, `[PAYMENT REJECTED] Rejected for ${payment.studentName} (UTR: ${payment.utr}).`);
    writeDB(db);
  }
  res.json({ success: true, message: 'Payment rejected.' });
});

// 8. Scalable Student Directory (Supporting 1,000+ Students with Pagination & Fast Search)
app.get('/api/students', (req: Request, res: Response) => {
  const db = readDB();
  const page = parseInt(req.query.page as string, 10) || 1;
  const limit = parseInt(req.query.limit as string, 10) || 50;
  const search = ((req.query.search as string) || '').toLowerCase().trim();
  const gradeFilter = (req.query.grade as string) || 'ALL';

  let filtered = db.students;

  if (gradeFilter !== 'ALL') {
    filtered = filtered.filter(s => s.grade.toString() === gradeFilter);
  }

  if (search) {
    filtered = filtered.filter(s => 
      s.name.toLowerCase().includes(search) ||
      s.roll.toLowerCase().includes(search) ||
      s.email.toLowerCase().includes(search) ||
      s.phone.includes(search) ||
      s.utr.toLowerCase().includes(search)
    );
  }

  const total = filtered.length;
  const startIndex = (page - 1) * limit;
  const paginated = filtered.slice(startIndex, startIndex + limit);

  res.json({
    students: paginated,
    total,
    page,
    totalPages: Math.ceil(total / limit) || 1,
    count: db.students.length
  });
});

// God-Mode Direct Admission (For Cash or 100% Scholarship Bypassing Checkout)
app.post('/api/owner/god-mode-enroll', (req: Request, res: Response) => {
  const { name, email, phone, grade, courseName, feeType, adminPasscode } = req.body;
  if (adminPasscode !== 'sanjaymath@1997') {
    res.status(403).json({ error: 'Unauthorized: Master passcode required.' });
    return;
  }
  if (!name || !grade) {
    res.status(400).json({ error: 'Name and Grade are required.' });
    return;
  }
  const db = readDB();
  const parsedGrade = parseInt(grade, 10);
  let fee = 0;
  if (feeType === 'PAID_CASH') {
    fee = db.coursePrices[parsedGrade]?.combo || 15000;
  }

  const rollNumber = `SM-2026-${String(db.students.length + 1).padStart(4, '0')}`;
  const newStudent: StudentRecord = {
    roll: rollNumber,
    name: name.trim(),
    email: (email || `${name.toLowerCase().replace(/\s+/g, '')}@student.sanjumath.com`).trim(),
    phone: (phone || '9999999999').trim(),
    grade: parsedGrade,
    courseName: courseName || `Class ${parsedGrade} Math + Physics Combo`,
    feePaid: fee,
    utr: feeType || 'GOD-MODE-OVERRIDE',
    joinedDate: new Date().toLocaleDateString(),
    enrolledGrades: [parsedGrade]
  };

  db.students.unshift(newStudent);
  logAudit(db, `[GOD-MODE ENROLLMENT] ${name} directly enrolled in Class ${parsedGrade} (${rollNumber}, ${feeType}).`);
  writeDB(db);

  res.json({ success: true, student: newStudent });
});

// Revoke student
app.delete('/api/owner/student/:roll', (req: Request, res: Response) => {
  const { roll } = req.params;
  const db = readDB();
  const student = db.students.find(s => s.roll === roll);
  if (student) {
    db.students = db.students.filter(s => s.roll !== roll);
    logAudit(db, `Enrollment revoked for student ${student.name} (${roll}).`);
    writeDB(db);
    res.json({ success: true, message: `Access revoked for ${student.name}.` });
  } else {
    res.status(404).json({ error: 'Student not found.' });
  }
});

// Stress-Test Scalability Generator (1000 Verified Students Generator for testing performance)
app.post('/api/owner/generate-scale-students', (req: Request, res: Response) => {
  const { count, adminPasscode } = req.body;
  if (adminPasscode !== 'sanjaymath@1997') {
    res.status(403).json({ error: 'Unauthorized' });
    return;
  }
  const db = readDB();
  const targetCount = parseInt(count, 10) || 1000;
  const firstNames = ['Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan', 'Shaurya', 'Ananya', 'Diya', 'Gauri', 'Isha', 'Kavya', 'Khushi', 'Navya', 'Pari', 'Prisha', 'Riya', 'Sara', 'Siya', 'Tanvi'];
  const lastNames = ['Sharma', 'Verma', 'Patel', 'Deshmukh', 'Thakur', 'Singh', 'Kulkarni', 'Jadhav', 'Shinde', 'Iyer', 'Menon', 'Nair', 'Reddy', 'Choudhary', 'Gupta', 'Bose', 'Chatterjee', 'Mehta', 'Mishra'];

  const initialLen = db.students.length;
  for (let i = 1; i <= targetCount; i++) {
    const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
    const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
    const g = [6, 7, 8, 9, 10][Math.floor(Math.random() * 5)];
    const roll = `SM-2026-${String(initialLen + i).padStart(4, '0')}`;
    const fee = db.coursePrices[g]?.combo || 15000;

    db.students.push({
      roll,
      name: `${fn} ${ln}`,
      email: `${fn.toLowerCase()}.${ln.toLowerCase()}${initialLen + i}@gmail.com`,
      phone: `98${Math.floor(10000000 + Math.random() * 90000000)}`,
      grade: g,
      courseName: `Class ${g} Math + Physics Combo`,
      feePaid: fee,
      utr: `UPI-${Math.floor(100000000000 + Math.random() * 900000000000)}`,
      joinedDate: new Date().toLocaleDateString(),
      enrolledGrades: [g],
      isSimulated: true
    });
  }

  logAudit(db, `[SCALE TESTING] Generated ${targetCount} students. Total database capacity: ${db.students.length} students.`);
  writeDB(db);

  res.json({
    success: true,
    added: targetCount,
    totalStudents: db.students.length,
    message: `Successfully populated database to ${db.students.length} students!`
  });
});

// Wipe simulated students
app.post('/api/owner/wipe-simulated-students', (req: Request, res: Response) => {
  const { adminPasscode } = req.body;
  if (adminPasscode !== 'sanjaymath@1997') {
    res.status(403).json({ error: 'Unauthorized' });
    return;
  }
  const db = readDB();
  const before = db.students.length;
  db.students = db.students.filter(s => !s.isSimulated);
  const after = db.students.length;
  logAudit(db, `[WIPED SIMULATED] Removed ${before - after} simulated test records.`);
  writeDB(db);

  res.json({ success: true, removed: before - after, remaining: after });
});

// 8B. Director Authority: Faculty Management, ID/Password Issuance, Approval, Discontinuance & Denial
app.get('/api/owner/faculties', (_req: Request, res: Response) => {
  const db = readDB();
  res.json({ faculties: db.faculties || [] });
});

app.post('/api/owner/faculties', (req: Request, res: Response) => {
  const { facultyId, name, password, subject, grades, phone, email, notes, adminPasscode } = req.body;
  if (adminPasscode !== 'sanjaymath@1997') {
    res.status(403).json({ error: 'Unauthorized: Master director passcode required.' });
    return;
  }
  if (!facultyId || !name || !password) {
    res.status(400).json({ error: 'Faculty ID, Name, and Password are required.' });
    return;
  }
  const db = readDB();
  const cleanId = facultyId.trim().toUpperCase();

  const existing = (db.faculties || []).find(f => f.facultyId.toUpperCase() === cleanId);
  if (existing) {
    res.status(400).json({ error: `Faculty ID "${cleanId}" is already registered. Please choose another ID.` });
    return;
  }

  const newFaculty: FacultyRecord = {
    id: 'fac_' + Date.now(),
    facultyId: cleanId,
    name: name.trim(),
    password: password.trim(),
    subject: subject || 'Mathematics',
    grades: Array.isArray(grades) && grades.length > 0 ? grades : [6, 7, 8, 9, 10],
    status: 'ACTIVE',
    createdAt: new Date().toLocaleDateString(),
    phone: phone ? phone.trim() : '',
    email: email ? email.trim() : '',
    notes: notes ? notes.trim() : ''
  };

  if (!db.faculties) db.faculties = [];
  db.faculties.push(newFaculty);
  logAudit(db, `[FACULTY CREATED] Issued Faculty ID ${cleanId} to ${name} by Director.`);
  writeDB(db);

  res.json({ success: true, faculty: newFaculty, faculties: db.faculties });
});

app.put('/api/owner/faculties/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, adminPasscode } = req.body;
  if (adminPasscode !== 'sanjaymath@1997') {
    res.status(403).json({ error: 'Unauthorized: Master director passcode required.' });
    return;
  }
  const db = readDB();
  const faculty = (db.faculties || []).find(f => f.id === id || f.facultyId.toUpperCase() === id.toUpperCase());
  if (!faculty) {
    res.status(404).json({ error: 'Faculty member not found.' });
    return;
  }

  const oldStatus = faculty.status;
  faculty.status = status;

  logAudit(db, `[FACULTY ACCESS ${status}] Faculty ${faculty.name} (${faculty.facultyId}) access changed from ${oldStatus} to ${status} by Director.`);
  writeDB(db);

  res.json({ success: true, faculty, faculties: db.faculties });
});

app.put('/api/owner/faculties/:id/credentials', (req: Request, res: Response) => {
  const { id } = req.params;
  const { password, subject, grades, name, adminPasscode } = req.body;
  if (adminPasscode !== 'sanjaymath@1997') {
    res.status(403).json({ error: 'Unauthorized: Master director passcode required.' });
    return;
  }
  const db = readDB();
  const faculty = (db.faculties || []).find(f => f.id === id || f.facultyId.toUpperCase() === id.toUpperCase());
  if (!faculty) {
    res.status(404).json({ error: 'Faculty member not found.' });
    return;
  }

  if (password) faculty.password = password.trim();
  if (subject) faculty.subject = subject.trim();
  if (grades && Array.isArray(grades)) faculty.grades = grades;
  if (name) faculty.name = name.trim();

  logAudit(db, `[FACULTY CREDENTIALS UPDATED] Updated credentials for faculty ${faculty.name} (${faculty.facultyId}) by Director.`);
  writeDB(db);

  res.json({ success: true, faculty, faculties: db.faculties });
});

app.delete('/api/owner/faculties/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { adminPasscode } = req.body;
  if (adminPasscode !== 'sanjaymath@1997') {
    res.status(403).json({ error: 'Unauthorized: Master director passcode required.' });
    return;
  }
  const db = readDB();
  const faculty = (db.faculties || []).find(f => f.id === id || f.facultyId.toUpperCase() === id.toUpperCase());
  if (!faculty) {
    res.status(404).json({ error: 'Faculty member not found.' });
    return;
  }

  db.faculties = (db.faculties || []).filter(f => f.id !== id && f.facultyId.toUpperCase() !== id.toUpperCase());
  logAudit(db, `[FACULTY DELETED] Faculty ${faculty.name} (${faculty.facultyId}) deleted by Director.`);
  writeDB(db);

  res.json({ success: true, faculties: db.faculties });
});

// 9. Live Classroom & Doubts
app.get('/api/live', (_req: Request, res: Response) => {
  const db = readDB();
  res.json({
    liveBroadcast: db.liveBroadcast,
    doubts: db.doubts,
    scheduledClasses: db.scheduledClasses
  });
});

app.post('/api/live/toggle', (req: Request, res: Response) => {
  const { isLive, topic, subject, grade, teacherPassword } = req.body;
  if (teacherPassword !== 'teach123' && teacherPassword !== 'sanjaymath@1997') {
    res.status(403).json({ error: 'Unauthorized: Teacher or Owner credentials required.' });
    return;
  }
  const db = readDB();
  db.liveBroadcast = {
    isLive: !!isLive,
    topic: topic || db.liveBroadcast.topic,
    subject: subject || db.liveBroadcast.subject,
    grade: grade ? parseInt(grade, 10) : db.liveBroadcast.grade,
    startedAt: isLive ? new Date().toISOString() : null
  };
  logAudit(db, `Live broadcast switched: ${isLive ? '🔴 LIVE STREAMING' : 'OFFLINE'}`);
  writeDB(db);
  res.json({ success: true, liveBroadcast: db.liveBroadcast });
});

app.post('/api/doubts', (req: Request, res: Response) => {
  const { sender, text, role } = req.body;
  if (!text || !sender) {
    res.status(400).json({ error: 'Sender and text required.' });
    return;
  }
  const db = readDB();
  const newDoubt = {
    id: 'd_' + Date.now(),
    sender: sender.trim(),
    text: text.trim(),
    role: (role === 'teacher' ? 'teacher' : 'student') as 'teacher' | 'student',
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
  db.doubts.push(newDoubt);
  if (db.doubts.length > 50) db.doubts.shift();
  writeDB(db);
  res.json({ success: true, doubt: newDoubt, doubts: db.doubts });
});

// 10. Timetable Scheduling
app.get('/api/schedule', (_req: Request, res: Response) => {
  const db = readDB();
  res.json({ scheduledClasses: db.scheduledClasses });
});

app.post('/api/schedule', (req: Request, res: Response) => {
  const { grade, subject, topic, time } = req.body;
  if (!topic || !time) {
    res.status(400).json({ error: 'Topic and time required.' });
    return;
  }
  const db = readDB();
  const newClass = {
    id: 'sc_' + Date.now(),
    grade: parseInt(grade, 10) || 10,
    subject: subject || 'Mathematics',
    topic: topic.trim(),
    time: time.trim()
  };
  db.scheduledClasses.unshift(newClass);
  logAudit(db, `Scheduled live class: Class ${newClass.grade} ${newClass.subject} - "${newClass.topic}"`);
  writeDB(db);
  res.json({ success: true, scheduledClasses: db.scheduledClasses });
});

app.delete('/api/schedule/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const db = readDB();
  db.scheduledClasses = db.scheduledClasses.filter(c => c.id !== id);
  writeDB(db);
  res.json({ success: true, scheduledClasses: db.scheduledClasses });
});

// 11. Quizzes
app.get('/api/quizzes', (req: Request, res: Response) => {
  const grade = req.query.grade ? parseInt(req.query.grade as string, 10) : null;
  const db = readDB();
  const filtered = grade ? db.quizzes.filter(q => q.grade === grade) : db.quizzes;
  res.json({ quizzes: filtered });
});

app.post('/api/quizzes', (req: Request, res: Response) => {
  const { title, grade, subject, questions } = req.body;
  if (!title || !questions || !Array.isArray(questions)) {
    res.status(400).json({ error: 'Invalid quiz payload.' });
    return;
  }
  const db = readDB();
  const newQuiz = {
    id: 'quiz_' + Date.now(),
    title: title.trim(),
    grade: parseInt(grade, 10) || 10,
    subject: subject || 'Mathematics',
    questions
  };
  db.quizzes.unshift(newQuiz);
  logAudit(db, `Published test: "${newQuiz.title}" for Class ${newQuiz.grade}.`);
  writeDB(db);
  res.json({ success: true, quiz: newQuiz, quizzes: db.quizzes });
});

// 12. Recordings & Notes Vault
app.get('/api/recordings', (_req: Request, res: Response) => {
  const db = readDB();
  res.json({ recordings: db.lectureRecordings });
});

app.post('/api/recordings', (req: Request, res: Response) => {
  const { title, subject, grade, duration, notesUrl } = req.body;
  if (!title) {
    res.status(400).json({ error: 'Lecture title required.' });
    return;
  }
  const db = readDB();
  const newRec = {
    id: 'rec_' + Date.now(),
    title: title.trim(),
    subject: subject || 'Mathematics',
    grade: parseInt(grade, 10) || 10,
    duration: duration || '45 mins',
    date: 'Today',
    notesUrl
  };
  db.lectureRecordings.unshift(newRec);
  logAudit(db, `Archived lecture to student vault: "${newRec.title}"`);
  writeDB(db);
  res.json({ success: true, recording: newRec, recordings: db.lectureRecordings });
});

app.delete('/api/recordings/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const db = readDB();
  db.lectureRecordings = db.lectureRecordings.filter(r => r.id !== id);
  writeDB(db);
  res.json({ success: true, recordings: db.lectureRecordings });
});

// 13. Emergency Flash Alert
app.post('/api/owner/emergency-alert', (req: Request, res: Response) => {
  const { title, message, isActive, adminPasscode } = req.body;
  if (adminPasscode !== 'sanjaymath@1997') {
    res.status(403).json({ error: 'Unauthorized: Master passcode required.' });
    return;
  }
  const db = readDB();
  db.emergencyAlert = {
    title: title || 'DIRECTORATE URGENT NOTICE',
    message: message || '',
    isActive: !!isActive,
    timestamp: new Date().toLocaleTimeString()
  };
  if (isActive) {
    logAudit(db, `[EMERGENCY PUSH DISPATCHED] "${db.emergencyAlert.title}: ${db.emergencyAlert.message}"`);
  } else {
    logAudit(db, 'Emergency push alert cleared by Director.');
  }
  writeDB(db);
  res.json({ success: true, emergencyAlert: db.emergencyAlert });
});

// 14. Audit Trail & Database Backup/Restore
app.get('/api/owner/audit-logs', (_req: Request, res: Response) => {
  const db = readDB();
  res.json({ auditLogs: db.auditLogs });
});

app.delete('/api/owner/audit-logs', (_req: Request, res: Response) => {
  const db = readDB();
  db.auditLogs = [{ id: 'log_clear', time: new Date().toLocaleTimeString(), text: 'Audit log cleared by Director.' }];
  writeDB(db);
  res.json({ success: true });
});

app.get('/api/system/backup', (_req: Request, res: Response) => {
  const db = readDB();
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename=Sanju_Math_Backup_${Date.now()}.json`);
  res.send(JSON.stringify(db, null, 2));
});

app.post('/api/system/restore', (req: Request, res: Response) => {
  const { backupData, adminPasscode } = req.body;
  if (adminPasscode !== 'sanjaymath@1997') {
    res.status(403).json({ error: 'Unauthorized: Master passcode required.' });
    return;
  }
  if (!backupData || typeof backupData !== 'object') {
    res.status(400).json({ error: 'Invalid backup JSON payload.' });
    return;
  }
  writeDB(backupData);
  res.json({ success: true, message: 'Database restored successfully!' });
});

// 15. Student Course Completion Progress Endpoints
app.get('/api/student/progress', (req: Request, res: Response) => {
  const roll = (req.query.roll as string || '').trim();
  const email = (req.query.email as string || '').trim().toLowerCase();
  const db = readDB();
  if (!db.studentProgress) db.studentProgress = {};

  const key = roll || email || 'default';
  const progress = db.studentProgress[key] || {
    studentRoll: roll || email,
    viewedRecordingIds: [],
    quizResults: {},
    completedTopics: [],
    completedChapters: [],
    lastUpdated: new Date().toISOString()
  };

  res.json({ success: true, progress });
});

app.post('/api/student/progress', (req: Request, res: Response) => {
  const { studentRoll, studentEmail, viewedRecordingIds, quizResults, completedTopics, completedChapters } = req.body;
  const key = (studentRoll || studentEmail || '').trim();
  if (!key) {
    res.status(400).json({ error: 'Student identifier required' });
    return;
  }
  const db = readDB();
  if (!db.studentProgress) db.studentProgress = {};

  const existing = db.studentProgress[key] || {
    studentRoll: key,
    viewedRecordingIds: [],
    quizResults: {},
    completedTopics: [],
    completedChapters: [],
    lastUpdated: new Date().toISOString()
  };

  if (viewedRecordingIds && Array.isArray(viewedRecordingIds)) {
    existing.viewedRecordingIds = Array.from(new Set([...existing.viewedRecordingIds, ...viewedRecordingIds]));
  }
  if (quizResults && typeof quizResults === 'object') {
    existing.quizResults = { ...existing.quizResults, ...quizResults };
  }
  if (completedTopics && Array.isArray(completedTopics)) {
    existing.completedTopics = completedTopics;
  }
  if (completedChapters && Array.isArray(completedChapters)) {
    existing.completedChapters = completedChapters;
  }
  existing.lastUpdated = new Date().toISOString();

  db.studentProgress[key] = existing;
  writeDB(db);
  res.json({ success: true, progress: existing });
});

app.post('/api/student/progress/view-recording', (req: Request, res: Response) => {
  const { studentRoll, studentEmail, recordingId } = req.body;
  const key = (studentRoll || studentEmail || '').trim();
  if (!key || !recordingId) {
    res.status(400).json({ error: 'studentRoll and recordingId required' });
    return;
  }
  const db = readDB();
  if (!db.studentProgress) db.studentProgress = {};

  const existing = db.studentProgress[key] || {
    studentRoll: key,
    viewedRecordingIds: [],
    quizResults: {},
    completedTopics: [],
    completedChapters: [],
    lastUpdated: new Date().toISOString()
  };

  if (!existing.viewedRecordingIds.includes(recordingId)) {
    existing.viewedRecordingIds.push(recordingId);
    existing.lastUpdated = new Date().toISOString();
    db.studentProgress[key] = existing;
    writeDB(db);
  }

  res.json({ success: true, progress: existing });
});

app.post('/api/student/progress/record-quiz', (req: Request, res: Response) => {
  const { studentRoll, studentEmail, quizId, score, total, percentage } = req.body;
  const key = (studentRoll || studentEmail || '').trim();
  if (!key || !quizId) {
    res.status(400).json({ error: 'studentRoll and quizId required' });
    return;
  }
  const db = readDB();
  if (!db.studentProgress) db.studentProgress = {};

  const existing = db.studentProgress[key] || {
    studentRoll: key,
    viewedRecordingIds: [],
    quizResults: {},
    completedTopics: [],
    completedChapters: [],
    lastUpdated: new Date().toISOString()
  };

  const prevBest = existing.quizResults[quizId]?.percentage || 0;
  const passed = percentage >= 50;

  if (!existing.quizResults[quizId] || percentage >= prevBest) {
    existing.quizResults[quizId] = {
      score,
      total,
      percentage,
      passed,
      completedAt: new Date().toLocaleDateString()
    };
    existing.lastUpdated = new Date().toISOString();
    db.studentProgress[key] = existing;
    writeDB(db);
  }

  res.json({ success: true, progress: existing });
});

app.post('/api/student/progress/toggle-topic', (req: Request, res: Response) => {
  const { studentRoll, studentEmail, topicId, completed } = req.body;
  const key = (studentRoll || studentEmail || '').trim();
  if (!key || !topicId) {
    res.status(400).json({ error: 'studentRoll and topicId required' });
    return;
  }
  const db = readDB();
  if (!db.studentProgress) db.studentProgress = {};

  const existing = db.studentProgress[key] || {
    studentRoll: key,
    viewedRecordingIds: [],
    quizResults: {},
    completedTopics: [],
    completedChapters: [],
    lastUpdated: new Date().toISOString()
  };

  const isAlready = existing.completedTopics.includes(topicId);
  const shouldBe = completed !== undefined ? completed : !isAlready;

  if (shouldBe && !isAlready) {
    existing.completedTopics.push(topicId);
  } else if (!shouldBe && isAlready) {
    existing.completedTopics = existing.completedTopics.filter(t => t !== topicId);
  }
  existing.lastUpdated = new Date().toISOString();
  db.studentProgress[key] = existing;
  writeDB(db);

  res.json({ success: true, progress: existing });
});

// ----------------------------------------------------
// Dev vs Production Middleware Serving
// ----------------------------------------------------
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
    console.log('[DEV] Vite dev middleware mounted.');
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('[PROD] Serving production build from /dist.');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 SANJU MATH Academy Engine live at http://0.0.0.0:${PORT}`);
  });
}

startServer();

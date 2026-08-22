/* ==========================================================================
   PT SIANTAR TOP TBK - STATE MANAGEMENT & MOCK DATABASE
   ========================================================================== */

const STORAGE_KEY_REQUESTS = 'siantar_top_leave_requests';
const STORAGE_KEY_EMPLOYEES = 'siantar_top_employees';
const STORAGE_KEY_ROLE = 'siantar_top_active_role';
const STORAGE_KEY_CURRENT_EMP = 'siantar_top_current_employee';

// Default Employees Data for PT Siantar Top Tbk
export const DEFAULT_EMPLOYEES = [
  {
    id: 'EMP-001',
    nik: 'ST-2024-0891',
    name: 'Budi Santoso',
    role: 'Karyawan',
    jobTitle: 'Operator Produksi Biskuit',
    department: 'Divisi Biskuit & Wafer',
    plantLocation: 'Pabrik Sidoarjo (Plant 1)',
    shift: 'Shift 1 (Pagi)',
    supervisorId: 'EMP-003',
    leaveQuota: {
      annual: 12,
      taken: 3,
      remaining: 9,
      sickTaken: 2,
      specialTaken: 1
    },
    email: 'budi.santoso@siantartop.co.id',
    phone: '0812-3456-7890'
  },
  {
    id: 'EMP-002',
    nik: 'ST-2023-0412',
    name: 'Siti Rahmawati',
    role: 'Karyawan',
    jobTitle: 'Staff Quality Control (QC)',
    department: 'Divisi QC & R&D',
    plantLocation: 'Pabrik Sidoarjo (Plant 2)',
    shift: 'Non-Shift (Office)',
    supervisorId: 'EMP-003',
    leaveQuota: {
      annual: 12,
      taken: 5,
      remaining: 7,
      sickTaken: 1,
      specialTaken: 0
    },
    email: 'siti.rahmawati@siantartop.co.id',
    phone: '0813-8899-1122'
  },
  {
    id: 'EMP-003',
    nik: 'ST-2021-0118',
    name: 'Hendra Wijaya, S.T.',
    role: 'Supervisor',
    jobTitle: 'Kepala Bagian Produksi Snack & Biskuit',
    department: 'Divisi Produksi Makanan Ringan',
    plantLocation: 'Pabrik Sidoarjo (Plant 1)',
    shift: 'Supervisor All Shifts',
    supervisorId: 'EMP-004',
    leaveQuota: {
      annual: 15,
      taken: 4,
      remaining: 11,
      sickTaken: 0,
      specialTaken: 0
    },
    email: 'hendra.wijaya@siantartop.co.id',
    phone: '0811-2233-4455'
  },
  {
    id: 'EMP-004',
    nik: 'ST-2020-0045',
    name: 'Dewi Lestari, S.Psi.',
    role: 'HRD',
    jobTitle: 'HRD & Personnel Manager',
    department: 'Human Resources & General Affairs',
    plantLocation: 'Head Office & Factory Waru, Sidoarjo',
    shift: 'Non-Shift (Office)',
    supervisorId: null,
    leaveQuota: {
      annual: 15,
      taken: 2,
      remaining: 13,
      sickTaken: 0,
      specialTaken: 0
    },
    email: 'dewi.lestari@siantartop.co.id',
    phone: '0812-9988-7766'
  },
  {
    id: 'EMP-005',
    nik: 'ST-2022-0310',
    name: 'Agus Kurniawan',
    role: 'Karyawan',
    jobTitle: 'Staff Logistik & Pergudangan',
    department: 'Divisi Logistik & Armada',
    plantLocation: 'Warehouse Central Sidoarjo',
    shift: 'Shift 2 (Siang)',
    supervisorId: 'EMP-003',
    leaveQuota: {
      annual: 12,
      taken: 6,
      remaining: 6,
      sickTaken: 3,
      specialTaken: 2
    },
    email: 'agus.kurniawan@siantartop.co.id',
    phone: '0856-7788-9900'
  },
  {
    id: 'EMP-006',
    nik: 'ST-2023-0988',
    name: 'Maya Indah Sari',
    role: 'Karyawan',
    jobTitle: 'Operator Packaging Mie Gemez',
    department: 'Divisi Noodle & Bihun',
    plantLocation: 'Pabrik Sidoarjo (Plant 3)',
    shift: 'Shift 1 (Pagi)',
    supervisorId: 'EMP-003',
    leaveQuota: {
      annual: 12,
      taken: 1,
      remaining: 11,
      sickTaken: 0,
      specialTaken: 0
    },
    email: 'maya.indah@siantartop.co.id',
    phone: '0878-1122-3344'
  }
];

// Leave Types Configuration
export const LEAVE_TYPES = [
  {
    id: 'cuti_tahunan',
    name: 'Cuti Tahunan',
    badgeClass: 'badge-type',
    eventClass: 'event-cuti',
    requiresAttachment: false,
    deductsQuota: true,
    maxDays: 12,
    description: 'Hak cuti reguler tahunan karyawan yang telah bekerja >1 tahun.'
  },
  {
    id: 'izin_sakit',
    name: 'Izin Sakit (Surat Dokter)',
    badgeClass: 'badge-pending',
    eventClass: 'event-sakit',
    requiresAttachment: true,
    deductsQuota: false,
    maxDays: 14,
    description: 'Izin tidak masuk kerja karena sakit dengan melampirkan surat keterangan dokter.'
  },
  {
    id: 'izin_penting',
    name: 'Izin Kepentingan Pribadi / Mendesak',
    badgeClass: 'badge-approved-spv',
    eventClass: 'event-izin',
    requiresAttachment: false,
    deductsQuota: false,
    maxDays: 3,
    description: 'Izin keperluan keluarga mendesak atau urusan resmi kependudukan.'
  },
  {
    id: 'cuti_melahirkan',
    name: 'Cuti Melahirkan / Maternitas',
    badgeClass: 'badge-department',
    eventClass: 'event-melahirkan',
    requiresAttachment: true,
    deductsQuota: false,
    maxDays: 90,
    description: 'Hak cuti 3 bulan bagi karyawan wanita melahirkan (1.5 bulan sebelum & sesudah).'
  },
  {
    id: 'izin_khusus',
    name: 'Izin Khusus (Menikah / Duka)',
    badgeClass: 'badge-type',
    eventClass: 'event-izin',
    requiresAttachment: false,
    deductsQuota: false,
    maxDays: 3,
    description: 'Izin menikah (3 hari), anggota keluarga inti meninggal dunia (2 hari).'
  },
  {
    id: 'dispensasi',
    name: 'Dispensasi / Tugas Pelatihan Luar',
    badgeClass: 'badge-approved-hrd',
    eventClass: 'event-cuti',
    requiresAttachment: true,
    deductsQuota: false,
    maxDays: 7,
    description: 'Penugasan pelatihan operasional atau dinas resmi luar kota.'
  }
];

// Default Leave Requests
export const DEFAULT_REQUESTS = [
  {
    id: 'IZN-2026-08-001',
    employeeId: 'EMP-001',
    employeeName: 'Budi Santoso',
    nik: 'ST-2024-0891',
    department: 'Divisi Biskuit & Wafer',
    jobTitle: 'Operator Produksi Biskuit',
    leaveType: 'cuti_tahunan',
    leaveTypeName: 'Cuti Tahunan',
    startDate: '2026-08-25',
    endDate: '2026-08-27',
    totalDays: 3,
    reason: 'Keperluan renovasi rumah dan silaturahmi keluarga di kampung halaman.',
    handoverTo: 'Joko Susilo (Operator Regu A)',
    emergencyContact: '0812-9876-5432 (Istri)',
    attachmentUrl: null,
    signatureUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="60"><path d="M 10 40 Q 40 10 70 35 T 110 20" fill="none" stroke="%231e293b" stroke-width="2.5"/></svg>',
    status: 'APPROVED_HRD', // PENDING_SPV, APPROVED_SPV, APPROVED_HRD, REJECTED
    appliedAt: '2026-08-20T09:30:00Z',
    supervisorApproval: {
      supervisorId: 'EMP-003',
      supervisorName: 'Hendra Wijaya, S.T.',
      status: 'APPROVED',
      actionAt: '2026-08-20T14:15:00Z',
      notes: 'Disetujui, pekerjaan shift telah didelegasikan ke Joko Susilo.'
    },
    hrdApproval: {
      hrdId: 'EMP-004',
      hrdName: 'Dewi Lestari, S.Psi.',
      status: 'APPROVED',
      actionAt: '2026-08-21T10:00:00Z',
      notes: 'Sisa kuota mencukupi. Surat izin digital diterbitkan.',
      letterNumber: '089/HRD-ST/IZN/VIII/2026'
    }
  },
  {
    id: 'IZN-2026-08-002',
    employeeId: 'EMP-002',
    employeeName: 'Siti Rahmawati',
    nik: 'ST-2023-0412',
    department: 'Divisi QC & R&D',
    jobTitle: 'Staff Quality Control (QC)',
    leaveType: 'izin_sakit',
    leaveTypeName: 'Izin Sakit (Surat Dokter)',
    startDate: '2026-08-22',
    endDate: '2026-08-23',
    totalDays: 2,
    reason: 'Demam tinggi dan radang tenggorokan (Surat Keterangan Dokter terlampir).',
    handoverTo: 'Rina Marlina (QC Line 2)',
    emergencyContact: '0813-1122-3344 (Ibu)',
    attachmentUrl: 'Surat_Dokter_Klinik_Siantar_Top.pdf',
    signatureUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="60"><path d="M 15 45 Q 30 15 60 40 T 105 15" fill="none" stroke="%231e293b" stroke-width="2.5"/></svg>',
    status: 'APPROVED_SPV',
    appliedAt: '2026-08-22T07:15:00Z',
    supervisorApproval: {
      supervisorId: 'EMP-003',
      supervisorName: 'Hendra Wijaya, S.T.',
      status: 'APPROVED',
      actionAt: '2026-08-22T08:30:00Z',
      notes: 'Disetujui. Lekas sembuh Mbak Siti.'
    },
    hrdApproval: null
  },
  {
    id: 'IZN-2026-08-003',
    employeeId: 'EMP-005',
    employeeName: 'Agus Kurniawan',
    nik: 'ST-2022-0310',
    department: 'Divisi Logistik & Armada',
    jobTitle: 'Staff Logistik & Pergudangan',
    leaveType: 'izin_penting',
    leaveTypeName: 'Izin Kepentingan Pribadi / Mendesak',
    startDate: '2026-08-28',
    endDate: '2026-08-28',
    totalDays: 1,
    reason: 'Mengurus perpanjangan SIM B2 Umum dan administrasi kendaraan armada pabrik.',
    handoverTo: 'Bambang Tri (Gudang Bahan Baku)',
    emergencyContact: '0856-1122-3344',
    attachmentUrl: null,
    signatureUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="60"><path d="M 10 30 Q 50 5 80 45 T 115 30" fill="none" stroke="%231e293b" stroke-width="2.5"/></svg>',
    status: 'PENDING_SPV',
    appliedAt: '2026-08-22T11:00:00Z',
    supervisorApproval: null,
    hrdApproval: null
  },
  {
    id: 'IZN-2026-08-004',
    employeeId: 'EMP-006',
    employeeName: 'Maya Indah Sari',
    nik: 'ST-2023-0988',
    department: 'Divisi Noodle & Bihun',
    jobTitle: 'Operator Packaging Mie Gemez',
    leaveType: 'cuti_tahunan',
    leaveTypeName: 'Cuti Tahunan',
    startDate: '2026-08-30',
    endDate: '2026-09-02',
    totalDays: 3,
    reason: 'Acara pernikahan adik kandung di Kediri, Jawa Timur.',
    handoverTo: 'Sri Wahyuni (Regu B)',
    emergencyContact: '0878-9900-1122',
    attachmentUrl: null,
    signatureUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="60"><path d="M 12 35 Q 45 12 75 38 T 112 22" fill="none" stroke="%231e293b" stroke-width="2.5"/></svg>',
    status: 'PENDING_SPV',
    appliedAt: '2026-08-22T13:45:00Z',
    supervisorApproval: null,
    hrdApproval: null
  }
];

const STORAGE_KEY_REQUESTS = 'siantar_top_leave_requests';
const STORAGE_KEY_EMPLOYEES = 'siantar_top_employees';
const STORAGE_KEY_ROLE = 'siantar_top_active_role';
const STORAGE_KEY_CURRENT_EMP = 'siantar_top_current_employee';
const STORAGE_KEY_AUTH = 'siantar_top_auth_status';

class AppState {
  constructor() {
    this.init();
  }

  init() {
    // Check if user is logged in
    const authStatus = localStorage.getItem(STORAGE_KEY_AUTH);
    this.isLoggedIn = authStatus === 'true';

    // Load active role
    const savedRole = localStorage.getItem(STORAGE_KEY_ROLE);
    this.currentRole = savedRole || 'Karyawan'; // 'Karyawan' | 'Supervisor' | 'HRD'

    // Load employees
    const savedEmployees = localStorage.getItem(STORAGE_KEY_EMPLOYEES);
    this.employees = savedEmployees ? JSON.parse(savedEmployees) : [...DEFAULT_EMPLOYEES];

    // Load saved current employee id if available
    const savedEmpId = localStorage.getItem(STORAGE_KEY_CURRENT_EMP);
    if (savedEmpId) {
      this.currentEmployee = this.employees.find(e => e.id === savedEmpId) || this.employees[0];
    } else {
      this.updateCurrentEmployeeForRole();
    }

    // Load requests
    const savedRequests = localStorage.getItem(STORAGE_KEY_REQUESTS);
    this.requests = savedRequests ? JSON.parse(savedRequests) : [...DEFAULT_REQUESTS];

    // Listeners for reactive updates
    this.listeners = [];
  }

  updateCurrentEmployeeForRole() {
    if (this.currentRole === 'Karyawan') {
      this.currentEmployee = this.employees.find(e => e.id === 'EMP-001') || this.employees[0];
    } else if (this.currentRole === 'Supervisor') {
      this.currentEmployee = this.employees.find(e => e.id === 'EMP-003') || this.employees[2];
    } else if (this.currentRole === 'HRD') {
      this.currentEmployee = this.employees.find(e => e.id === 'EMP-004') || this.employees[3];
    }
  }

  login(identifier, password) {
    const cleanId = (identifier || '').trim().toLowerCase();
    const foundEmp = this.employees.find(e => 
      e.nik.toLowerCase() === cleanId || 
      e.email.toLowerCase() === cleanId || 
      e.id.toLowerCase() === cleanId ||
      e.name.toLowerCase().includes(cleanId)
    );

    if (!foundEmp) {
      return { success: false, message: 'Nomor Induk Karyawan (NIK) atau Email tidak terdaftar dalam sistem PT Siantar Top Tbk.' };
    }

    // Default password check: accept '123456' or NIK or any non-empty string for demo
    if (password && password.length < 4) {
      return { success: false, message: 'Password minimal 4 karakter (Gunakan demo: 123456).' };
    }

    this.isLoggedIn = true;
    this.currentEmployee = foundEmp;
    this.currentRole = foundEmp.role;

    localStorage.setItem(STORAGE_KEY_AUTH, 'true');
    localStorage.setItem(STORAGE_KEY_CURRENT_EMP, foundEmp.id);
    localStorage.setItem(STORAGE_KEY_ROLE, foundEmp.role);

    this.notify();
    return { success: true, employee: foundEmp };
  }

  logout() {
    this.isLoggedIn = false;
    localStorage.removeItem(STORAGE_KEY_AUTH);
    this.notify();
  }

  setRole(newRole) {
    this.currentRole = newRole;
    localStorage.setItem(STORAGE_KEY_ROLE, newRole);
    this.updateCurrentEmployeeForRole();
    if (this.currentEmployee) {
      localStorage.setItem(STORAGE_KEY_CURRENT_EMP, this.currentEmployee.id);
    }
    this.notify();
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.save();
    this.listeners.forEach(fn => fn(this));
  }

  save() {
    localStorage.setItem(STORAGE_KEY_REQUESTS, JSON.stringify(this.requests));
    localStorage.setItem(STORAGE_KEY_EMPLOYEES, JSON.stringify(this.employees));
  }

  resetData() {
    this.employees = [...DEFAULT_EMPLOYEES];
    this.requests = [...DEFAULT_REQUESTS];
    this.currentRole = 'Karyawan';
    localStorage.removeItem(STORAGE_KEY_REQUESTS);
    localStorage.removeItem(STORAGE_KEY_EMPLOYEES);
    localStorage.removeItem(STORAGE_KEY_ROLE);
    this.updateCurrentEmployeeForRole();
    this.notify();
  }

  // --- Requests CRUD ---

  addRequest(requestData) {
    const newId = `IZN-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(this.requests.length + 1).padStart(3, '0')}`;
    
    const newRequest = {
      id: newId,
      employeeId: this.currentEmployee.id,
      employeeName: this.currentEmployee.name,
      nik: this.currentEmployee.nik,
      department: this.currentEmployee.department,
      jobTitle: this.currentEmployee.jobTitle,
      leaveType: requestData.leaveType,
      leaveTypeName: LEAVE_TYPES.find(t => t.id === requestData.leaveType)?.name || requestData.leaveType,
      startDate: requestData.startDate,
      endDate: requestData.endDate,
      totalDays: Number(requestData.totalDays),
      reason: requestData.reason,
      handoverTo: requestData.handoverTo || '-',
      emergencyContact: requestData.emergencyContact || '-',
      attachmentUrl: requestData.attachmentUrl || null,
      signatureUrl: requestData.signatureUrl || null,
      status: 'PENDING_SPV',
      appliedAt: new Date().toISOString(),
      supervisorApproval: null,
      hrdApproval: null
    };

    // If leaveType deducts annual quota, update pending balance
    if (requestData.leaveType === 'cuti_tahunan') {
      const emp = this.employees.find(e => e.id === this.currentEmployee.id);
      if (emp) {
        emp.leaveQuota.taken += newRequest.totalDays;
        emp.leaveQuota.remaining = Math.max(0, emp.leaveQuota.annual - emp.leaveQuota.taken);
      }
    } else if (requestData.leaveType === 'izin_sakit') {
      const emp = this.employees.find(e => e.id === this.currentEmployee.id);
      if (emp) emp.leaveQuota.sickTaken += newRequest.totalDays;
    }

    this.requests.unshift(newRequest);
    this.notify();
    return newRequest;
  }

  approveBySupervisor(requestId, notes = '') {
    const req = this.requests.find(r => r.id === requestId);
    if (!req) return false;

    req.status = 'APPROVED_SPV';
    req.supervisorApproval = {
      supervisorId: this.currentEmployee.id,
      supervisorName: this.currentEmployee.name,
      status: 'APPROVED',
      actionAt: new Date().toISOString(),
      notes: notes || 'Disetujui oleh Kepala Bagian.'
    };

    this.notify();
    return true;
  }

  rejectBySupervisor(requestId, reason = '') {
    const req = this.requests.find(r => r.id === requestId);
    if (!req) return false;

    // Refund quota if annual leave
    if (req.leaveType === 'cuti_tahunan') {
      const emp = this.employees.find(e => e.id === req.employeeId);
      if (emp) {
        emp.leaveQuota.taken = Math.max(0, emp.leaveQuota.taken - req.totalDays);
        emp.leaveQuota.remaining = emp.leaveQuota.annual - emp.leaveQuota.taken;
      }
    }

    req.status = 'REJECTED';
    req.supervisorApproval = {
      supervisorId: this.currentEmployee.id,
      supervisorName: this.currentEmployee.name,
      status: 'REJECTED',
      actionAt: new Date().toISOString(),
      notes: reason || 'Pengajuan tidak disetujui karena kebutuhan operasional lini pabrik.'
    };

    this.notify();
    return true;
  }

  approveByHRD(requestId, notes = '') {
    const req = this.requests.find(r => r.id === requestId);
    if (!req) return false;

    const countThisMonth = this.requests.filter(r => r.hrdApproval?.letterNumber).length + 1;
    const letterNum = `${String(countThisMonth).padStart(3, '0')}/HRD-ST/IZN/${new Date().getMonth() + 1}/${new Date().getFullYear()}`;

    req.status = 'APPROVED_HRD';
    req.hrdApproval = {
      hrdId: this.currentEmployee.id,
      hrdName: this.currentEmployee.name,
      status: 'APPROVED',
      actionAt: new Date().toISOString(),
      notes: notes || 'Disetujui oleh HRD. Dokumen izin resmi telah diterbitkan.',
      letterNumber: letterNum
    };

    this.notify();
    return true;
  }

  rejectByHRD(requestId, reason = '') {
    const req = this.requests.find(r => r.id === requestId);
    if (!req) return false;

    // Refund quota if annual leave
    if (req.leaveType === 'cuti_tahunan') {
      const emp = this.employees.find(e => e.id === req.employeeId);
      if (emp) {
        emp.leaveQuota.taken = Math.max(0, emp.leaveQuota.taken - req.totalDays);
        emp.leaveQuota.remaining = emp.leaveQuota.annual - emp.leaveQuota.taken;
      }
    }

    req.status = 'REJECTED';
    req.hrdApproval = {
      hrdId: this.currentEmployee.id,
      hrdName: this.currentEmployee.name,
      status: 'REJECTED',
      actionAt: new Date().toISOString(),
      notes: reason || 'Ditolak oleh HRD.'
    };

    this.notify();
    return true;
  }

  getRequestById(requestId) {
    return this.requests.find(r => r.id === requestId);
  }

  getEmployeeRequests(employeeId) {
    return this.requests.filter(r => r.employeeId === employeeId);
  }

  getPendingSupervisorRequests() {
    return this.requests.filter(r => r.status === 'PENDING_SPV');
  }

  getPendingHRDRequests() {
    return this.requests.filter(r => r.status === 'APPROVED_SPV');
  }

  getAllApprovedRequests() {
    return this.requests.filter(r => r.status === 'APPROVED_HRD');
  }
}

export const state = new AppState();

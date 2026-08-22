/* ==========================================================================
   PT SIANTAR TOP TBK - ALL-IN-ONE STANDALONE BUNDLE
   Compatible with file:// (Direct double click) and http:// (Local server)
   ========================================================================== */

(function() {
  'use strict';

  // --- 1. DATE UTILITIES ---
  const INDONESIAN_MONTHS = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const INDONESIAN_DAYS = [
    'Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'
  ];

  function formatDateIndo(dateInput, includeDay) {
    if (!dateInput) return '-';
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return '-';
    const dayName = INDONESIAN_DAYS[d.getDay()];
    const day = d.getDate();
    const month = INDONESIAN_MONTHS[d.getMonth()];
    const year = d.getFullYear();
    return includeDay ? `${dayName}, ${day} ${month} ${year}` : `${day} ${month} ${year}`;
  }

  function formatDateShort(dateInput) {
    if (!dateInput) return '-';
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return '-';
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }

  function formatDateTime(dateInput) {
    if (!dateInput) return '-';
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return '-';
    const day = d.getDate();
    const month = INDONESIAN_MONTHS[d.getMonth()].slice(0, 3);
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${day} ${month} ${year}, ${hours}:${minutes} WIB`;
  }

  function calculateWorkingDays(startDateStr, endDateStr) {
    if (!startDateStr || !endDateStr) return 0;
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);
    if (start > end) return 0;
    let count = 0;
    const current = new Date(start);
    while (current <= end) {
      if (current.getDay() !== 0) count++;
      current.setDate(current.getDate() + 1);
    }
    return count;
  }

  // --- 2. SIGNATURE PAD UTILITY ---
  class SignaturePad {
    constructor(canvasElement) {
      this.canvas = canvasElement;
      this.ctx = this.canvas.getContext('2d');
      this.isDrawing = false;
      this.hasDrawn = false;
      this.init();
    }

    init() {
      this.resizeCanvas();
      this.ctx.strokeStyle = '#1e293b';
      this.ctx.lineWidth = 2.5;
      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = 'round';

      this.canvas.addEventListener('mousedown', this.startDrawing.bind(this));
      this.canvas.addEventListener('mousemove', this.draw.bind(this));
      this.canvas.addEventListener('mouseup', this.stopDrawing.bind(this));
      this.canvas.addEventListener('mouseleave', this.stopDrawing.bind(this));

      this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
      this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
      this.canvas.addEventListener('touchend', this.stopDrawing.bind(this));
    }

    resizeCanvas() {
      const rect = this.canvas.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
      }
    }

    getCoordinates(e) {
      const rect = this.canvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }

    startDrawing(e) {
      this.isDrawing = true;
      const { x, y } = this.getCoordinates(e);
      this.ctx.beginPath();
      this.ctx.moveTo(x, y);
      this.hasDrawn = true;
    }

    draw(e) {
      if (!this.isDrawing) return;
      const { x, y } = this.getCoordinates(e);
      this.ctx.lineTo(x, y);
      this.ctx.stroke();
    }

    stopDrawing() { this.isDrawing = false; }

    handleTouchStart(e) {
      e.preventDefault();
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        this.isDrawing = true;
        this.hasDrawn = true;
        this.ctx.beginPath();
        this.ctx.moveTo(touch.clientX - rect.left, touch.clientY - rect.top);
      }
    }

    handleTouchMove(e) {
      e.preventDefault();
      if (this.isDrawing && e.touches.length === 1) {
        const touch = e.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        this.ctx.lineTo(touch.clientX - rect.left, touch.clientY - rect.top);
        this.ctx.stroke();
      }
    }

    clear() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.hasDrawn = false;
    }

    isEmpty() { return !this.hasDrawn; }

    toDataURL() {
      if (!this.hasDrawn) return null;
      return this.canvas.toDataURL('image/png');
    }
  }

  // --- 3. EXPORT & PRINT UTILITY ---
  function exportToCSV(data, filename) {
    if (!filename) filename = 'rekap_perizinan_siantar_top.csv';
    if (!data || !data.length) {
      alert('Tidak ada data untuk diekspor.');
      return;
    }
    const headers = Object.keys(data[0]);
    const csvRows = [headers.map(h => `"${h}"`).join(',')];
    for (const row of data) {
      const values = headers.map(h => {
        const val = row[h] === null || row[h] === undefined ? '' : row[h];
        return `"${('' + val).replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(','));
    }
    const blob = new Blob(['\uFEFF' + csvRows.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function printDocument(elementId, title) {
    if (!title) title = 'Surat Izin PT Siantar Top Tbk';
    const origTitle = document.title;
    document.title = title;
    const el = document.getElementById(elementId);
    if (el) el.classList.add('printable-area');
    window.print();
    if (el) el.classList.remove('printable-area');
    document.title = origTitle;
  }

  // --- 4. STATE STORE & MOCK DATABASE ---
  const DEFAULT_EMPLOYEES = [
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
      leaveQuota: { annual: 12, taken: 3, remaining: 9, sickTaken: 2, specialTaken: 1 },
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
      leaveQuota: { annual: 12, taken: 5, remaining: 7, sickTaken: 1, specialTaken: 0 },
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
      leaveQuota: { annual: 15, taken: 4, remaining: 11, sickTaken: 0, specialTaken: 0 },
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
      leaveQuota: { annual: 15, taken: 2, remaining: 13, sickTaken: 0, specialTaken: 0 },
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
      leaveQuota: { annual: 12, taken: 6, remaining: 6, sickTaken: 3, specialTaken: 2 },
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
      leaveQuota: { annual: 12, taken: 1, remaining: 11, sickTaken: 0, specialTaken: 0 },
      email: 'maya.indah@siantartop.co.id',
      phone: '0878-1122-3344'
    }
  ];

  const LEAVE_TYPES = [
    { id: 'cuti_tahunan', name: 'Cuti Tahunan', badgeClass: 'badge-type', eventClass: 'event-cuti', requiresAttachment: false, deductsQuota: true, maxDays: 12 },
    { id: 'izin_sakit', name: 'Izin Sakit (Surat Dokter)', badgeClass: 'badge-pending', eventClass: 'event-sakit', requiresAttachment: true, deductsQuota: false, maxDays: 14 },
    { id: 'izin_penting', name: 'Izin Kepentingan Pribadi / Mendesak', badgeClass: 'badge-approved-spv', eventClass: 'event-izin', requiresAttachment: false, deductsQuota: false, maxDays: 3 },
    { id: 'cuti_melahirkan', name: 'Cuti Melahirkan / Maternitas', badgeClass: 'badge-department', eventClass: 'event-melahirkan', requiresAttachment: true, deductsQuota: false, maxDays: 90 },
    { id: 'izin_khusus', name: 'Izin Khusus (Menikah / Duka)', badgeClass: 'badge-type', eventClass: 'event-izin', requiresAttachment: false, deductsQuota: false, maxDays: 3 },
    { id: 'dispensasi', name: 'Dispensasi / Tugas Pelatihan Luar', badgeClass: 'badge-approved-hrd', eventClass: 'event-cuti', requiresAttachment: true, deductsQuota: false, maxDays: 7 }
  ];

  const DEFAULT_REQUESTS = [
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
      status: 'APPROVED_HRD',
      appliedAt: '2026-08-20T09:30:00Z',
      supervisorApproval: { supervisorId: 'EMP-003', supervisorName: 'Hendra Wijaya, S.T.', status: 'APPROVED', actionAt: '2026-08-20T14:15:00Z', notes: 'Disetujui, pekerjaan shift telah didelegasikan.' },
      hrdApproval: { hrdId: 'EMP-004', hrdName: 'Dewi Lestari, S.Psi.', status: 'APPROVED', actionAt: '2026-08-21T10:00:00Z', notes: 'Sisa kuota mencukupi. Surat izin digital diterbitkan.', letterNumber: '089/HRD-ST/IZN/VIII/2026' }
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
      supervisorApproval: { supervisorId: 'EMP-003', supervisorName: 'Hendra Wijaya, S.T.', status: 'APPROVED', actionAt: '2026-08-22T08:30:00Z', notes: 'Disetujui. Lekas sembuh Mbak Siti.' },
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
      reason: 'Mengurus perpanjangan SIM B2 Umum armada pabrik.',
      handoverTo: 'Bambang Tri (Gudang Bahan Baku)',
      emergencyContact: '0856-1122-3344',
      attachmentUrl: null,
      signatureUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="60"><path d="M 10 30 Q 50 5 80 45 T 115 30" fill="none" stroke="%231e293b" stroke-width="2.5"/></svg>',
      status: 'PENDING_SPV',
      appliedAt: '2026-08-22T11:00:00Z',
      supervisorApproval: null,
      hrdApproval: null
    }
  ];

  class AppState {
    constructor() {
      this.init();
    }

    init() {
      const authStatus = localStorage.getItem('siantar_auth');
      this.isLoggedIn = authStatus === 'true';

      const savedRole = localStorage.getItem('siantar_role') || 'Karyawan';
      this.currentRole = savedRole;

      const savedEmps = localStorage.getItem('siantar_employees');
      this.employees = savedEmps ? JSON.parse(savedEmps) : [...DEFAULT_EMPLOYEES];

      const savedReqs = localStorage.getItem('siantar_requests');
      this.requests = savedReqs ? JSON.parse(savedReqs) : [...DEFAULT_REQUESTS];

      const savedEmpId = localStorage.getItem('siantar_cur_emp');
      if (savedEmpId) {
        this.currentEmployee = this.employees.find(e => e.id === savedEmpId) || this.employees[0];
      } else {
        this.updateCurrentEmployeeForRole();
      }

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
      let foundEmp = null;

      if (!cleanId) {
        foundEmp = this.employees[0];
      } else {
        foundEmp = this.employees.find(e => 
          e.nik.toLowerCase() === cleanId || 
          e.email.toLowerCase() === cleanId || 
          e.id.toLowerCase() === cleanId ||
          e.name.toLowerCase().includes(cleanId) ||
          e.role.toLowerCase() === cleanId
        );
        if (!foundEmp) {
          foundEmp = this.employees.find(e => e.nik.toLowerCase().includes(cleanId)) || this.employees[0];
        }
      }

      this.isLoggedIn = true;
      this.currentEmployee = foundEmp;
      this.currentRole = foundEmp.role;

      localStorage.setItem('siantar_auth', 'true');
      localStorage.setItem('siantar_cur_emp', foundEmp.id);
      localStorage.setItem('siantar_role', foundEmp.role);

      this.notify();
      return { success: true, employee: foundEmp };
    }

    logout() {
      this.isLoggedIn = false;
      localStorage.removeItem('siantar_auth');
      this.notify();
    }

    setRole(newRole) {
      this.currentRole = newRole;
      localStorage.setItem('siantar_role', newRole);
      this.updateCurrentEmployeeForRole();
      if (this.currentEmployee) {
        localStorage.setItem('siantar_cur_emp', this.currentEmployee.id);
      }
      this.notify();
    }

    subscribe(listener) {
      this.listeners.push(listener);
      return () => { this.listeners = this.listeners.filter(l => l !== listener); };
    }

    notify() {
      this.save();
      this.listeners.forEach(fn => fn(this));
    }

    save() {
      localStorage.setItem('siantar_requests', JSON.stringify(this.requests));
      localStorage.setItem('siantar_employees', JSON.stringify(this.employees));
    }

    resetData() {
      this.employees = [...DEFAULT_EMPLOYEES];
      this.requests = [...DEFAULT_REQUESTS];
      this.currentRole = 'Karyawan';
      localStorage.removeItem('siantar_requests');
      localStorage.removeItem('siantar_employees');
      localStorage.removeItem('siantar_role');
      this.updateCurrentEmployeeForRole();
      this.notify();
    }

    addRequest(reqData) {
      const newId = `IZN-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(this.requests.length + 1).padStart(3, '0')}`;
      const newRequest = {
        id: newId,
        employeeId: this.currentEmployee.id,
        employeeName: this.currentEmployee.name,
        nik: this.currentEmployee.nik,
        department: this.currentEmployee.department,
        jobTitle: this.currentEmployee.jobTitle,
        leaveType: reqData.leaveType,
        leaveTypeName: LEAVE_TYPES.find(t => t.id === reqData.leaveType)?.name || reqData.leaveType,
        startDate: reqData.startDate,
        endDate: reqData.endDate,
        totalDays: Number(reqData.totalDays),
        reason: reqData.reason,
        handoverTo: reqData.handoverTo || '-',
        emergencyContact: reqData.emergencyContact || '-',
        attachmentUrl: reqData.attachmentUrl || null,
        signatureUrl: reqData.signatureUrl || null,
        status: 'PENDING_SPV',
        appliedAt: new Date().toISOString(),
        supervisorApproval: null,
        hrdApproval: null
      };

      if (reqData.leaveType === 'cuti_tahunan') {
        const emp = this.employees.find(e => e.id === this.currentEmployee.id);
        if (emp) {
          emp.leaveQuota.taken += newRequest.totalDays;
          emp.leaveQuota.remaining = Math.max(0, emp.leaveQuota.annual - emp.leaveQuota.taken);
        }
      } else if (reqData.leaveType === 'izin_sakit') {
        const emp = this.employees.find(e => e.id === this.currentEmployee.id);
        if (emp) emp.leaveQuota.sickTaken += newRequest.totalDays;
      }

      this.requests.unshift(newRequest);
      this.notify();
      return newRequest;
    }

    approveBySupervisor(requestId, notes) {
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

    rejectBySupervisor(requestId, reason) {
      const req = this.requests.find(r => r.id === requestId);
      if (!req) return false;
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
        notes: reason || 'Pengajuan ditolak karena kendala regu operasional.'
      };
      this.notify();
      return true;
    }

    approveByHRD(requestId, notes) {
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
        notes: notes || 'Dokumen disetujui resmi oleh HRD.',
        letterNumber: letterNum
      };
      this.notify();
      return true;
    }

    rejectByHRD(requestId, reason) {
      const req = this.requests.find(r => r.id === requestId);
      if (!req) return false;
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

    getRequestById(requestId) { return this.requests.find(r => r.id === requestId); }
    getEmployeeRequests(empId) { return this.requests.filter(r => r.employeeId === empId); }
    getPendingSupervisorRequests() { return this.requests.filter(r => r.status === 'PENDING_SPV'); }
    getPendingHRDRequests() { return this.requests.filter(r => r.status === 'APPROVED_SPV'); }
    getAllApprovedRequests() { return this.requests.filter(r => r.status === 'APPROVED_HRD'); }
  }

  const state = new AppState();
  window.state = state;

  // --- 5. TOAST NOTIFICATIONS ---
  function showToast(title, message, type) {
    if (!type) type = 'info';
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let iconSvg = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>';
    if (type === 'success') iconSvg = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>';
    if (type === 'danger') iconSvg = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>';

    toast.innerHTML = `
      <div class="toast-icon">${iconSvg}</div>
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        <div class="toast-message">${message}</div>
      </div>
      <button class="toast-close">&times;</button>
    `;

    container.appendChild(toast);
    toast.querySelector('.toast-close').addEventListener('click', () => toast.remove());

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 300);
    }, 4500);
  }
  window.showToast = showToast;

  // --- 6. RENDER VIEWS ---
  function renderEmployeeView(container) {
    const emp = state.currentEmployee;
    const requests = state.getEmployeeRequests(emp.id);

    function getStatusBadge(status) {
      if (status === 'PENDING_SPV') return '<span class="badge badge-pending">Menunggu Supervisor</span>';
      if (status === 'APPROVED_SPV') return '<span class="badge badge-approved-spv">Disetujui SPV (Proses HRD)</span>';
      if (status === 'APPROVED_HRD') return '<span class="badge badge-approved-hrd">Disetujui HRD (Terbit)</span>';
      if (status === 'REJECTED') return '<span class="badge badge-rejected">Ditolak</span>';
      return `<span class="badge">${status}</span>`;
    }

    container.innerHTML = `
      <div class="action-banner">
        <div class="banner-content">
          <div class="banner-tag">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
            Portal Mandiri Karyawan
          </div>
          <h2 class="banner-title">Selamat Datang, ${emp.name}</h2>
          <p class="banner-desc">
            NIK: <strong>${emp.nik}</strong> | ${emp.jobTitle} - <strong>${emp.department}</strong> (${emp.plantLocation}). Butuh cuti atau izin sakit? Ajukan formulir secara online tanpa berkas fisik.
          </p>
        </div>
        <div class="banner-actions">
          <button class="btn btn-primary btn-lg" id="btn-open-new-request">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Ajukan Izin / Cuti
          </button>
        </div>
      </div>

      <div class="kpi-grid">
        <div class="kpi-card kpi-danger">
          <div class="kpi-info">
            <span class="kpi-label">Sisa Cuti Tahunan</span>
            <div class="kpi-value">${emp.leaveQuota.remaining} <small style="font-size: 1rem; font-weight: 500;">Hari</small></div>
            <span class="kpi-subtext">Dari total kuota ${emp.leaveQuota.annual} hari/tahun</span>
          </div>
          <div class="kpi-icon-box">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          </div>
        </div>

        <div class="kpi-card kpi-warning">
          <div class="kpi-info">
            <span class="kpi-label">Cuti Terpakai</span>
            <div class="kpi-value">${emp.leaveQuota.taken} <small style="font-size: 1rem; font-weight: 500;">Hari</small></div>
            <span class="kpi-subtext">Cuti tahunan yang telah diambil</span>
          </div>
          <div class="kpi-icon-box">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          </div>
        </div>

        <div class="kpi-card kpi-info">
          <div class="kpi-info">
            <span class="kpi-label">Izin Sakit & Khusus</span>
            <div class="kpi-value">${emp.leaveQuota.sickTaken + emp.leaveQuota.specialTaken} <small style="font-size: 1rem; font-weight: 500;">Hari</small></div>
            <span class="kpi-subtext">Sakit: ${emp.leaveQuota.sickTaken} hr | Khusus: ${emp.leaveQuota.specialTaken} hr</span>
          </div>
          <div class="kpi-icon-box">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
          </div>
        </div>

        <div class="kpi-card kpi-success">
          <div class="kpi-info">
            <span class="kpi-label">Total Riwayat Pengajuan</span>
            <div class="kpi-value">${requests.length}</div>
            <span class="kpi-subtext">Pengajuan perizinan aktif Anda</span>
          </div>
          <div class="kpi-icon-box">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <div class="card-title-group">
            <div class="card-title-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
            </div>
            <div>
              <h3 class="card-title">Riwayat & Status Pengajuan Izin</h3>
              <p class="card-subtitle">Pantau alur persetujuan berjenjang dari Supervisor hingga HRD PT Siantar Top Tbk</p>
            </div>
          </div>
          <button class="btn btn-secondary btn-sm" id="btn-refresh-employee-list">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
            Perbarui
          </button>
        </div>

        <div class="card-body" style="padding: 1.25rem;">
          ${requests.length === 0 ? `
            <div style="text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
              <h4>Belum Ada Pengajuan</h4>
              <p style="font-size: 0.85rem; margin-top: 0.25rem;">Klik tombol "Ajukan Izin / Cuti" di atas untuk membuat pengajuan baru.</p>
            </div>
          ` : `
            <div class="table-responsive">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>No. Dokumen</th>
                    <th>Jenis Izin</th>
                    <th>Tanggal Pelaksanaan</th>
                    <th>Durasi</th>
                    <th>Alasan / Keterangan</th>
                    <th>Status Persetujuan</th>
                    <th style="text-align: right;">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  ${requests.map(req => `
                    <tr>
                      <td>
                        <strong style="color: var(--brand-primary);">${req.id}</strong>
                        <div style="font-size: 0.72rem; color: var(--text-muted);">${formatDateIndo(req.appliedAt)}</div>
                      </td>
                      <td><span class="badge badge-type">${req.leaveTypeName}</span></td>
                      <td>
                        <strong>${formatDateIndo(req.startDate)}</strong>
                        ${req.startDate !== req.endDate ? `<div style="font-size: 0.74rem; color: var(--text-muted);">s/d ${formatDateIndo(req.endDate)}</div>` : ''}
                      </td>
                      <td><strong>${req.totalDays} Hari</strong></td>
                      <td>
                        <div style="max-width: 260px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${req.reason}</div>
                        ${req.attachmentUrl ? `<div style="font-size: 0.72rem; color: var(--status-info); margin-top: 2px;">📎 Lampiran Tersedia</div>` : ''}
                      </td>
                      <td>${getStatusBadge(req.status)}</td>
                      <td style="text-align: right;">
                        <div class="table-actions" style="justify-content: flex-end;">
                          <button class="btn btn-secondary btn-sm btn-track-status" data-id="${req.id}">Lacak</button>
                          ${req.status === 'APPROVED_HRD' ? `<button class="btn btn-primary btn-sm btn-view-letter" data-id="${req.id}">Surat Izin</button>` : ''}
                        </div>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          `}
        </div>
      </div>
    `;

    container.querySelector('#btn-open-new-request')?.addEventListener('click', () => window.openNewRequestModal());
    container.querySelector('#btn-refresh-employee-list')?.addEventListener('click', () => renderEmployeeView(container));
    container.querySelectorAll('.btn-track-status').forEach(b => b.addEventListener('click', (e) => window.openTrackingModal(e.currentTarget.dataset.id)));
    container.querySelectorAll('.btn-view-letter').forEach(b => b.addEventListener('click', (e) => window.openLetterModal(e.currentTarget.dataset.id)));
  }

  function renderSupervisorView(container) {
    const pendingRequests = state.getPendingSupervisorRequests();
    const allRequests = state.requests;
    const supervisorEmp = state.currentEmployee;

    container.innerHTML = `
      <div class="action-banner" style="background: linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%);">
        <div class="banner-content">
          <div class="banner-tag" style="color: #60a5fa; background: rgba(96, 165, 250, 0.15);">Portal Approval Supervisor</div>
          <h2 class="banner-title">Pusat Persetujuan - ${supervisorEmp.name}</h2>
          <p class="banner-desc">${supervisorEmp.jobTitle} | ${supervisorEmp.department} (${supervisorEmp.plantLocation}). Tinjau dan setujui permohonan izin karyawan regu.</p>
        </div>
        <div class="banner-actions">
          <span class="badge ${pendingRequests.length > 0 ? 'badge-pending' : 'badge-approved-hrd'}" style="font-size: 0.95rem; padding: 0.6rem 1.2rem;">
            ${pendingRequests.length} Pengajuan Menunggu Review
          </span>
        </div>
      </div>

      <div class="card" style="margin-bottom: 1.5rem;">
        <div class="card-header">
          <h3 class="card-title">Antrean Pengajuan Izin Menunggu Persetujuan (${pendingRequests.length})</h3>
        </div>
        <div class="card-body" style="padding: 1.25rem;">
          ${pendingRequests.length === 0 ? `
            <div style="text-align: center; padding: 2.5rem 1rem; color: var(--text-muted);">
              <h4>Semua Pengajuan Selesai Diproses!</h4>
              <p style="font-size: 0.85rem; margin-top: 0.25rem;">Tidak ada permohonan izin baru yang tertunda di antrean Anda.</p>
            </div>
          ` : `
            <div class="table-responsive">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Karyawan Pemohon</th>
                    <th>Departemen</th>
                    <th>Jenis & Periode Izin</th>
                    <th>Alasan & Pelimpahan</th>
                    <th style="text-align: right;">Keputusan</th>
                  </tr>
                </thead>
                <tbody>
                  ${pendingRequests.map(req => `
                    <tr>
                      <td>
                        <strong>${req.employeeName}</strong>
                        <div style="font-size: 0.72rem; color: var(--text-muted);">NIK: ${req.nik}</div>
                      </td>
                      <td><span class="badge badge-department">${req.department}</span></td>
                      <td>
                        <span class="badge badge-type">${req.leaveTypeName}</span>
                        <div style="font-size: 0.75rem; margin-top: 2px;">${formatDateIndo(req.startDate)} s/d ${formatDateIndo(req.endDate)} (${req.totalDays} hari)</div>
                      </td>
                      <td>
                        <div style="max-width: 220px; font-size: 0.82rem;">${req.reason}</div>
                        <div style="font-size: 0.72rem; color: var(--text-muted);">Pengganti: ${req.handoverTo}</div>
                      </td>
                      <td style="text-align: right;">
                        <button class="btn btn-success btn-sm btn-spv-approve" data-id="${req.id}">Setujui</button>
                        <button class="btn btn-danger btn-sm btn-spv-reject" data-id="${req.id}" style="margin-left: 4px;">Tolak</button>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          `}
        </div>
      </div>
    `;

    container.querySelectorAll('.btn-spv-approve').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const reqId = e.currentTarget.dataset.id;
        const notes = prompt('Tambahkan catatan persetujuan (Opsional):', 'Disetujui, pekerjaan shift telah diatur.');
        if (notes !== null) {
          state.approveBySupervisor(reqId, notes);
          showToast('Sukses Disetujui', `Pengajuan ${reqId} berhasil disetujui.`, 'success');
        }
      });
    });

    container.querySelectorAll('.btn-spv-reject').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const reqId = e.currentTarget.dataset.id;
        const reason = prompt('Masukkan alasan penolakan:', 'Operasional lini shift tidak memungkinkan.');
        if (reason) {
          state.rejectBySupervisor(reqId, reason);
          showToast('Pengajuan Ditolak', `Pengajuan ${reqId} telah ditolak.`, 'danger');
        }
      });
    });
  }

  function renderHRDView(container) {
    const pendingHrd = state.getPendingHRDRequests();
    const employees = state.employees;

    container.innerHTML = `
      <div class="action-banner" style="background: linear-gradient(135deg, #831843 0%, #0f172a 100%);">
        <div class="banner-content">
          <div class="banner-tag" style="color: #f472b6; background: rgba(244, 114, 182, 0.15);">HRD Administration</div>
          <h2 class="banner-title">Dashboard Manajemen HRD - PT Siantar Top Tbk</h2>
          <p class="banner-desc">Otorisasi penerbitan surat izin resmi, rekapitulasi data absensi, dan kontrol kuota cuti.</p>
        </div>
        <div class="banner-actions">
          <button class="btn btn-secondary" id="btn-export-hr-csv" style="background: rgba(255,255,255,0.15); color: #fff;">Ekspor CSV Rekap</button>
        </div>
      </div>

      <div class="card" style="margin-bottom: 1.5rem;">
        <div class="card-header">
          <h3 class="card-title">Otorisasi & Penerbitan Surat Izin HRD (${pendingHrd.length})</h3>
        </div>
        <div class="card-body" style="padding: 1.25rem;">
          ${pendingHrd.length === 0 ? `
            <div style="text-align: center; padding: 2.5rem 1rem; color: var(--text-muted);">
              <h4>Tidak Ada Antrean Tertunda HRD</h4>
            </div>
          ` : `
            <div class="table-responsive">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Karyawan & NIK</th>
                    <th>Departemen & SPV</th>
                    <th>Jenis & Durasi</th>
                    <th>Alasan</th>
                    <th style="text-align: right;">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  ${pendingHrd.map(req => `
                    <tr>
                      <td><strong>${req.employeeName}</strong> (${req.nik})</td>
                      <td><span class="badge badge-department">${req.department}</span></td>
                      <td><span class="badge badge-type">${req.leaveTypeName}</span> (${req.totalDays} hari)</td>
                      <td><div style="max-width: 220px;">${req.reason}</div></td>
                      <td style="text-align: right;">
                        <button class="btn btn-primary btn-sm btn-hrd-approve" data-id="${req.id}">Terbitkan Surat</button>
                        <button class="btn btn-danger btn-sm btn-hrd-reject" data-id="${req.id}" style="margin-left: 4px;">Tolak</button>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          `}
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Master Kuota Cuti Karyawan</h3>
        </div>
        <div class="card-body" style="padding: 1.25rem;">
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>NIK & Nama</th>
                  <th>Jabatan & Dept</th>
                  <th>Hak Cuti</th>
                  <th>Terpakai</th>
                  <th>Sisa Saldo</th>
                </tr>
              </thead>
              <tbody>
                ${employees.map(emp => `
                  <tr>
                    <td><strong>${emp.name}</strong> (${emp.nik})</td>
                    <td>${emp.jobTitle} - ${emp.department}</td>
                    <td>${emp.leaveQuota.annual} Hari</td>
                    <td><span style="color: var(--status-warning); font-weight: 700;">${emp.leaveQuota.taken} Hari</span></td>
                    <td><strong style="color: var(--status-success);">${emp.leaveQuota.remaining} Hari</strong></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    container.querySelectorAll('.btn-hrd-approve').forEach(b => {
      b.addEventListener('click', (e) => {
        const reqId = e.currentTarget.dataset.id;
        state.approveByHRD(reqId, 'Dokumen perizinan disetujui resmi oleh HRD.');
        showToast('Surat Izin Resmi Diterbitkan', `Dokumen perizinan untuk ${reqId} telah resmi diterbitkan.`, 'success');
        setTimeout(() => window.openLetterModal(reqId), 400);
      });
    });

    container.querySelectorAll('.btn-hrd-reject').forEach(b => {
      b.addEventListener('click', (e) => {
        const reqId = e.currentTarget.dataset.id;
        const reason = prompt('Masukkan alasan penolakan HRD:', 'Kuota cuti tidak mencukupi.');
        if (reason) {
          state.rejectByHRD(reqId, reason);
          showToast('Pengajuan Ditolak HRD', `Pengajuan ${reqId} telah ditolak.`, 'danger');
        }
      });
    });

    container.querySelector('#btn-export-hr-csv')?.addEventListener('click', () => {
      const exportData = state.requests.map(r => ({
        'No Dokumen': r.id,
        'NIK': r.nik,
        'Nama Karyawan': r.employeeName,
        'Departemen': r.department,
        'Jenis Izin': r.leaveTypeName,
        'Tanggal Mulai': r.startDate,
        'Tanggal Selesai': r.endDate,
        'Total Hari': r.totalDays,
        'Alasan': r.reason,
        'Status': r.status,
        'No Surat Izin': r.hrdApproval?.letterNumber || '-'
      }));
      exportToCSV(exportData, `Rekap_Izin_Siantar_Top_${new Date().toISOString().slice(0, 10)}.csv`);
      showToast('Ekspor Berhasil', 'Data rekapitulasi perizinan berhasil diunduh.', 'info');
    });
  }

  function renderCalendarView(container) {
    const today = new Date();
    container.innerHTML = `
      <div class="action-banner" style="background: linear-gradient(135deg, #065f46 0%, #0f172a 100%);">
        <div class="banner-content">
          <div class="banner-tag" style="color: #34d399; background: rgba(52, 211, 153, 0.15);">Jadwal Shift Pabrik</div>
          <h2 class="banner-title">Kalender Izin & Cuti Tim</h2>
          <p class="banner-desc">Pantau ketersediaan personel dan jadwal cuti anggota tim seluruh divisi PT Siantar Top Tbk.</p>
        </div>
      </div>
      <div class="calendar-wrapper">
        <div class="calendar-header">
          <h3 class="calendar-month-title">${INDONESIAN_MONTHS[today.getMonth()]} ${today.getFullYear()}</h3>
        </div>
        <div class="calendar-grid-header">
          <div>Min</div><div>Sen</div><div>Sel</div><div>Rab</div><div>Kam</div><div>Jum</div><div>Sab</div>
        </div>
        <div class="calendar-grid-body" id="cal-cells-container"></div>
      </div>
    `;

    const cellsBody = container.querySelector('#cal-cells-container');
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).getDay();
    const daysInM = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
      const cell = document.createElement('div');
      cell.className = 'calendar-day-cell other-month';
      cellsBody.appendChild(cell);
    }

    for (let d = 1; d <= daysInM; d++) {
      const cell = document.createElement('div');
      const isToday = d === today.getDate();
      cell.className = `calendar-day-cell ${isToday ? 'is-today' : ''}`;
      cell.innerHTML = `<span class="day-number">${d}</span>`;
      cellsBody.appendChild(cell);
    }
  }

  function renderPolicyGuideView(container) {
    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Peraturan & Ketentuan Cuti PT Siantar Top Tbk</h3>
        </div>
        <div class="card-body" style="line-height: 1.7;">
          <h4>1. Cuti Tahunan (12 Hari Kerja)</h4>
          <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 1rem;">Diberikan bagi karyawan yang telah bekerja >1 tahun. Wajib diajukan minimal 3 hari sebelumnya.</p>
          <h4>2. Izin Sakit</h4>
          <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 1rem;">Wajib menyertakan Surat Keterangan Dokter (SKD) resmi.</p>
          <h4>3. Cuti Melahirkan (90 Hari)</h4>
          <p style="color: var(--text-muted); font-size: 0.85rem;">Hak 1.5 bulan sebelum & 1.5 bulan setelah melahirkan.</p>
        </div>
      </div>
    `;
  }

  // --- 7. MODALS & LETTERS ---
  function renderLetterModalContent(requestId) {
    const req = state.getRequestById(requestId);
    if (!req) return '<div style="padding: 2rem; text-align: center;">Data pengajuan tidak ditemukan.</div>';
    const docNumber = req.hrdApproval?.letterNumber || `DRAFT/${req.id}`;

    return `
      <div class="official-letter-preview" id="official-permit-document">
        <div class="letter-header">
          <div class="letter-logo-box">ST</div>
          <div class="letter-company-info">
            <div class="letter-company-title">PT SIANTAR TOP Tbk</div>
            <div class="letter-company-sub">PRODUSEN MAKANAN RINGAN & BISKUIT TERKEMUKA</div>
            <div class="letter-company-address">
              Kantor & Pabrik Utama: Jl. Tambak Sawah No. 21-23, Waru, Sidoarjo 61256, Jawa Timur<br>
              Telp: (031) 8667321 | Email: info@siantartop.co.id
            </div>
          </div>
        </div>

        <div class="letter-title-section">
          <div class="letter-main-title">SURAT KETERANGAN PERIZINAN & CUTI KARYAWAN</div>
          <div class="letter-doc-number">Nomor Dokumen: <strong>${docNumber}</strong></div>
        </div>

        <p class="letter-intro">Manajemen HRD PT Siantar Top Tbk memberikan izin resmi kepada:</p>

        <table class="letter-details-table">
          <tbody>
            <tr><td class="field-name">NIK</td><td class="colon">:</td><td class="field-value"><strong>${req.nik}</strong></td></tr>
            <tr><td class="field-name">Nama Karyawan</td><td class="colon">:</td><td class="field-value"><strong>${req.employeeName}</strong></td></tr>
            <tr><td class="field-name">Jabatan</td><td class="colon">:</td><td class="field-value">${req.jobTitle}</td></tr>
            <tr><td class="field-name">Departemen</td><td class="colon">:</td><td class="field-value">${req.department}</td></tr>
            <tr><td class="field-name">Jenis Izin</td><td class="colon">:</td><td class="field-value"><strong style="color: #b71c1c;">${req.leaveTypeName}</strong></td></tr>
            <tr><td class="field-name">Periode</td><td class="colon">:</td><td class="field-value"><strong>${formatDateIndo(req.startDate, true)}</strong> s/d <strong>${formatDateIndo(req.endDate, true)}</strong> (${req.totalDays} Hari)</td></tr>
            <tr><td class="field-name">Alasan</td><td class="colon">:</td><td class="field-value">${req.reason}</td></tr>
            <tr><td class="field-name">Pelimpahan Tugas</td><td class="colon">:</td><td class="field-value">${req.handoverTo}</td></tr>
          </tbody>
        </table>

        <div class="letter-signatures-grid">
          <div class="signature-column">
            <div class="sig-role-title">Pemohon (Karyawan)</div>
            <div class="sig-image-box">
              ${req.signatureUrl ? `<img src="${req.signatureUrl}" alt="TTD">` : '<span>(TTD)</span>'}
            </div>
            <div class="sig-name">${req.employeeName}</div>
            <div class="sig-nip">NIK: ${req.nik}</div>
          </div>

          <div class="signature-column">
            <div class="sig-role-title">Mengetahui (Supervisor)</div>
            <div class="sig-image-box">
              <div style="font-family: cursive; font-size: 1.3rem; color: #1e3a8a; font-weight: 700; transform: rotate(-5deg);">Hendra W.</div>
            </div>
            <div class="sig-name">${req.supervisorApproval?.supervisorName || 'Hendra Wijaya, S.T.'}</div>
            <div class="sig-nip">Kepala Bagian Produksi</div>
          </div>

          <div class="signature-column">
            <div class="sig-role-title">Menyetujui (HRD Manager)</div>
            <div class="sig-image-box">
              <div style="font-family: cursive; font-size: 1.3rem; color: #b91c1c; font-weight: 700; transform: rotate(-4deg);">Dewi L.</div>
              <div class="sig-stamp-watermark">PT SIANTAR TOP<br>★ HRD ★<br>APPROVED</div>
            </div>
            <div class="sig-name">${req.hrdApproval?.hrdName || 'Dewi Lestari, S.Psi.'}</div>
            <div class="sig-nip">HRD & Personnel Dept.</div>
          </div>
        </div>

        <div class="letter-footer-meta">
          <div>Dicetak secara elektronik pada: ${formatDateTime(new Date())}</div>
          <div class="qr-code-box">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#374151" stroke-width="1.8">
              <rect x="3" y="3" width="6" height="6"></rect><rect x="15" y="3" width="6" height="6"></rect>
              <rect x="3" y="15" width="6" height="6"></rect><rect x="15" y="15" width="6" height="6"></rect>
              <path d="M10 3v3M3 10h3M14 10h3M10 14v3M10 10h4v4h-4z"></path>
            </svg>
          </div>
        </div>
      </div>
    `;
  }

  let activeSignaturePad = null;
  let currentActiveView = 'dashboard';

  function openModal(modalEl) {
    if (!modalEl) return;
    modalEl.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal(modalEl) {
    if (!modalEl) return;
    modalEl.classList.remove('active');
    document.body.style.overflow = '';
  }

  window.openNewRequestModal = function() {
    const modal = document.getElementById('modal-new-request');
    openModal(modal);
    setTimeout(() => activeSignaturePad?.resizeCanvas(), 200);
  };

  window.openTrackingModal = function(requestId) {
    const req = state.getRequestById(requestId);
    if (!req) return;
    const modal = document.getElementById('modal-tracking');
    const titleEl = document.getElementById('track-modal-title');
    const subEl = document.getElementById('track-modal-subtitle');
    const bodyEl = document.getElementById('track-modal-body');

    titleEl.textContent = `Lacak Pengajuan: ${req.leaveTypeName}`;
    subEl.textContent = `Nomor Dokumen: ${req.id} | Pemohon: ${req.employeeName}`;

    const isPendingSpv = req.status === 'PENDING_SPV';
    const isApprovedSpv = req.status === 'APPROVED_SPV';
    const isApprovedHrd = req.status === 'APPROVED_HRD';
    const isRejected = req.status === 'REJECTED';

    bodyEl.innerHTML = `
      <div class="timeline-stepper">
        <div class="step-item completed">
          <div class="step-circle">1</div>
          <div class="step-label">Diajukan</div>
          <div class="step-subtext">${formatDateTime(req.appliedAt)}</div>
        </div>
        <div class="step-item ${isApprovedSpv || isApprovedHrd ? 'completed' : (isPendingSpv ? 'active' : '')}">
          <div class="step-circle">${isApprovedSpv || isApprovedHrd ? '✓' : '2'}</div>
          <div class="step-label">Persetujuan SPV</div>
          <div class="step-subtext">${req.supervisorApproval ? formatDateTime(req.supervisorApproval.actionAt) : 'Menunggu Review'}</div>
        </div>
        <div class="step-item ${isApprovedHrd ? 'completed' : (isApprovedSpv ? 'active' : '')}">
          <div class="step-circle">${isApprovedHrd ? '✓' : '3'}</div>
          <div class="step-label">Verifikasi HRD</div>
          <div class="step-subtext">${req.hrdApproval ? formatDateTime(req.hrdApproval.actionAt) : 'Menunggu SPV'}</div>
        </div>
        <div class="step-item ${isApprovedHrd ? 'completed' : ''}">
          <div class="step-circle">${isApprovedHrd ? '✓' : '4'}</div>
          <div class="step-label">Surat Terbit</div>
          <div class="step-subtext">${req.hrdApproval?.letterNumber ? 'Resmi' : '-'}</div>
        </div>
      </div>

      <div style="background: var(--bg-app); border-radius: var(--radius-md); padding: 1.25rem; font-size: 0.85rem; border: 1px solid var(--border-light);">
        <div style="margin-bottom: 0.5rem;"><strong>Periode:</strong> ${formatDateIndo(req.startDate)} s/d ${formatDateIndo(req.endDate)} (${req.totalDays} Hari)</div>
        <div style="margin-bottom: 0.5rem;"><strong>Alasan:</strong> ${req.reason}</div>
        <div style="margin-bottom: 0.5rem;"><strong>Pelimpahan Tugas:</strong> ${req.handoverTo}</div>
        ${req.supervisorApproval?.notes ? `<div style="margin-bottom: 0.5rem; color: var(--status-info);"><strong>Catatan SPV:</strong> "${req.supervisorApproval.notes}"</div>` : ''}
        ${req.hrdApproval?.notes ? `<div style="margin-bottom: 0.5rem; color: var(--status-success);"><strong>Catatan HRD:</strong> "${req.hrdApproval.notes}"</div>` : ''}
        ${req.status === 'APPROVED_HRD' ? `
          <div style="margin-top: 1rem; text-align: center;">
            <button class="btn btn-primary btn-sm" onclick="window.openLetterModal('${req.id}')">Buka & Cetak Surat Izin Resmi</button>
          </div>
        ` : ''}
      </div>
    `;
    openModal(modal);
  };

  window.openLetterModal = function(requestId) {
    const modal = document.getElementById('modal-letter');
    const bodyEl = document.getElementById('letter-modal-body');
    bodyEl.innerHTML = renderLetterModalContent(requestId);
    const printBtn = modal.querySelector('#btn-print-official-letter');
    if (printBtn) {
      printBtn.onclick = () => printDocument('official-permit-document', `Surat_Izin_PT_Siantar_Top_${requestId}`);
    }
    openModal(modal);
  };

  // --- 8. INITIALIZE APPLICATION LOGIC ---
  function renderCurrentView() {
    const container = document.getElementById('main-content-view');
    if (!container) return;

    if (currentActiveView === 'dashboard' || currentActiveView === 'riwayat') {
      renderEmployeeView(container);
    } else if (currentActiveView === 'kalender') {
      renderCalendarView(container);
    } else if (currentActiveView === 'persetujuan') {
      renderSupervisorView(container);
    } else if (currentActiveView === 'hrd') {
      renderHRDView(container);
    } else if (currentActiveView === 'kebijakan') {
      renderPolicyGuideView(container);
    } else {
      renderEmployeeView(container);
    }

    updateBadgeCounters();
  }

  function updateBadgeCounters() {
    const spvBadge = document.getElementById('badge-count-spv');
    const hrdBadge = document.getElementById('badge-count-hrd');
    const pendingSpv = state.getPendingSupervisorRequests().length;
    const pendingHrd = state.getPendingHRDRequests().length;

    if (spvBadge) {
      spvBadge.textContent = pendingSpv;
      spvBadge.style.display = pendingSpv > 0 ? 'inline-block' : 'none';
    }
    if (hrdBadge) {
      hrdBadge.textContent = pendingHrd;
      hrdBadge.style.display = pendingHrd > 0 ? 'inline-block' : 'none';
    }
  }

  function updateRoleUI(activeRole) {
    document.querySelectorAll('.role-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.role === activeRole);
    });

    const emp = state.currentEmployee;
    const avatarEl = document.getElementById('sidebar-user-avatar');
    const nameEl = document.getElementById('sidebar-user-name');
    const roleEl = document.getElementById('sidebar-user-role');

    if (avatarEl) avatarEl.textContent = emp.name.charAt(0);
    if (nameEl) nameEl.textContent = emp.name;
    if (roleEl) roleEl.textContent = `${emp.role} - ${emp.jobTitle.split(' ')[0]}`;

    const modalEmpName = document.getElementById('modal-emp-name');
    const modalEmpNik = document.getElementById('modal-emp-nik');
    const modalEmpDept = document.getElementById('modal-emp-dept');
    if (modalEmpName) modalEmpName.textContent = emp.name;
    if (modalEmpNik) modalEmpNik.textContent = emp.nik;
    if (modalEmpDept) modalEmpDept.textContent = `${emp.department} - ${emp.plantLocation}`;

    updateBadgeCounters();
  }

  function navigateTo(viewName) {
    currentActiveView = viewName;
    document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
      const href = item.getAttribute('href').replace('#', '');
      item.classList.toggle('active', href === viewName);
    });

    const pageHeading = document.getElementById('page-heading');
    const pageSubheading = document.getElementById('page-subheading');

    if (viewName === 'pengajuan') {
      window.openNewRequestModal();
      return;
    }

    if (pageHeading) {
      if (viewName === 'kalender') {
        pageHeading.textContent = 'Kalender Jadwal Izin Tim';
        pageSubheading.textContent = 'Monitoring Ketersediaan Shift & Personel Seluruh Lini';
      } else if (viewName === 'persetujuan') {
        pageHeading.textContent = 'Pusat Persetujuan Supervisor';
        pageSubheading.textContent = 'Verifikasi Permohonan Cuti Anggota Regu Produksi & Staf';
      } else if (viewName === 'hrd') {
        pageHeading.textContent = 'Manajemen & Rekapitulasi HRD';
        pageSubheading.textContent = 'Otorisasi Resmi, Pengawasan Kuota & Laporan Kehadiran';
      } else if (viewName === 'kebijakan') {
        pageHeading.textContent = 'Panduan & Kebijakan Cuti Karyawan';
        pageSubheading.textContent = 'Ketentuan Hak Izin Kerja Sesuai PP PT Siantar Top Tbk';
      } else {
        pageHeading.textContent = 'Portal Perizinan Karyawan';
        pageSubheading.textContent = 'PT Siantar Top Tbk - Unit Pabrik Waru Sidoarjo';
      }
    }

    renderCurrentView();
  }

  // --- 9. DOM INITIALIZATION ---
  document.addEventListener('DOMContentLoaded', () => {
    // Theme
    const themeBtn = document.getElementById('btn-theme-toggle');
    const sunIcon = document.getElementById('theme-icon-sun');
    const moonIcon = document.getElementById('theme-icon-moon');
    const savedTheme = localStorage.getItem('siantar_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    if (sunIcon && moonIcon) {
      sunIcon.style.display = savedTheme === 'dark' ? 'block' : 'none';
      moonIcon.style.display = savedTheme === 'dark' ? 'none' : 'block';
    }

    themeBtn?.addEventListener('click', () => {
      const cur = document.documentElement.getAttribute('data-theme') || 'light';
      const nxt = cur === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', nxt);
      localStorage.setItem('siantar_theme', nxt);
      if (sunIcon && moonIcon) {
        sunIcon.style.display = nxt === 'dark' ? 'block' : 'none';
        moonIcon.style.display = nxt === 'dark' ? 'none' : 'block';
      }
    });

    // Navigation
    const menuToggle = document.getElementById('btn-toggle-menu');
    const sidebar = document.getElementById('app-sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');
    function toggleSidebar(open) {
      sidebar?.classList.toggle('mobile-open', open);
      backdrop?.classList.toggle('active', open);
    }
    menuToggle?.addEventListener('click', () => toggleSidebar(true));
    backdrop?.addEventListener('click', () => toggleSidebar(false));

    document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const target = item.getAttribute('href').replace('#', '');
        navigateTo(target);
        if (window.innerWidth <= 768) toggleSidebar(false);
      });
    });

    // Role switcher
    document.querySelectorAll('.role-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const role = btn.dataset.role;
        state.setRole(role);
        updateRoleUI(role);
        if (role === 'Supervisor') navigateTo('persetujuan');
        else if (role === 'HRD') navigateTo('hrd');
        else navigateTo('dashboard');
        showToast('Pergantian Peran', `Beralih ke peran: <strong>${role}</strong>`, 'info');
      });
    });

    // Reset button
    document.getElementById('btn-reset-state')?.addEventListener('click', () => {
      if (confirm('Kembalikan data perizinan PT Siantar Top ke kondisi awal demonstrasi?')) {
        state.resetData();
        showToast('Reset Selesai', 'Data telah dikembalikan ke kondisi default.', 'warning');
        renderCurrentView();
      }
    });

    // Auth & Login
    const loginScreen = document.getElementById('login-screen');
    const appContainer = document.getElementById('app-container');
    const formLogin = document.getElementById('form-login');
    const passInput = document.getElementById('login-password');
    const passToggleBtn = document.getElementById('btn-toggle-password');
    const passIconEye = document.getElementById('pass-icon-eye');

    function updateAuthDisplay() {
      if (state.isLoggedIn) {
        if (loginScreen) {
          loginScreen.classList.add('hidden');
          loginScreen.style.display = 'none';
        }
        if (appContainer) appContainer.style.display = 'flex';
        updateRoleUI(state.currentRole);
        renderCurrentView();
      } else {
        if (loginScreen) {
          loginScreen.classList.remove('hidden');
          loginScreen.style.display = 'flex';
        }
        if (appContainer) appContainer.style.display = 'none';
      }
    }

    passToggleBtn?.addEventListener('click', () => {
      if (!passInput) return;
      const isPass = passInput.type === 'password';
      passInput.type = isPass ? 'text' : 'password';
      if (passIconEye) {
        passIconEye.innerHTML = isPass ?
          '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>' :
          '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>';
      }
    });

    formLogin?.addEventListener('submit', (e) => {
      e.preventDefault();
      const identifier = document.getElementById('login-identifier')?.value || 'ST-2024-0891';
      const password = passInput?.value || '123456';
      const res = state.login(identifier, password);
      if (res.success) {
        updateAuthDisplay();
        if (typeof confetti === 'function') confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
        showToast('Login Berhasil', `Selamat datang, <strong>${res.employee.name}</strong> (${res.employee.jobTitle}).`, 'success');
      }
    });

    document.querySelectorAll('.demo-account-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const nik = btn.dataset.nik;
        const res = state.login(nik, '123456');
        if (res.success) {
          updateAuthDisplay();
          if (typeof confetti === 'function') confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
          showToast('Login Demo Berhasil', `Masuk sebagai <strong>${res.employee.name}</strong> [${res.employee.role}].`, 'success');
        }
      });
    });

    const handleLogout = () => {
      if (confirm('Keluar dari sesi kerja Portal E-Izin PT Siantar Top?')) {
        state.logout();
        updateAuthDisplay();
        showToast('Logout Berhasil', 'Anda telah keluar dari sesi kerja.', 'info');
      }
    };

    document.getElementById('btn-sidebar-logout')?.addEventListener('click', handleLogout);
    document.getElementById('btn-header-logout')?.addEventListener('click', handleLogout);
    document.getElementById('link-forgot-pass')?.addEventListener('click', () => {
      alert('Informasi Pemulihan Akun:\nSilakan hubungi IT Helpdesk / HRD PT Siantar Top Tbk di ext: 104 atau email: it.support@siantartop.co.id.');
    });

    // Modals
    const modalRequest = document.getElementById('modal-new-request');
    document.getElementById('btn-close-modal-request')?.addEventListener('click', () => closeModal(modalRequest));
    document.getElementById('btn-cancel-request')?.addEventListener('click', () => closeModal(modalRequest));

    const canvas = document.getElementById('signature-pad-canvas');
    if (canvas) activeSignaturePad = new SignaturePad(canvas);
    document.getElementById('btn-clear-signature')?.addEventListener('click', () => activeSignaturePad?.clear());

    const dropzone = document.getElementById('file-dropzone-box');
    const fileInput = document.getElementById('real-file-input');
    const fileNameDisplay = document.getElementById('file-selected-name');
    dropzone?.addEventListener('click', () => fileInput?.click());
    fileInput?.addEventListener('change', () => {
      if (fileInput.files && fileInput.files[0]) {
        fileNameDisplay.textContent = `File terpilih: ${fileInput.files[0].name} (${(fileInput.files[0].size / 1024).toFixed(1)} KB)`;
        fileNameDisplay.style.color = 'var(--status-success)';
      }
    });

    const formRequest = document.getElementById('form-leave-request');
    formRequest?.addEventListener('submit', (e) => {
      e.preventDefault();
      const leaveType = document.getElementById('input-leave-type').value;
      const startDate = document.getElementById('input-start-date').value;
      const endDate = document.getElementById('input-end-date').value;
      const reason = document.getElementById('input-reason').value.trim();
      const handoverTo = document.getElementById('input-handover').value.trim();
      const emergencyContact = document.getElementById('input-emergency').value.trim();

      const totalDays = calculateWorkingDays(startDate, endDate);
      if (totalDays <= 0) {
        alert('Rentang tanggal tidak valid.');
        return;
      }
      if (activeSignaturePad?.isEmpty()) {
        alert('Silakan bubuhkan tanda tangan digital Anda pada kanvas tanda tangan.');
        return;
      }

      const signatureUrl = activeSignaturePad.toDataURL();
      const hasFile = fileInput?.files && fileInput.files[0] ? fileInput.files[0].name : null;

      const created = state.addRequest({
        leaveType,
        startDate,
        endDate,
        totalDays,
        reason,
        handoverTo,
        emergencyContact,
        attachmentUrl: hasFile,
        signatureUrl
      });

      closeModal(modalRequest);
      formRequest.reset();
      activeSignaturePad.clear();
      if (typeof confetti === 'function') confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      showToast('Pengajuan Berhasil Dikirim', `Pengajuan ${created.id} telah tercatat dan menunggu persetujuan atasan.`, 'success');
      renderCurrentView();
    });

    // Date calculators
    const startDateInput = document.getElementById('input-start-date');
    const endDateInput = document.getElementById('input-end-date');
    const daysLabel = document.getElementById('label-calculated-days');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().slice(0, 10);
    if (startDateInput) startDateInput.value = dateStr;
    if (endDateInput) endDateInput.value = dateStr;

    function updateDays() {
      if (startDateInput && endDateInput && daysLabel) {
        const days = calculateWorkingDays(startDateInput.value, endDateInput.value);
        daysLabel.textContent = `${days} Hari Kerja`;
      }
    }
    startDateInput?.addEventListener('change', () => {
      if (endDateInput.value < startDateInput.value) endDateInput.value = startDateInput.value;
      updateDays();
    });
    endDateInput?.addEventListener('change', updateDays);
    updateDays();

    // Tracking modal close
    const modalTracking = document.getElementById('modal-tracking');
    document.getElementById('btn-close-modal-tracking')?.addEventListener('click', () => closeModal(modalTracking));
    document.getElementById('btn-close-track-footer')?.addEventListener('click', () => closeModal(modalTracking));

    // Letter modal close
    const modalLetter = document.getElementById('modal-letter');
    document.getElementById('btn-close-modal-letter')?.addEventListener('click', () => closeModal(modalLetter));
    document.getElementById('btn-close-letter-footer')?.addEventListener('click', () => closeModal(modalLetter));

    // State sync
    state.subscribe(() => {
      updateRoleUI(state.currentRole);
      renderCurrentView();
    });

    // Run auth display check on boot
    updateAuthDisplay();
  });

})();

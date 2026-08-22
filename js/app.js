/* ==========================================================================
   PT SIANTAR TOP TBK - APP MAIN JAVASCRIPT ENTRYPOINT
   ========================================================================== */

import { state } from './state.js';
import { renderEmployeeView } from './views/employeeView.js';
import { renderSupervisorView } from './views/supervisorView.js';
import { renderHRDView } from './views/hrdView.js';
import { renderCalendarView } from './views/calendarView.js';
import { renderLetterModalContent, setupLetterModalActions } from './views/letterModal.js';
import { SignaturePad } from './utils/signature.js';
import { calculateWorkingDays, formatDateIndo, formatDateTime } from './utils/dateUtils.js';

// Global variables
let activeSignaturePad = null;
let currentActiveView = 'dashboard';

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNavigation();
  initRoleSwitcher();
  initModals();
  initCalculators();
  initStateSync();

  // Initial view render
  renderCurrentView();
});

/* ==========================================================================
   THEME TOGGLE
   ========================================================================== */
function initTheme() {
  const themeBtn = document.getElementById('btn-theme-toggle');
  const sunIcon = document.getElementById('theme-icon-sun');
  const moonIcon = document.getElementById('theme-icon-moon');

  const savedTheme = localStorage.getItem('siantar_theme') || 'light';
  applyTheme(savedTheme);

  themeBtn?.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const nextTheme = current === 'light' ? 'dark' : 'light';
    applyTheme(nextTheme);
  });

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('siantar_theme', theme);
    if (theme === 'dark') {
      sunIcon.style.display = 'block';
      moonIcon.style.display = 'none';
    } else {
      sunIcon.style.display = 'none';
      moonIcon.style.display = 'block';
    }
  }
}

/* ==========================================================================
   ROLE SWITCHER
   ========================================================================== */
function initRoleSwitcher() {
  const roleButtons = document.querySelectorAll('.role-btn');

  roleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const selectedRole = btn.dataset.role;
      state.setRole(selectedRole);
      updateRoleUI(selectedRole);

      // Auto route to relevant tab on role switch
      if (selectedRole === 'Supervisor') {
        navigateTo('persetujuan');
      } else if (selectedRole === 'HRD') {
        navigateTo('hrd');
      } else {
        navigateTo('dashboard');
      }

      showToast('Pergantian Peran', `Beralih ke peran: <strong>${selectedRole}</strong> (${state.currentEmployee.name})`, 'info');
    });
  });

  updateRoleUI(state.currentRole);
}

function updateRoleUI(activeRole) {
  // Update role buttons
  document.querySelectorAll('.role-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.role === activeRole);
  });

  // Update sidebar user profile
  const emp = state.currentEmployee;
  const avatarEl = document.getElementById('sidebar-user-avatar');
  const nameEl = document.getElementById('sidebar-user-name');
  const roleEl = document.getElementById('sidebar-user-role');

  if (avatarEl) avatarEl.textContent = emp.name.charAt(0);
  if (nameEl) nameEl.textContent = emp.name;
  if (roleEl) roleEl.textContent = `${emp.role} - ${emp.jobTitle.split(' ')[0]}`;

  // Update modal user preview
  const modalEmpName = document.getElementById('modal-emp-name');
  const modalEmpNik = document.getElementById('modal-emp-nik');
  const modalEmpDept = document.getElementById('modal-emp-dept');
  if (modalEmpName) modalEmpName.textContent = emp.name;
  if (modalEmpNik) modalEmpNik.textContent = emp.nik;
  if (modalEmpDept) modalEmpDept.textContent = `${emp.department} - ${emp.plantLocation}`;

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

/* ==========================================================================
   NAVIGATION & ROUTING
   ========================================================================== */
function initNavigation() {
  // Mobile sidebar toggle
  const menuToggle = document.getElementById('btn-toggle-menu');
  const sidebar = document.getElementById('app-sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');

  function toggleSidebar(open) {
    sidebar.classList.toggle('mobile-open', open);
    backdrop.classList.toggle('active', open);
  }

  menuToggle?.addEventListener('click', () => toggleSidebar(true));
  backdrop?.addEventListener('click', () => toggleSidebar(false));

  // Sidebar links
  const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const target = item.getAttribute('href').replace('#', '');
      navigateTo(target);
      if (window.innerWidth <= 768) {
        toggleSidebar(false);
      }
    });
  });

  // Reset simulator state button
  document.getElementById('btn-reset-state')?.addEventListener('click', () => {
    if (confirm('Kembalikan semua data perizinan PT Siantar Top ke kondisi awal demonstrasi?')) {
      state.resetData();
      showToast('Reset Selesai', 'Data demonstrasi telah dikembalikan ke kondisi default.', 'warning');
      renderCurrentView();
    }
  });
}

function navigateTo(viewName) {
  currentActiveView = viewName;

  // Update active navigation item
  document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
    const href = item.getAttribute('href').replace('#', '');
    item.classList.toggle('active', href === viewName);
  });

  // Update header title
  const pageHeading = document.getElementById('page-heading');
  const pageSubheading = document.getElementById('page-subheading');

  switch (viewName) {
    case 'dashboard':
    case 'riwayat':
      pageHeading.textContent = 'Portal Perizinan Karyawan';
      pageSubheading.textContent = 'PT Siantar Top Tbk - Unit Pabrik & Kantor Waru, Sidoarjo';
      break;
    case 'pengajuan':
      openNewRequestModal();
      return;
    case 'kalender':
      pageHeading.textContent = 'Kalender Jadwal Izin Tim';
      pageSubheading.textContent = 'Monitoring Ketersediaan Shift & Personel Seluruh Lini';
      break;
    case 'persetujuan':
      pageHeading.textContent = 'Pusat Persetujuan Supervisor';
      pageSubheading.textContent = 'Verifikasi Permohonan Cuti Anggota Regu Produksi & Staf';
      break;
    case 'hrd':
      pageHeading.textContent = 'Manajemen & Rekapitulasi HRD';
      pageSubheading.textContent = 'Otorisasi Resmi, Pengawasan Kuota & Laporan Kehadiran';
      break;
    case 'kebijakan':
      pageHeading.textContent = 'Panduan & Kebijakan Cuti Karyawan';
      pageSubheading.textContent = 'Ketentuan Hak Izin Kerja Sesuai PP PT Siantar Top Tbk';
      break;
    default:
      pageHeading.textContent = 'E-Izin PT Siantar Top Tbk';
  }

  renderCurrentView();
}

function renderCurrentView() {
  const container = document.getElementById('main-content-view');
  if (!container) return;

  switch (currentActiveView) {
    case 'dashboard':
    case 'riwayat':
      renderEmployeeView(container);
      break;
    case 'kalender':
      renderCalendarView(container);
      break;
    case 'persetujuan':
      renderSupervisorView(container);
      break;
    case 'hrd':
      renderHRDView(container);
      break;
    case 'kebijakan':
      renderPolicyGuideView(container);
      break;
    default:
      renderEmployeeView(container);
  }

  updateBadgeCounters();
}

function initStateSync() {
  state.subscribe(() => {
    updateRoleUI(state.currentRole);
    renderCurrentView();
  });
}

/* ==========================================================================
   KEBIJAKAN CUTI VIEW
   ========================================================================== */
function renderPolicyGuideView(container) {
  container.innerHTML = `
    <div class="card" style="margin-bottom: 1.5rem;">
      <div class="card-header">
        <div class="card-title-group">
          <div class="card-title-icon" style="background: var(--brand-primary-light); color: var(--brand-primary);">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
          </div>
          <div>
            <h3 class="card-title">Peraturan Perusahaan Mengenai Hak Cuti & Izin Kerja</h3>
            <p class="card-subtitle">Pedoman Resmi HRD PT Siantar Top Tbk Sesuai UU Ketenagakerjaan</p>
          </div>
        </div>
      </div>
      <div class="card-body" style="line-height: 1.7; font-size: 0.9rem;">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.25rem;">
          
          <div style="background: var(--bg-app); padding: 1.25rem; border-radius: var(--radius-md); border-left: 4px solid var(--brand-primary);">
            <h4 style="color: var(--brand-primary); margin-bottom: 0.5rem;">1. Cuti Tahunan (12 Hari Kerja)</h4>
            <p style="font-size: 0.82rem; color: var(--text-muted);">
              Diberikan kepada karyawan yang telah memiliki masa kerja minimal 12 bulan berturut-turut. Pengajuan wajib diajukan minimal <strong>3 hari sebelumnya</strong> untuk pengaturan shift pengganti.
            </p>
          </div>

          <div style="background: var(--bg-app); padding: 1.25rem; border-radius: var(--radius-md); border-left: 4px solid var(--status-warning);">
            <h4 style="color: #b45309; margin-bottom: 0.5rem;">2. Izin Sakit (Surat Dokter)</h4>
            <p style="font-size: 0.82rem; color: var(--text-muted);">
              Karyawan yang tidak dapat bekerja karena sakit berhak atas izin sakit dengan <strong>melampirkan Surat Keterangan Dokter (SKD)</strong> resmi yang mencantumkan diagnosis dan anjuran istirahat.
            </p>
          </div>

          <div style="background: var(--bg-app); padding: 1.25rem; border-radius: var(--radius-md); border-left: 4px solid var(--status-purple);">
            <h4 style="color: var(--status-purple); margin-bottom: 0.5rem;">3. Cuti Melahirkan (90 Hari)</h4>
            <p style="font-size: 0.82rem; color: var(--text-muted);">
              Karyawati berhak atas istirahat selama 1.5 bulan sebelum melahirkan dan 1.5 bulan sesudah melahirkan dengan tetap menerima upah penuh sesuai ketentuan ketenagakerjaan.
            </p>
          </div>

          <div style="background: var(--bg-app); padding: 1.25rem; border-radius: var(--radius-md); border-left: 4px solid var(--status-info);">
            <h4 style="color: var(--status-info); margin-bottom: 0.5rem;">4. Izin Khusus Resmi</h4>
            <ul style="font-size: 0.82rem; color: var(--text-muted); padding-left: 1.2rem; margin-top: 0.25rem;">
              <li>Karyawan Menikah: <strong>3 Hari</strong></li>
              <li>Pernikahan Anak Karyawan: <strong>2 Hari</strong></li>
              <li>Keluarga Inti Meninggal: <strong>2 Hari</strong></li>
              <li>Istri Melahirkan / Keguguran: <strong>2 Hari</strong></li>
            </ul>
          </div>

        </div>

        <div style="margin-top: 1.5rem; background: var(--brand-primary-light); padding: 1rem; border-radius: var(--radius-md); color: var(--brand-primary); font-size: 0.85rem;">
          <strong>Alur Standar Otorisasi:</strong> Karyawan Mengisi Formulir E-Izin ➔ Disetujui Kepala Bagian/Supervisor ➔ Otorisasi Terbit Surat Izin HRD ➔ Surat Digital Dapat Dicetak / Ditunjukkan ke Pos Satpam Pabrik.
        </div>
      </div>
    </div>
  `;
}

/* ==========================================================================
   MODAL HANDLERS
   ========================================================================== */
function initModals() {
  // 1. New Request Modal
  const modalRequest = document.getElementById('modal-new-request');
  const btnCloseRequest = document.getElementById('btn-close-modal-request');
  const btnCancelRequest = document.getElementById('btn-cancel-request');
  const formRequest = document.getElementById('form-leave-request');

  btnCloseRequest?.addEventListener('click', () => closeModal(modalRequest));
  btnCancelRequest?.addEventListener('click', () => closeModal(modalRequest));

  // Initialize Signature Pad inside modal
  const canvas = document.getElementById('signature-pad-canvas');
  if (canvas) {
    activeSignaturePad = new SignaturePad(canvas);
  }

  document.getElementById('btn-clear-signature')?.addEventListener('click', () => {
    activeSignaturePad?.clear();
  });

  // Mock file dropzone
  const dropzone = document.getElementById('file-dropzone-box');
  const fileInput = document.getElementById('real-file-input');
  const fileNameDisplay = document.getElementById('file-selected-name');

  dropzone?.addEventListener('click', () => fileInput?.click());
  fileInput?.addEventListener('change', () => {
    if (fileInput.files && fileInput.files[0]) {
      fileNameDisplay.textContent = `File terpilih: ${fileInput.files[0].name} (${(fileInput.files[0].size / 1024).toFixed(1)} KB)`;
      fileNameDisplay.style.color = 'var(--status-success)';
      fileNameDisplay.style.fontWeight = 'bold';
    }
  });

  // Form Submit Handler
  formRequest?.addEventListener('submit', (e) => {
    e.preventDefault();

    const leaveType = document.getElementById('input-leave-type').value;
    const startDate = document.getElementById('input-start-date').value;
    const endDate = document.getElementById('input-end-date').value;
    const reason = document.getElementById('input-reason').value.trim();
    const handoverTo = document.getElementById('input-handover').value.trim();
    const emergencyContact = document.getElementById('input-emergency').value.trim();

    if (!startDate || !endDate) {
      alert('Silakan pilih rentang tanggal izin.');
      return;
    }

    const totalDays = calculateWorkingDays(startDate, endDate);
    if (totalDays <= 0) {
      alert('Tanggal selesai tidak boleh lebih awal dari tanggal mulai.');
      return;
    }

    // Check signature
    if (activeSignaturePad?.isEmpty()) {
      alert('Silakan bubuhkan tanda tangan digital Anda pada area kanvas tanda tangan.');
      return;
    }

    const signatureUrl = activeSignaturePad.toDataURL();
    const hasFile = fileInput?.files && fileInput.files[0] ? fileInput.files[0].name : null;

    // Check annual leave quota balance
    if (leaveType === 'cuti_tahunan') {
      if (state.currentEmployee.leaveQuota.remaining < totalDays) {
        alert(`Sisa saldo cuti tahunan Anda (${state.currentEmployee.leaveQuota.remaining} hari) tidak mencukupi untuk pengajuan ${totalDays} hari.`);
        return;
      }
    }

    // Add new request to state
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
    fileNameDisplay.textContent = 'Maksimal ukuran file 5 MB';
    fileNameDisplay.style.color = 'var(--text-muted)';
    fileNameDisplay.style.fontWeight = 'normal';

    // Confetti celebration for good UX
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    }

    showToast('Pengajuan Berhasil Dikirim', `Pengajuan izin ${created.id} telah tercatat dan diteruskan ke Supervisor Anda (${state.currentEmployee.supervisorId ? 'Hendra Wijaya' : 'Atasan'}).`, 'success');
    renderCurrentView();
  });

  // 2. Tracking Modal
  const modalTracking = document.getElementById('modal-tracking');
  document.getElementById('btn-close-modal-tracking')?.addEventListener('click', () => closeModal(modalTracking));
  document.getElementById('btn-close-track-footer')?.addEventListener('click', () => closeModal(modalTracking));

  // 3. Official Letter Modal
  const modalLetter = document.getElementById('modal-letter');
  document.getElementById('btn-close-modal-letter')?.addEventListener('click', () => closeModal(modalLetter));
  document.getElementById('btn-close-letter-footer')?.addEventListener('click', () => closeModal(modalLetter));
}

function initCalculators() {
  const startDateInput = document.getElementById('input-start-date');
  const endDateInput = document.getElementById('input-end-date');
  const daysLabel = document.getElementById('label-calculated-days');

  // Set default dates (tomorrow to +2 days)
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
    if (endDateInput.value < startDateInput.value) {
      endDateInput.value = startDateInput.value;
    }
    updateDays();
  });

  endDateInput?.addEventListener('change', updateDays);
  updateDays();
}

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

// Global modal triggers accessible from views
window.openNewRequestModal = function() {
  const modal = document.getElementById('modal-new-request');
  openModal(modal);
  setTimeout(() => {
    activeSignaturePad?.resizeCanvas();
  }, 200);
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

  // Stepper state
  const isPendingSpv = req.status === 'PENDING_SPV';
  const isApprovedSpv = req.status === 'APPROVED_SPV';
  const isApprovedHrd = req.status === 'APPROVED_HRD';
  const isRejected = req.status === 'REJECTED';

  bodyEl.innerHTML = `
    <!-- Stepper Graphic -->
    <div class="timeline-stepper">
      <div class="step-item completed">
        <div class="step-circle">1</div>
        <div class="step-label">Diajukan</div>
        <div class="step-subtext">${formatDateTime(req.appliedAt)}</div>
      </div>

      <div class="step-item ${isRejected && !req.supervisorApproval?.actionAt ? 'rejected' : (isApprovedSpv || isApprovedHrd ? 'completed' : (isPendingSpv ? 'active' : ''))}">
        <div class="step-circle">${isApprovedSpv || isApprovedHrd ? '✓' : (isRejected && req.status === 'REJECTED' && req.supervisorApproval?.status === 'REJECTED' ? '✕' : '2')}</div>
        <div class="step-label">Persetujuan SPV</div>
        <div class="step-subtext">${req.supervisorApproval ? formatDateTime(req.supervisorApproval.actionAt) : 'Menunggu Review'}</div>
      </div>

      <div class="step-item ${isApprovedHrd ? 'completed' : (isApprovedSpv ? 'active' : (isRejected && req.hrdApproval?.status === 'REJECTED' ? 'rejected' : ''))}">
        <div class="step-circle">${isApprovedHrd ? '✓' : (isRejected && req.hrdApproval?.status === 'REJECTED' ? '✕' : '3')}</div>
        <div class="step-label">Verifikasi HRD</div>
        <div class="step-subtext">${req.hrdApproval ? formatDateTime(req.hrdApproval.actionAt) : (isApprovedSpv ? 'Dalam Proses HRD' : 'Menunggu SPV')}</div>
      </div>

      <div class="step-item ${isApprovedHrd ? 'completed' : ''}">
        <div class="step-circle">${isApprovedHrd ? '✓' : '4'}</div>
        <div class="step-label">Surat Terbit</div>
        <div class="step-subtext">${req.hrdApproval?.letterNumber ? 'Resmi' : '-'}</div>
      </div>
    </div>

    <!-- Ringkasan Rincian -->
    <div style="background: var(--bg-app); border-radius: var(--radius-md); padding: 1.25rem; font-size: 0.85rem; border: 1px solid var(--border-light);">
      <div style="margin-bottom: 0.5rem;"><strong>Periode Izin:</strong> ${formatDateIndo(req.startDate)} s/d ${formatDateIndo(req.endDate)} (${req.totalDays} Hari Kerja)</div>
      <div style="margin-bottom: 0.5rem;"><strong>Alasan:</strong> ${req.reason}</div>
      <div style="margin-bottom: 0.5rem;"><strong>Pelimpahan Tugas:</strong> ${req.handoverTo}</div>
      ${req.supervisorApproval?.notes ? `<div style="margin-bottom: 0.5rem; color: var(--status-info);"><strong>Catatan Supervisor:</strong> "${req.supervisorApproval.notes}"</div>` : ''}
      ${req.hrdApproval?.notes ? `<div style="margin-bottom: 0.5rem; color: var(--status-success);"><strong>Catatan HRD:</strong> "${req.hrdApproval.notes}"</div>` : ''}
      ${req.status === 'APPROVED_HRD' ? `
        <div style="margin-top: 1rem; text-align: center;">
          <button class="btn btn-primary btn-sm" onclick="window.openLetterModal('${req.id}')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
            Buka & Cetak Surat Izin Resmi
          </button>
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
  setupLetterModalActions(modal, requestId);

  openModal(modal);
};

/* ==========================================================================
   TOAST SYSTEM
   ========================================================================== */
export function showToast(title, message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  let iconSvg = '';
  if (type === 'success') {
    iconSvg = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>';
  } else if (type === 'danger') {
    iconSvg = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>';
  } else if (type === 'warning') {
    iconSvg = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';
  } else {
    iconSvg = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';
  }

  toast.innerHTML = `
    <div class="toast-icon">${iconSvg}</div>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-message">${message}</div>
    </div>
    <button class="toast-close">&times;</button>
  `;

  container.appendChild(toast);

  toast.querySelector('.toast-close').addEventListener('click', () => {
    toast.remove();
  });

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 300);
  }, 4500);
}

window.showToast = showToast;

/* ==========================================================================
   HRD / ADMIN MANAGEMENT & ANALYTICS VIEW
   ========================================================================== */

import { state } from '../state.js';
import { formatDateIndo, formatDateTime } from '../utils/dateUtils.js';
import { exportToCSV } from '../utils/exportUtils.js';

let chartInstance1 = null;
let chartInstance2 = null;

export function renderHRDView(container) {
  const pendingHrd = state.getPendingHRDRequests();
  const allApproved = state.getAllApprovedRequests();
  const allRequests = state.requests;
  const employees = state.employees;
  const hrdEmp = state.currentEmployee;

  container.innerHTML = `
    <!-- Header HRD Portal -->
    <div class="action-banner" style="background: linear-gradient(135deg, #831843 0%, #0f172a 100%);">
      <div class="banner-content">
        <div class="banner-tag" style="color: #f472b6; background: rgba(244, 114, 182, 0.15);">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
          HRD & Personnel Administration
        </div>
        <h2 class="banner-title">Dashboard Manajemen HRD - PT Siantar Top Tbk</h2>
        <p class="banner-desc">
          Otorisasi penerbitan surat izin resmi perusahaan, rekapitulasi data absensi, dan kontrol kuota cuti karyawan seluruh lini pabrik dan kantor pusat.
        </p>
      </div>
      <div class="banner-actions">
        <button class="btn btn-secondary" id="btn-export-hr-csv" style="background: rgba(255,255,255,0.15); color: #fff; border: 1px solid rgba(255,255,255,0.25);">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          Ekspor CSV Rekap
        </button>
      </div>
    </div>

    <!-- HRD KPI Grid -->
    <div class="kpi-grid">
      <div class="kpi-card kpi-warning">
        <div class="kpi-info">
          <span class="kpi-label">Menunggu Otorisasi HRD</span>
          <div class="kpi-value">${pendingHrd.length}</div>
          <span class="kpi-subtext">Telah disetujui SPV</span>
        </div>
        <div class="kpi-icon-box">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
        </div>
      </div>

      <div class="kpi-card kpi-success">
        <div class="kpi-info">
          <span class="kpi-label">Surat Izin Resmi Terbit</span>
          <div class="kpi-value">${allApproved.length}</div>
          <span class="kpi-subtext">Izin sah & bernomor dokumen</span>
        </div>
        <div class="kpi-icon-box">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
        </div>
      </div>

      <div class="kpi-card kpi-info">
        <div class="kpi-info">
          <span class="kpi-label">Total Karyawan Aktif</span>
          <div class="kpi-value">${employees.length}</div>
          <span class="kpi-subtext">Pabrik Sidoarjo & Bekasi</span>
        </div>
        <div class="kpi-icon-box">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
        </div>
      </div>

      <div class="kpi-card kpi-danger">
        <div class="kpi-info">
          <span class="kpi-label">Total Permohonan Cuti/Izin</span>
          <div class="kpi-value">${allRequests.length}</div>
          <span class="kpi-subtext">Semua status perizinan</span>
        </div>
        <div class="kpi-icon-box">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
        </div>
      </div>
    </div>

    <!-- Charts Section -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 1.25rem; margin-bottom: 1.5rem;">
      <div class="card">
        <div class="card-header">
          <div class="card-title-group">
            <div class="card-title-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>
            </div>
            <div>
              <h3 class="card-title">Proporsi Kategori Izin</h3>
              <p class="card-subtitle">Distribusi permohonan berdasarkan jenis</p>
            </div>
          </div>
        </div>
        <div class="card-body" style="height: 250px; display: flex; align-items: center; justify-content: center;">
          <canvas id="chart-leave-types"></canvas>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <div class="card-title-group">
            <div class="card-title-icon" style="background: var(--status-info-bg); color: var(--status-info);">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
            </div>
            <div>
              <h3 class="card-title">Izin per Departemen / Pabrik</h3>
              <p class="card-subtitle">Volume permohonan lintas divisi operasional</p>
            </div>
          </div>
        </div>
        <div class="card-body" style="height: 250px; display: flex; align-items: center; justify-content: center;">
          <canvas id="chart-dept-leave"></canvas>
        </div>
      </div>
    </div>

    <!-- Antrean Final HRD Approval -->
    <div class="card" style="margin-bottom: 1.5rem;">
      <div class="card-header">
        <div class="card-title-group">
          <div class="card-title-icon" style="background: var(--brand-primary-light); color: var(--brand-primary);">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
          </div>
          <div>
            <h3 class="card-title">Otorisasi & Penerbitan Surat Izin HRD (${pendingHrd.length})</h3>
            <p class="card-subtitle">Pengajuan yang telah disetujui atasan regu dan siap diterbitkan nomor surat resminya</p>
          </div>
        </div>
      </div>

      <div class="card-body" style="padding: 1.25rem;">
        ${pendingHrd.length === 0 ? `
          <div style="text-align: center; padding: 2.5rem 1rem; color: var(--text-muted);">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 0.5rem; color: var(--status-success);"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            <h4 style="color: var(--text-main);">Tidak Ada Antrean Tertunda HRD</h4>
            <p style="font-size: 0.85rem; margin-top: 0.25rem;">Seluruh surat izin yang diapprove supervisor telah tervalidasi.</p>
          </div>
        ` : `
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Karyawan & NIK</th>
                  <th>Departemen & Supervisor</th>
                  <th>Jenis & Durasi Izin</th>
                  <th>Alasan & Catatan SPV</th>
                  <th style="text-align: right;">Aksi Terbitkan Izin</th>
                </tr>
              </thead>
              <tbody>
                ${pendingHrd.map(req => `
                  <tr>
                    <td>
                      <strong>${req.employeeName}</strong>
                      <div style="font-size: 0.72rem; color: var(--text-muted);">NIK: ${req.nik}</div>
                      <div style="font-size: 0.7rem; color: var(--brand-primary);">${req.jobTitle}</div>
                    </td>
                    <td>
                      <span class="badge badge-department">${req.department}</span>
                      <div style="font-size: 0.72rem; color: var(--status-info); margin-top: 3px;">
                        ✓ SPV: ${req.supervisorApproval?.supervisorName || '-'}
                      </div>
                    </td>
                    <td>
                      <span class="badge badge-type">${req.leaveTypeName}</span>
                      <div style="font-size: 0.78rem; font-weight: 600; margin-top: 2px;">
                        ${formatDateIndo(req.startDate)} s/d ${formatDateIndo(req.endDate)}
                      </div>
                      <div style="font-size: 0.72rem; color: var(--text-muted);">${req.totalDays} Hari Kerja</div>
                    </td>
                    <td>
                      <div style="font-size: 0.8rem;">${req.reason}</div>
                      <div style="font-size: 0.72rem; color: var(--text-muted); font-style: italic; margin-top: 2px;">
                        Catatan SPV: "${req.supervisorApproval?.notes || '-'}"
                      </div>
                    </td>
                    <td style="text-align: right;">
                      <div class="table-actions" style="justify-content: flex-end;">
                        <button class="btn btn-primary btn-sm btn-hrd-approve" data-id="${req.id}">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                          Terbitkan Surat Resmi
                        </button>
                        <button class="btn btn-danger btn-sm btn-hrd-reject" data-id="${req.id}">
                          Tolak
                        </button>
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

    <!-- Master Karyawan & Sisa Kuota Cuti -->
    <div class="card">
      <div class="card-header">
        <div class="card-title-group">
          <div class="card-title-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          </div>
          <div>
            <h3 class="card-title">Master Saldo Cuti Karyawan PT Siantar Top Tbk</h3>
            <p class="card-subtitle">Data pemakaian dan hak cuti tahunan berjalan seluruh staf & operator</p>
          </div>
        </div>
      </div>

      <div class="card-body" style="padding: 1.25rem;">
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>NIK & Nama Karyawan</th>
                <th>Jabatan & Departemen</th>
                <th>Lokasi Pabrik</th>
                <th>Kuota Tahunan</th>
                <th>Cuti Terpakai</th>
                <th>Sisa Saldo Cuti</th>
                <th>Sakit / Khusus</th>
              </tr>
            </thead>
            <tbody>
              ${employees.map(emp => `
                <tr>
                  <td>
                    <div class="user-cell">
                      <div class="user-avatar-sm">${emp.name.charAt(0)}</div>
                      <div>
                        <strong>${emp.name}</strong>
                        <div style="font-size: 0.72rem; color: var(--text-muted);">${emp.nik}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div><strong>${emp.jobTitle}</strong></div>
                    <div style="font-size: 0.72rem; color: var(--text-muted);">${emp.department}</div>
                  </td>
                  <td>
                    <span style="font-size: 0.8rem;">${emp.plantLocation}</span>
                  </td>
                  <td>
                    <strong>${emp.leaveQuota.annual} Hari</strong>
                  </td>
                  <td>
                    <span style="color: var(--status-warning); font-weight: 700;">${emp.leaveQuota.taken} Hari</span>
                  </td>
                  <td>
                    <strong style="color: var(--status-success); font-size: 0.95rem;">${emp.leaveQuota.remaining} Hari</strong>
                  </td>
                  <td>
                    <div style="font-size: 0.75rem;">Sakit: ${emp.leaveQuota.sickTaken} hr | Khusus: ${emp.leaveQuota.specialTaken} hr</div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  // Attach HRD Approval Listeners
  container.querySelectorAll('.btn-hrd-approve').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const reqId = e.currentTarget.dataset.id;
      state.approveByHRD(reqId, 'Dokumen perizinan disetujui resmi oleh HRD.');
      window.showToast('Surat Izin Resmi Diterbitkan', `Dokumen perizinan untuk ${reqId} telah resmi diterbitkan berstempel digital.`, 'success');
      // Trigger modal preview of official letter
      setTimeout(() => {
        window.openLetterModal(reqId);
      }, 400);
    });
  });

  container.querySelectorAll('.btn-hrd-reject').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const reqId = e.currentTarget.dataset.id;
      const reason = prompt('Masukkan alasan penolakan HRD:', 'Kuota cuti tidak sesuai atau berkas persyaratan belum lengkap.');
      if (reason) {
        state.rejectByHRD(reqId, reason);
        window.showToast('Pengajuan Ditolak HRD', `Pengajuan ${reqId} telah ditolak.`, 'danger');
      }
    });
  });

  // Attach CSV Export
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
      'No Surat Izin': r.hrdApproval?.letterNumber || '-',
      'Disetujui HRD Pada': r.hrdApproval?.actionAt ? formatDateTime(r.hrdApproval.actionAt) : '-'
    }));

    exportToCSV(exportData, `Rekap_Izin_Siantar_Top_${new Date().toISOString().slice(0,10)}.csv`);
    window.showToast('Ekspor Berhasil', 'Data rekapitulasi perizinan berhasil diunduh dalam format CSV/Excel.', 'info');
  });

  // Render Charts using Chart.js
  initHRDCharts();
}

function initHRDCharts() {
  if (typeof Chart === 'undefined') return;

  // Chart 1: Leave Types Distribution
  const ctx1 = document.getElementById('chart-leave-types');
  if (ctx1) {
    if (chartInstance1) chartInstance1.destroy();

    const counts = {
      'Cuti Tahunan': 0,
      'Izin Sakit': 0,
      'Kepentingan Pribadi': 0,
      'Cuti Maternitas': 0,
      'Dispensasi/Lainnya': 0
    };

    state.requests.forEach(r => {
      if (r.leaveType === 'cuti_tahunan') counts['Cuti Tahunan']++;
      else if (r.leaveType === 'izin_sakit') counts['Izin Sakit']++;
      else if (r.leaveType === 'izin_penting') counts['Kepentingan Pribadi']++;
      else if (r.leaveType === 'cuti_melahirkan') counts['Cuti Maternitas']++;
      else counts['Dispensasi/Lainnya']++;
    });

    chartInstance1 = new Chart(ctx1, {
      type: 'doughnut',
      data: {
        labels: Object.keys(counts),
        datasets: [{
          data: Object.values(counts),
          backgroundColor: ['#d32f2f', '#f59e0b', '#0284c7', '#8b5cf6', '#10b981'],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11, family: 'Plus Jakarta Sans' } } }
        }
      }
    });
  }

  // Chart 2: Department Distribution
  const ctx2 = document.getElementById('chart-dept-leave');
  if (ctx2) {
    if (chartInstance2) chartInstance2.destroy();

    const deptCounts = {};
    state.requests.forEach(r => {
      deptCounts[r.department] = (deptCounts[r.department] || 0) + 1;
    });

    chartInstance2 = new Chart(ctx2, {
      type: 'bar',
      data: {
        labels: Object.keys(deptCounts),
        datasets: [{
          label: 'Jumlah Pengajuan',
          data: Object.values(deptCounts),
          backgroundColor: '#d32f2f',
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: true, ticks: { stepSize: 1 } }
        },
        plugins: {
          legend: { display: false }
        }
      }
    });
  }
}

/* ==========================================================================
   EMPLOYEE DASHBOARD & APPLICATION VIEW
   ========================================================================== */

import { state } from '../state.js';
import { formatDateIndo, formatDateTime } from '../utils/dateUtils.js';

export function renderEmployeeView(container) {
  const emp = state.currentEmployee;
  const requests = state.getEmployeeRequests(emp.id);

  // Status badges helper
  function getStatusBadge(status) {
    switch (status) {
      case 'PENDING_SPV':
        return '<span class="badge badge-pending">Menunggu Supervisor</span>';
      case 'APPROVED_SPV':
        return '<span class="badge badge-approved-spv">Disetujui SPV (Menunggu HRD)</span>';
      case 'APPROVED_HRD':
        return '<span class="badge badge-approved-hrd">Disetujui HRD (Terbit)</span>';
      case 'REJECTED':
        return '<span class="badge badge-rejected">Ditolak</span>';
      default:
        return `<span class="badge">${status}</span>`;
    }
  }

  container.innerHTML = `
    <!-- Banner Sambutan & Aksi Cepat -->
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

    <!-- KPI Sisa Cuti & Kuota -->
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
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
        </div>
      </div>
    </div>

    <!-- Riwayat Pengajuan Izin -->
    <div class="card">
      <div class="card-header">
        <div class="card-title-group">
          <div class="card-title-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
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
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 0.75rem; color: var(--text-subtle);"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>
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
                    <td>
                      <span class="badge badge-type">${req.leaveTypeName}</span>
                    </td>
                    <td>
                      <strong>${formatDateIndo(req.startDate)}</strong>
                      ${req.startDate !== req.endDate ? `<div style="font-size: 0.74rem; color: var(--text-muted);">s/d ${formatDateIndo(req.endDate)}</div>` : ''}
                    </td>
                    <td>
                      <strong>${req.totalDays} Hari</strong>
                    </td>
                    <td>
                      <div style="max-width: 260px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${req.reason}">
                        ${req.reason}
                      </div>
                      ${req.attachmentUrl ? `<div style="font-size: 0.72rem; color: var(--status-info); margin-top: 2px;">📎 Lampiran Tersedia</div>` : ''}
                    </td>
                    <td>
                      ${getStatusBadge(req.status)}
                    </td>
                    <td style="text-align: right;">
                      <div class="table-actions" style="justify-content: flex-end;">
                        <button class="btn btn-secondary btn-sm btn-track-status" data-id="${req.id}" title="Lacak Timeline Status">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                          Lacak
                        </button>
                        ${req.status === 'APPROVED_HRD' ? `
                          <button class="btn btn-primary btn-sm btn-view-letter" data-id="${req.id}" title="Cetak Surat Izin Resmi">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                            Surat Izin
                          </button>
                        ` : ''}
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

  // Attach event handlers
  container.querySelector('#btn-open-new-request')?.addEventListener('click', () => {
    window.openNewRequestModal();
  });

  container.querySelector('#btn-refresh-employee-list')?.addEventListener('click', () => {
    renderEmployeeView(container);
  });

  container.querySelectorAll('.btn-track-status').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const reqId = e.currentTarget.dataset.id;
      window.openTrackingModal(reqId);
    });
  });

  container.querySelectorAll('.btn-view-letter').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const reqId = e.currentTarget.dataset.id;
      window.openLetterModal(reqId);
    });
  });
}

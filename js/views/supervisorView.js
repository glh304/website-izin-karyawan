/* ==========================================================================
   SUPERVISOR / KEPALA BAGIAN APPROVAL VIEW
   ========================================================================== */

import { state } from '../state.js';
import { formatDateIndo, formatDateTime } from '../utils/dateUtils.js';

export function renderSupervisorView(container) {
  const pendingRequests = state.getPendingSupervisorRequests();
  const allRequests = state.requests;
  const supervisorEmp = state.currentEmployee;

  // Filter approved by this SPV
  const approvedBySpv = allRequests.filter(r => r.supervisorApproval && r.supervisorApproval.status === 'APPROVED');
  const rejectedBySpv = allRequests.filter(r => r.supervisorApproval && r.supervisorApproval.status === 'REJECTED');

  container.innerHTML = `
    <!-- Header Summary Supervisor -->
    <div class="action-banner" style="background: linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%);">
      <div class="banner-content">
        <div class="banner-tag" style="color: #60a5fa; background: rgba(96, 165, 250, 0.15);">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><polyline points="17 11 19 13 23 9"></polyline></svg>
          Portal Approval Supervisor / Kabag
        </div>
        <h2 class="banner-title">Pusat Persetujuan - ${supervisorEmp.name}</h2>
        <p class="banner-desc">
          ${supervisorEmp.jobTitle} | ${supervisorEmp.department} (${supervisorEmp.plantLocation}). Tinjau dan setujui permohonan izin atau cuti karyawan sebelum diteruskan ke HRD PT Siantar Top Tbk.
        </p>
      </div>
      <div class="banner-actions">
        <span class="badge ${pendingRequests.length > 0 ? 'badge-pending' : 'badge-approved-hrd'}" style="font-size: 0.95rem; padding: 0.6rem 1.2rem;">
          ${pendingRequests.length} Pengajuan Menunggu Review
        </span>
      </div>
    </div>

    <!-- KPI Widgets -->
    <div class="kpi-grid">
      <div class="kpi-card kpi-warning">
        <div class="kpi-info">
          <span class="kpi-label">Menunggu Persetujuan</span>
          <div class="kpi-value">${pendingRequests.length}</div>
          <span class="kpi-subtext">Perlu tindakan persetujuan Anda</span>
        </div>
        <div class="kpi-icon-box">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
        </div>
      </div>

      <div class="kpi-card kpi-success">
        <div class="kpi-info">
          <span class="kpi-label">Telah Anda Setujui</span>
          <div class="kpi-value">${approvedBySpv.length}</div>
          <span class="kpi-subtext">Diteruskan ke verifikasi HRD</span>
        </div>
        <div class="kpi-icon-box">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
        </div>
      </div>

      <div class="kpi-card kpi-danger">
        <div class="kpi-info">
          <span class="kpi-label">Ditolak / Dikembalikan</span>
          <div class="kpi-value">${rejectedBySpv.length}</div>
          <span class="kpi-subtext">Karena kendala operasional regu</span>
        </div>
        <div class="kpi-icon-box">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
        </div>
      </div>

      <div class="kpi-card kpi-info">
        <div class="kpi-info">
          <span class="kpi-label">Total Anggota Regu</span>
          <div class="kpi-value">${state.employees.length}</div>
          <span class="kpi-subtext">Karyawan aktif pabrik/unit</span>
        </div>
        <div class="kpi-icon-box">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
        </div>
      </div>
    </div>

    <!-- Antrean Pengajuan Masuk -->
    <div class="card" style="margin-bottom: 1.5rem;">
      <div class="card-header">
        <div class="card-title-group">
          <div class="card-title-icon" style="background: var(--status-warning-bg); color: var(--status-warning);">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          </div>
          <div>
            <h3 class="card-title">Antrean Pengajuan Izin Menunggu Persetujuan (${pendingRequests.length})</h3>
            <p class="card-subtitle">Silakan periksa detail alasan, ketersediaan pengganti shift, dan lampiran surat dokter</p>
          </div>
        </div>
      </div>

      <div class="card-body" style="padding: 1.25rem;">
        ${pendingRequests.length === 0 ? `
          <div style="text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 0.75rem; color: var(--status-success);"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            <h4 style="color: var(--text-main);">Semua Pengajuan Selesai Diproses!</h4>
            <p style="font-size: 0.85rem; margin-top: 0.25rem;">Tidak ada permohonan izin baru yang tertunda di antrean Anda saat ini.</p>
          </div>
        ` : `
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Karyawan Pemohon</th>
                  <th>Departemen / Divisi</th>
                  <th>Jenis & Periode Izin</th>
                  <th>Alasan & Pelimpahan Tugas</th>
                  <th>Bukti / TTD</th>
                  <th style="text-align: right;">Keputusan Approval</th>
                </tr>
              </thead>
              <tbody>
                ${pendingRequests.map(req => `
                  <tr>
                    <td>
                      <div class="user-cell">
                        <div class="user-avatar-sm">${req.employeeName.charAt(0)}</div>
                        <div>
                          <strong>${req.employeeName}</strong>
                          <div style="font-size: 0.72rem; color: var(--text-muted);">NIK: ${req.nik}</div>
                          <div style="font-size: 0.7rem; color: var(--brand-primary);">${req.jobTitle}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span class="badge badge-department">${req.department}</span>
                      <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 2px;">Diajukan: ${formatDateTime(req.appliedAt)}</div>
                    </td>
                    <td>
                      <span class="badge badge-type" style="margin-bottom: 4px; display: inline-block;">${req.leaveTypeName}</span>
                      <div><strong>${formatDateIndo(req.startDate)}</strong> s/d <strong>${formatDateIndo(req.endDate)}</strong></div>
                      <div style="font-size: 0.74rem; color: var(--text-muted);">Durasi: <strong>${req.totalDays} Hari Kerja</strong></div>
                    </td>
                    <td>
                      <div style="max-width: 240px; font-size: 0.82rem; margin-bottom: 4px;">${req.reason}</div>
                      <div style="font-size: 0.72rem; color: var(--text-muted);">
                        <strong>Pengganti:</strong> ${req.handoverTo}
                      </div>
                    </td>
                    <td>
                      ${req.attachmentUrl ? `
                        <button class="btn btn-secondary btn-sm btn-view-attachment" data-url="${req.attachmentUrl}" style="margin-bottom: 4px;">
                          📎 Dokumen
                        </button>
                      ` : '<span style="font-size: 0.75rem; color: var(--text-subtle);">Tanpa Dokumen</span>'}
                      ${req.signatureUrl ? `
                        <div style="font-size: 0.7rem; color: var(--status-success);">✓ TTD Digital Valid</div>
                      ` : ''}
                    </td>
                    <td style="text-align: right;">
                      <div class="table-actions" style="justify-content: flex-end;">
                        <button class="btn btn-success btn-sm btn-spv-approve" data-id="${req.id}">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                          Setujui
                        </button>
                        <button class="btn btn-danger btn-sm btn-spv-reject" data-id="${req.id}">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
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

    <!-- Riwayat Keputusan Supervisor -->
    <div class="card">
      <div class="card-header">
        <div class="card-title-group">
          <div class="card-title-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
          </div>
          <div>
            <h3 class="card-title">Riwayat Keputusan Approval Anda</h3>
            <p class="card-subtitle">Catatan log verifikasi izin oleh atasan langsung</p>
          </div>
        </div>
      </div>
      <div class="card-body" style="padding: 1.25rem;">
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>No. Dokumen</th>
                <th>Karyawan</th>
                <th>Jenis Izin & Tanggal</th>
                <th>Status Terkini</th>
                <th>Catatan Supervisor</th>
                <th>Waktu Keputusan</th>
              </tr>
            </thead>
            <tbody>
              ${allRequests.filter(r => r.supervisorApproval).map(req => `
                <tr>
                  <td><strong>${req.id}</strong></td>
                  <td>
                    <strong>${req.employeeName}</strong>
                    <div style="font-size: 0.72rem; color: var(--text-muted);">${req.department}</div>
                  </td>
                  <td>
                    <span class="badge badge-type">${req.leaveTypeName}</span>
                    <div style="font-size: 0.75rem;">${formatDateIndo(req.startDate)} (${req.totalDays} hari)</div>
                  </td>
                  <td>
                    ${req.status === 'APPROVED_HRD' ? '<span class="badge badge-approved-hrd">Disetujui HRD (Final)</span>' :
                      req.status === 'APPROVED_SPV' ? '<span class="badge badge-approved-spv">Disetujui SPV</span>' :
                      '<span class="badge badge-rejected">Ditolak</span>'}
                  </td>
                  <td>
                    <div style="font-size: 0.8rem; font-style: italic;">"${req.supervisorApproval.notes || '-'}"</div>
                  </td>
                  <td>
                    <div style="font-size: 0.75rem; color: var(--text-muted);">${formatDateTime(req.supervisorApproval.actionAt)}</div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  // Attach Supervisor Action Listeners
  container.querySelectorAll('.btn-spv-approve').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const reqId = e.currentTarget.dataset.id;
      const notes = prompt('Tambahkan catatan persetujuan untuk HRD (Opsional):', 'Disetujui, pekerjaan shift telah diatur.');
      if (notes !== null) {
        state.approveBySupervisor(reqId, notes);
        window.showToast('Sukses Disetujui', `Pengajuan ${reqId} berhasil disetujui dan diteruskan ke HRD.`, 'success');
      }
    });
  });

  container.querySelectorAll('.btn-spv-reject').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const reqId = e.currentTarget.dataset.id;
      const reason = prompt('Masukkan alasan penolakan pengajuan izin ini:', 'Operasional regu tidak memungkinkan karena keterbatasan personel shift.');
      if (reason) {
        state.rejectBySupervisor(reqId, reason);
        window.showToast('Pengajuan Ditolak', `Pengajuan ${reqId} telah ditolak.`, 'danger');
      }
    });
  });

  container.querySelectorAll('.btn-view-attachment').forEach(btn => {
    btn.addEventListener('click', (e) => {
      alert(`[SIMULASI BERKAS DOKUMEN]:\nMembuka lampiran surat dokter / berkas pendukung resmi.`);
    });
  });
}

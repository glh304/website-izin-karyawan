/* ==========================================================================
   OFFICIAL PERMIT LETTER & MODAL GENERATOR (PT SIANTAR TOP TBK)
   ========================================================================== */

import { state } from '../state.js';
import { formatDateIndo, formatDateTime } from '../utils/dateUtils.js';
import { printDocument } from '../utils/exportUtils.js';

export function renderLetterModalContent(requestId) {
  const req = state.getRequestById(requestId);
  if (!req) return '<div style="padding: 2rem; text-align: center;">Data pengajuan tidak ditemukan.</div>';

  const docNumber = req.hrdApproval?.letterNumber || `DRAFT/${req.id}`;
  const qrData = `https://siantartop.co.id/verify-permit?doc=${encodeURIComponent(docNumber)}&emp=${encodeURIComponent(req.nik)}&status=VALID`;

  return `
    <div class="official-letter-preview" id="official-permit-document">
      <!-- Kop Surat Resmi PT Siantar Top Tbk -->
      <div class="letter-header">
        <div class="letter-logo-box">
          ST
        </div>
        <div class="letter-company-info">
          <div class="letter-company-title">PT SIANTAR TOP Tbk</div>
          <div class="letter-company-sub">PRODUSEN MAKANAN RINGAN & BISKUIT TERKEMUKA</div>
          <div class="letter-company-address">
            Kantor & Pabrik Utama: Jl. Tambak Sawah No. 21-23, Kec. Waru, Kab. Sidoarjo 61256, Jawa Timur<br>
            Telp: (031) 8667321, 8667325 | Email: info@siantartop.co.id | Website: www.siantartop.co.id
          </div>
        </div>
      </div>

      <!-- Judul Surat & Nomor Dokumen -->
      <div class="letter-title-section">
        <div class="letter-main-title">SURAT KETERANGAN PERIZINAN & CUTI KARYAWAN</div>
        <div class="letter-doc-number">Nomor Dokumen: <strong>${docNumber}</strong></div>
      </div>

      <!-- Paragraf Pembuka -->
      <p class="letter-intro">
        Berdasarkan permohonan yang diajukan oleh karyawan yang bersangkutan, manajemen HRD & General Affairs PT Siantar Top Tbk dengan ini memberikan izin / cuti kerja resmi kepada:
      </p>

      <!-- Tabel Data Karyawan -->
      <table class="letter-details-table">
        <tbody>
          <tr>
            <td class="field-name">Nomor Induk Karyawan (NIK)</td>
            <td class="colon">:</td>
            <td class="field-value"><strong>${req.nik}</strong></td>
          </tr>
          <tr>
            <td class="field-name">Nama Lengkap Karyawan</td>
            <td class="colon">:</td>
            <td class="field-value"><strong>${req.employeeName}</strong></td>
          </tr>
          <tr>
            <td class="field-name">Jabatan / Posisi Kerja</td>
            <td class="colon">:</td>
            <td class="field-value">${req.jobTitle}</td>
          </tr>
          <tr>
            <td class="field-name">Departemen / Divisi Pabrik</td>
            <td class="colon">:</td>
            <td class="field-value">${req.department}</td>
          </tr>
          <tr>
            <td class="field-name">Jenis Permohonan Izin</td>
            <td class="colon">:</td>
            <td class="field-value"><strong style="color: #b71c1c;">${req.leaveTypeName}</strong></td>
          </tr>
          <tr>
            <td class="field-name">Tanggal Pelaksanaan</td>
            <td class="colon">:</td>
            <td class="field-value">
              <strong>${formatDateIndo(req.startDate, true)}</strong> s/d <strong>${formatDateIndo(req.endDate, true)}</strong>
            </td>
          </tr>
          <tr>
            <td class="field-name">Total Durasi Izin</td>
            <td class="colon">:</td>
            <td class="field-value"><strong>${req.totalDays} Hari Kerja</strong></td>
          </tr>
          <tr>
            <td class="field-name">Alasan / Keterangan Izin</td>
            <td class="colon">:</td>
            <td class="field-value">${req.reason}</td>
          </tr>
          <tr>
            <td class="field-name">Pelimpahan Tugas (Handover)</td>
            <td class="colon">:</td>
            <td class="field-value">${req.handoverTo}</td>
          </tr>
          <tr>
            <td class="field-name">Kontak Darurat</td>
            <td class="colon">:</td>
            <td class="field-value">${req.emergencyContact}</td>
          </tr>
        </tbody>
      </table>

      <!-- Catatan Ketentuan -->
      <div class="letter-highlight-box">
        <strong>Ketentuan Perusahaan:</strong><br>
        1. Karyawan wajib kembali bertugas tepat waktu pada hari kerja berikutnya setelah masa izin berakhir.<br>
        2. Surat izin ini sah dan tervalidasi secara elektronik melalui sistem E-Izin PT Siantar Top Tbk.
      </div>

      <!-- Blok Tanda Tangan & Cap -->
      <div class="letter-signatures-grid">
        <!-- Pemohon -->
        <div class="signature-column">
          <div class="sig-role-title">Pemohon (Karyawan)</div>
          <div class="sig-image-box">
            ${req.signatureUrl ? `<img src="${req.signatureUrl}" alt="TTD Karyawan">` : '<span style="font-size: 0.75rem; color: #9ca3af;">(Tanda Tangan)</span>'}
          </div>
          <div class="sig-name">${req.employeeName}</div>
          <div class="sig-nip">NIK: ${req.nik}</div>
        </div>

        <!-- Supervisor -->
        <div class="signature-column">
          <div class="sig-role-title">Mengetahui (Supervisor / Kabag)</div>
          <div class="sig-image-box">
            ${req.supervisorApproval ? `
              <div style="font-family: cursive; font-size: 1.3rem; color: #1e3a8a; font-weight: 700; transform: rotate(-5deg);">
                ${req.supervisorApproval.supervisorName.split(' ')[0]}
              </div>
            ` : '<span style="font-size: 0.75rem; color: #9ca3af;">(Menunggu Approval)</span>'}
          </div>
          <div class="sig-name">${req.supervisorApproval?.supervisorName || 'Hendra Wijaya, S.T.'}</div>
          <div class="sig-nip">Kepala Bagian Produksi</div>
        </div>

        <!-- HRD & Stempel -->
        <div class="signature-column">
          <div class="sig-role-title">Menyetujui (HRD & GA Manager)</div>
          <div class="sig-image-box">
            ${req.hrdApproval ? `
              <div style="font-family: cursive; font-size: 1.3rem; color: #b91c1c; font-weight: 700; transform: rotate(-4deg);">
                Dewi Lestari
              </div>
              <div class="sig-stamp-watermark">
                PT SIANTAR TOP<br>★ HRD ★<br>APPROVED
              </div>
            ` : '<span style="font-size: 0.75rem; color: #9ca3af;">(Verifikasi HRD)</span>'}
          </div>
          <div class="sig-name">${req.hrdApproval?.hrdName || 'Dewi Lestari, S.Psi.'}</div>
          <div class="sig-nip">Personnel & HR Dept.</div>
        </div>
      </div>

      <!-- Footer Dokumen & QR Code -->
      <div class="letter-footer-meta">
        <div>
          <div>Dicetak secara elektronik pada: ${formatDateTime(new Date())}</div>
          <div>Sistem E-Izin Terpadu PT Siantar Top Tbk © ${new Date().getFullYear()}</div>
        </div>
        <div class="qr-code-box" id="qrcode-container" title="Pindai untuk verifikasi keaslian surat">
          <!-- QR Code rendered via canvas/svg -->
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

export function setupLetterModalActions(modalElement, requestId) {
  const printBtn = modalElement.querySelector('#btn-print-official-letter');
  if (printBtn) {
    printBtn.onclick = () => {
      printDocument('official-permit-document', `Surat_Izin_PT_Siantar_Top_${requestId}`);
    };
  }
}

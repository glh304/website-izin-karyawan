/* ==========================================================================
   EXPORT & PRINT UTILITIES
   ========================================================================== */

/**
 * Export array of objects to CSV download
 */
export function exportToCSV(data, filename = 'rekap_perizinan_siantar_top.csv') {
  if (!data || !data.length) {
    alert('Tidak ada data untuk diekspor.');
    return;
  }

  const headers = Object.keys(data[0]);
  const csvRows = [];

  // Add header row
  csvRows.push(headers.map(header => `"${header}"`).join(','));

  // Add data rows
  for (const row of data) {
    const values = headers.map(header => {
      const val = row[header] === null || row[header] === undefined ? '' : row[header];
      const escaped = ('' + val).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  }

  const csvString = '\uFEFF' + csvRows.join('\r\n'); // Add BOM for Excel UTF-8 support
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Trigger official window print with specific title
 */
export function printDocument(elementId, title = 'Surat Izin PT Siantar Top Tbk') {
  const originalTitle = document.title;
  document.title = title;
  
  const element = document.getElementById(elementId);
  if (element) {
    element.classList.add('printable-area');
  }

  window.print();

  if (element) {
    element.classList.remove('printable-area');
  }
  document.title = originalTitle;
}

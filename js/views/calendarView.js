/* ==========================================================================
   TEAM LEAVE CALENDAR VIEW
   ========================================================================== */

import { state, LEAVE_TYPES } from '../state.js';
import { INDONESIAN_MONTHS, formatDateIndo } from '../utils/dateUtils.js';

let currentCalendarDate = new Date(2026, 7, 1); // August 2026

export function renderCalendarView(container) {
  const currentMonth = currentCalendarDate.getMonth();
  const currentYear = currentCalendarDate.getFullYear();

  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

  const requests = state.requests.filter(r => r.status === 'APPROVED_HRD' || r.status === 'APPROVED_SPV');

  // Helper to find leaves on a specific date
  function getLeavesForDate(year, month, day) {
    const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return requests.filter(r => {
      return formattedDate >= r.startDate && formattedDate <= r.endDate;
    });
  }

  container.innerHTML = `
    <!-- Header Banner -->
    <div class="action-banner" style="background: linear-gradient(135deg, #065f46 0%, #0f172a 100%);">
      <div class="banner-content">
        <div class="banner-tag" style="color: #34d399; background: rgba(52, 211, 153, 0.15);">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          Jadwal & Agenda Shift Pabrik
        </div>
        <h2 class="banner-title">Kalender Izin & Cuti Tim</h2>
        <p class="banner-desc">
          Pantau ketersediaan personel dan jadwal cuti anggota tim seluruh divisi PT Siantar Top Tbk untuk memastikan kesinambungan operasional mesin dan lini produksi.
        </p>
      </div>
      <div class="banner-actions">
        <div style="display: flex; gap: 0.5rem;">
          <button class="btn btn-secondary btn-sm" id="cal-btn-prev" style="background: rgba(255,255,255,0.15); color: #fff; border: 1px solid rgba(255,255,255,0.2);">
            ◀ Bulan Sebelumnya
          </button>
          <button class="btn btn-secondary btn-sm" id="cal-btn-today" style="background: rgba(255,255,255,0.15); color: #fff; border: 1px solid rgba(255,255,255,0.2);">
            Hari Ini
          </button>
          <button class="btn btn-secondary btn-sm" id="cal-btn-next" style="background: rgba(255,255,255,0.15); color: #fff; border: 1px solid rgba(255,255,255,0.2);">
            Bulan Berikutnya ▶
          </button>
        </div>
      </div>
    </div>

    <!-- Calendar Card -->
    <div class="calendar-wrapper">
      <div class="calendar-header">
        <div>
          <h3 class="calendar-month-title">${INDONESIAN_MONTHS[currentMonth]} ${currentYear}</h3>
          <span style="font-size: 0.78rem; color: var(--text-muted);">Menampilkan jadwal izin resmi dan terkonfirmasi</span>
        </div>
        <div style="display: flex; gap: 0.75rem; align-items: center;">
          <div style="display: flex; gap: 0.5rem; font-size: 0.75rem;">
            <span style="display: flex; align-items: center; gap: 4px;"><span style="width: 10px; height: 10px; border-radius: 2px; background: var(--brand-primary);"></span> Cuti Tahunan</span>
            <span style="display: flex; align-items: center; gap: 4px;"><span style="width: 10px; height: 10px; border-radius: 2px; background: var(--status-warning);"></span> Sakit</span>
            <span style="display: flex; align-items: center; gap: 4px;"><span style="width: 10px; height: 10px; border-radius: 2px; background: var(--status-info);"></span> Izin Khusus</span>
          </div>
        </div>
      </div>

      <div class="calendar-grid-header">
        <div>Min</div>
        <div>Sen</div>
        <div>Sel</div>
        <div>Rab</div>
        <div>Kam</div>
        <div>Jum</div>
        <div>Sab</div>
      </div>

      <div class="calendar-grid-body" id="calendar-cells-body">
        <!-- Cells generated dynamically -->
      </div>
    </div>
  `;

  const cellsBody = container.querySelector('#calendar-cells-body');

  // 1. Previous month trailing days
  for (let i = firstDayIndex; i > 0; i--) {
    const dayNum = daysInPrevMonth - i + 1;
    const cell = document.createElement('div');
    cell.className = 'calendar-day-cell other-month';
    cell.innerHTML = `<span class="day-number">${dayNum}</span>`;
    cellsBody.appendChild(cell);
  }

  // 2. Current month days
  const today = new Date();
  for (let day = 1; day <= daysInMonth; day++) {
    const cell = document.createElement('div');
    const isToday = (today.getDate() === day && today.getMonth() === currentMonth && today.getFullYear() === currentYear);
    cell.className = `calendar-day-cell ${isToday ? 'is-today' : ''}`;

    const leavesToday = getLeavesForDate(currentYear, currentMonth, day);

    let eventsHtml = '';
    leavesToday.forEach(leave => {
      const typeObj = LEAVE_TYPES.find(t => t.id === leave.leaveType) || {};
      const eventClass = typeObj.eventClass || 'event-cuti';
      eventsHtml += `
        <div class="event-pill ${eventClass}" data-id="${leave.id}" title="${leave.employeeName} (${leave.department}): ${leave.leaveTypeName}">
          <strong>${leave.employeeName.split(' ')[0]}</strong>: ${leave.leaveTypeName.split(' ')[0]}
        </div>
      `;
    });

    cell.innerHTML = `
      <span class="day-number">${day}</span>
      <div class="day-events">
        ${eventsHtml}
      </div>
    `;

    cellsBody.appendChild(cell);
  }

  // 3. Next month trailing days to complete grid
  const totalCellsSoFar = firstDayIndex + daysInMonth;
  const remainingCells = 35 - totalCellsSoFar > 0 ? 35 - totalCellsSoFar : (42 - totalCellsSoFar > 0 ? 42 - totalCellsSoFar : 0);
  for (let i = 1; i <= remainingCells; i++) {
    const cell = document.createElement('div');
    cell.className = 'calendar-day-cell other-month';
    cell.innerHTML = `<span class="day-number">${i}</span>`;
    cellsBody.appendChild(cell);
  }

  // Event Listeners for Month Switcher
  container.querySelector('#cal-btn-prev')?.addEventListener('click', () => {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
    renderCalendarView(container);
  });

  container.querySelector('#cal-btn-next')?.addEventListener('click', () => {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
    renderCalendarView(container);
  });

  container.querySelector('#cal-btn-today')?.addEventListener('click', () => {
    currentCalendarDate = new Date();
    renderCalendarView(container);
  });

  // Clicking an event pill shows details
  container.querySelectorAll('.event-pill').forEach(pill => {
    pill.addEventListener('click', (e) => {
      e.stopPropagation();
      const reqId = e.currentTarget.dataset.id;
      window.openTrackingModal(reqId);
    });
  });
}

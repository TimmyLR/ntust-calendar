/**
 * Export calendar events & course schedules as standard iCalendar (.ics) format
 */
export function exportToICS(events, courses, filename = 'NTUST_Calendar.ics') {
  let icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//NTUST Student Exclusive Calendar//TW',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:台科大個人行事曆',
    'X-WR-TIMEZONE:Asia/Taipei'
  ];

  // Helper date formatter: YYYYMMDDTHHMMSSZ
  const formatDate = (dateStr, timeStr = '09:00') => {
    const d = new Date(`${dateStr}T${timeStr}:00`);
    if (isNaN(d.getTime())) return new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  // Add Events
  events.forEach(evt => {
    const uid = evt.id || `evt-${Math.random().toString(36).substr(2, 9)}`;
    const dtStart = formatDate(evt.date, evt.startTime || '09:00');
    const dtEnd = formatDate(evt.date, evt.endTime || '10:00');

    icsContent.push('BEGIN:VEVENT');
    icsContent.push(`UID:${uid}@ntust.edu.tw`);
    icsContent.push(`SUMMARY:${evt.title}`);
    if (evt.description || evt.courseName) {
      icsContent.push(`DESCRIPTION:${evt.courseName ? '相關課程: ' + evt.courseName + '\\n' : ''}${evt.description || ''}`);
    }
    if (evt.location) {
      icsContent.push(`LOCATION:${evt.location}`);
    }
    icsContent.push(`DTSTART:${dtStart}`);
    icsContent.push(`DTEND:${dtEnd}`);
    icsContent.push('STATUS:CONFIRMED');
    icsContent.push('END:VEVENT');
  });

  icsContent.push('END:VCALENDAR');

  const blob = new Blob([icsContent.join('\r\n')], { type: 'text/calendar;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

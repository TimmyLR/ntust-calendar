import * as cheerio from 'cheerio';

/**
 * Parses NTUST Official Schedule HTML ("選課清單 - 國立臺灣科技大學選課系統.html")
 */
export function parseNTUSTHtml(htmlString) {
  const $ = cheerio.load(htmlString);
  const coursesMap = new Map(); // name -> course object
  const colors = [
    '#3B82F6', '#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', 
    '#EC4899', '#6366F1', '#14B8A6', '#F43F5E', '#84CC16',
    '#0284C7', '#A855F7', '#EAB308', '#D946EF', '#22C55E'
  ];
  let colorIdx = 0;

  // Step 1: Parse Course List Table (課碼, 課程名稱, 學分數, 上課教師)
  $('table').each((tIdx, tableEl) => {
    const textHeader = $(tableEl).text();
    if (textHeader.includes('課碼') && textHeader.includes('課程名稱')) {
      $(tableEl).find('tr').each((rIdx, trEl) => {
        const tds = $(trEl).find('td');
        if (tds.length >= 5) {
          const code = $(tds[0]).text().trim();
          const nameRaw = $(tds[1]).text().trim();
          const credit = parseInt($(tds[2]).text().trim(), 10) || 3;
          const type = $(tds[3]).text().trim();
          const prof = $(tds[4]).text().trim();

          if (code && nameRaw && !code.includes('課碼')) {
            const cleanName = nameRaw.replace(/\s+/g, ' ');
            coursesMap.set(cleanName, {
              id: `course-${code}`,
              code,
              name: cleanName,
              shortName: cleanName,
              professor: prof || '教授',
              location: '台科大教室',
              credit,
              type,
              color: colors[colorIdx % colors.length],
              schedule: []
            });
            colorIdx++;
          }
        }
      });
    }
  });

  // Step 2: Parse Timetable Table (功課表: 節次 1..10, A..D, 星期一..星期日)
  $('table').each((tIdx, tableEl) => {
    const textHeader = $(tableEl).text();
    if (textHeader.includes('節次') && textHeader.includes('星期一')) {
      $(tableEl).find('tr').each((rIdx, trEl) => {
        const tds = $(trEl).find('td');
        if (tds.length >= 9) {
          const periodName = $(tds[0]).text().trim(); // 1..10, A..D
          if (!periodName || periodName.includes('節次')) return;

          // Day columns: 2->Mon(1), 3->Tue(2), 4->Wed(3), 5->Thu(4), 6->Fri(5), 7->Sat(6), 8->Sun(7)
          for (let dayId = 1; dayId <= 7; dayId++) {
            const cellTd = tds[dayId + 1];
            if (!cellTd) continue;

            const cellText = $(cellTd).html() || '';
            const items = cellText.split('<br>').map(s => $(`<div>${s}</div>`).text().trim()).filter(Boolean);

            if (items.length > 0) {
              // Extract course name and location
              let currentCourseName = '';
              let currentLocation = '';

              items.forEach(itemStr => {
                const clean = itemStr.trim();
                if (!clean) return;

                // Check if string matches a classroom code like EE-103, TR-509, IB-511-2, RB-510, T2-510, etc.
                if (/^[A-Z0-9]{1,4}-[A-Z0-9-]{2,8}$/i.test(clean)) {
                  currentLocation = clean;
                } else if (clean.length > 1) {
                  currentCourseName = clean;
                }

                if (currentCourseName) {
                  // Find or create course
                  let existing = coursesMap.get(currentCourseName);
                  if (!existing) {
                    existing = {
                      id: `course-${Math.random().toString(36).substr(2, 6)}`,
                      code: `CS${Math.floor(Math.random()*800+100)}`,
                      name: currentCourseName,
                      shortName: currentCourseName,
                      professor: '教授',
                      location: currentLocation || '台科大教室',
                      credit: 3,
                      color: colors[colorIdx % colors.length],
                      schedule: []
                    };
                    colorsIdx++;
                    coursesMap.set(currentCourseName, existing);
                  }

                  if (currentLocation) {
                    existing.location = currentLocation;
                  }

                  // Add schedule slot if not already added
                  let schedSlot = existing.schedule.find(s => s.day === dayId);
                  if (!schedSlot) {
                    schedSlot = { day: dayId, periods: [] };
                    existing.schedule.push(schedSlot);
                  }
                  if (!schedSlot.periods.includes(periodName)) {
                    schedSlot.periods.push(periodName);
                  }
                }
              });
            }
          }
        }
      });
    }
  });

  return Array.from(coursesMap.values());
}

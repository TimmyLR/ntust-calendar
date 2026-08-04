import React, { useMemo } from 'react';
import { BookOpen, Plus, Upload } from 'lucide-react';
import { WEEKDAYS, WEEKDAYS_ALL, NTUST_PERIODS } from '../utils/ntustPeriods';

export default function TimetableGrid({ courses = [], onQuickAddForCourse, onOpenImportSchedule }) {
  const { activeDays, activePeriods } = useMemo(() => {
    const hasWeekend = courses.some(c => c.schedule?.some(s => (s.day === 6 || s.day === 7) && s.periods.length > 0));
    const days = hasWeekend ? WEEKDAYS_ALL : WEEKDAYS;
    let highest = 7;
    courses.forEach(course => {
      course.schedule?.forEach(sched => {
        sched.periods?.forEach(p => {
          const idx = NTUST_PERIODS.findIndex(item => item.period === p || item.name === p);
          if (idx > highest) highest = idx;
        });
      });
    });
    return { activeDays: days, activePeriods: NTUST_PERIODS.slice(0, highest + 1) };
  }, [courses]);

  const courseMap = useMemo(() => {
    const map = {};
    courses.forEach(c => {
      c.schedule?.forEach(s => {
        s.periods?.forEach(p => {
          const key = `${s.day}-${p}`;
          if (!map[key]) map[key] = [];
          map[key].push(c);
        });
      });
    });
    return map;
  }, [courses]);

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2.5 bg-slate-900/60 px-4 py-3 rounded-2xl border border-slate-800 glass-card">
        <BookOpen className="w-5 h-5 text-cyan-400" />
        <span className="text-sm font-black">當學期課表</span>
        <span className="ml-auto text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold font-mono">
          {courses.length} 門
        </span>
      </div>

      {/* Grid */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl glass-card overflow-hidden">
        {courses.length === 0 ? (
          <div className="p-16 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto">
              <BookOpen className="w-7 h-7 text-cyan-400" />
            </div>
            <h3 className="text-base font-extrabold">當前尚未匯入課表</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              點擊下方按鈕上傳選課 HTML 檔案，或使用手動新增課程。
            </p>
            <button
              onClick={onOpenImportSchedule}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-md transition-all inline-flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              <span>匯入選課清單 HTML 檔案</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-800">
                  <th className="p-3 w-14 text-center font-black text-sm text-cyan-400">節次</th>
                  <th className="p-3 w-[5.5rem] text-center font-bold text-slate-400 text-[11px]">時間</th>
                  {activeDays.map(day => (
                    <th key={day.id} className="p-3 text-center font-black text-sm">{day.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {activePeriods.map(period => (
                  <tr key={period.period} className="transition-colors">
                    <td className="p-2.5 text-center font-mono font-black text-sm text-cyan-400 bg-slate-950/30">
                      {period.name}
                    </td>
                    <td className="px-2 py-1.5 text-center text-[11px] text-slate-400 font-mono bg-slate-950/10">
                      <span>{period.startTime}</span>
                      <span className="text-slate-600 mx-0.5">–</span>
                      <span>{period.endTime}</span>
                    </td>

                    {activeDays.map(day => {
                      const matched = courseMap[`${day.id}-${period.period}`] || [];

                      return (
                        <td key={day.id} className="p-1 border-r border-slate-800/30 last:border-r-0 align-top group">
                          {matched.length > 0 ? (
                            matched.map(course => (
                              <div
                                key={course.id}
                                style={{
                                  backgroundColor: `${course.color}14`,
                                  borderColor: `${course.color}45`,
                                }}
                                className="p-2 rounded-lg border space-y-1 transition-all hover:brightness-110 relative group/card"
                              >
                                <div className="flex items-start justify-between gap-1">
                                  <span className="font-extrabold text-[11px] leading-snug">{course.name}</span>
                                  {/* Hidden until hover */}
                                  <button
                                    onClick={() => onQuickAddForCourse(course.id, period.period, day.id)}
                                    className="p-0.5 rounded bg-slate-900/70 hover:bg-cyan-500 hover:text-slate-950 text-cyan-400 opacity-0 group-hover/card:opacity-100 transition-all shrink-0"
                                    title="新增行程"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </button>
                                </div>
                                <div className="flex flex-wrap items-center gap-1 text-[9px] text-slate-300">
                                  <span className="px-1 py-0.5 rounded bg-slate-900/80 font-mono text-cyan-300 border border-slate-800/60">
                                    📍 {course.location || '教室'}
                                  </span>
                                  {course.professor && (
                                    <span className="text-slate-400">👤 {course.professor}</span>
                                  )}
                                </div>
                              </div>
                            ))
                          ) : (
                            /* Empty cell — hover to reveal add button */
                            <button
                              onClick={() => onQuickAddForCourse(null, period.period, day.id)}
                              className="w-full h-full min-h-[3rem] rounded-lg border border-transparent hover:border-slate-700 hover:bg-slate-900/40 md:opacity-0 md:group-hover:opacity-100 transition-all duration-150 flex items-center justify-center text-slate-500 hover:text-cyan-400 gap-1"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span className="text-[10px] font-bold">新增</span>
                            </button>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

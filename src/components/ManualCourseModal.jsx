import React, { useState } from 'react';
import { X, Plus, Trash2, BookOpen, AlertTriangle } from 'lucide-react';
import { WEEKDAYS, NTUST_PERIODS } from '../utils/ntustPeriods';

export default function ManualCourseModal({ isOpen, onClose, currentCourses = [], onUpdateCourses }) {
  const [mName, setMName] = useState('');
  const [mProf, setMProf] = useState('');
  const [mLoc, setMLoc] = useState('');
  const [mDay, setMDay] = useState(1);
  const [mPeriod, setMPeriod] = useState("1");
  const [errorAlert, setErrorAlert] = useState('');

  if (!isOpen) return null;

  const handleAddManualCourse = (e) => {
    e.preventDefault();
    setErrorAlert('');
    if (!mName.trim()) return;

    // Check conflict (衝堂檢查): Check if any existing course occupies the target day & period
    const periodStr = String(mPeriod);
    const dayNum = Number(mDay);

    const conflictingCourse = currentCourses.find(course => {
      if (!course.schedule) return false;
      return course.schedule.some(s => s.day === dayNum && s.periods.some(p => String(p) === periodStr));
    });

    if (conflictingCourse) {
      const dayName = WEEKDAYS.find(w => w.id === dayNum)?.name || `週${dayNum}`;
      const periodObj = NTUST_PERIODS.find(p => p.period === periodStr);
      const pName = periodObj ? periodObj.name : periodStr;
      setErrorAlert(`⚠️ 課表時間衝突 (衝堂)：[${dayName} 節次 ${pName}] 已有課程「${conflictingCourse.name}」！`);
      return;
    }

    const colors = ['#3B82F6', '#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EC4899', '#6366F1'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const newCourse = {
      id: `manual-${Date.now()}`,
      code: `CS${Math.floor(Math.random()*900+100)}`,
      name: mName.trim(),
      shortName: mName.trim(),
      professor: mProf.trim() || '教授',
      location: mLoc.trim() || '教室',
      credit: 3,
      color: randomColor,
      schedule: [
        { day: dayNum, periods: [periodStr] }
      ]
    };

    const updated = [...currentCourses, newCourse];
    onUpdateCourses(updated);

    // Reset inputs
    setMName('');
    setMProf('');
    setMLoc('');
    setErrorAlert('');
  };

  const handleDeleteCourse = (courseId) => {
    const updated = currentCourses.filter(c => c.id !== courseId);
    onUpdateCourses(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden glass-panel max-h-[90vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-cyan-950/60 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">手動編輯與新增課程 ({currentCourses.length})</h3>
          </div>
          <button onClick={onClose} aria-label="關閉" className="p-1 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">

          {errorAlert && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorAlert}</span>
            </div>
          )}

          {/* Add Course Form */}
          <form onSubmit={handleAddManualCourse} className="p-4 bg-slate-950/90 rounded-2xl border border-slate-800 space-y-3">
            <span className="text-xs font-bold text-cyan-400 block">新增一門課程卡片</span>
            
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                required
                placeholder="課程名稱 (例: 演算法)"
                value={mName}
                onChange={(e) => setMName(e.target.value)}
                className="px-3 py-2 rounded-xl glass-input text-xs"
              />
              <input
                type="text"
                placeholder="教授姓名 (例: 鄭教授)"
                value={mProf}
                onChange={(e) => setMProf(e.target.value)}
                className="px-3 py-2 rounded-xl glass-input text-xs"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="教室 (例: MA-205)"
                value={mLoc}
                onChange={(e) => setMLoc(e.target.value)}
                className="px-3 py-2 rounded-xl glass-input text-xs"
              />
              
              <select
                value={mDay}
                onChange={(e) => setMDay(Number(e.target.value))}
                className="px-2 py-2 rounded-xl glass-input text-xs font-bold"
              >
                {WEEKDAYS.map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>

              <select
                value={mPeriod}
                onChange={(e) => setMPeriod(e.target.value)}
                className="px-2 py-2 rounded-xl glass-input text-xs font-bold"
              >
                {NTUST_PERIODS.map(p => (
                  <option key={p.period} value={p.period}>節次 {p.name}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1 shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>加入當學期課表</span>
            </button>
          </form>

          {/* Existing Course List with Delete */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-300 block">已加入課程列表</span>
            {currentCourses.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">當前課表為空</p>
            ) : (
              currentCourses.map(c => (
                <div key={c.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs group">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2.5 h-6 rounded-full" style={{ backgroundColor: c.color || '#3B82F6' }} />
                    <div>
                      <div className="font-bold text-slate-100">{c.name}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {c.location} • {c.professor}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteCourse(c.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/40 transition-all"
                    title="刪除課程"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

        </div>

      </div>
    </div>
  );
}

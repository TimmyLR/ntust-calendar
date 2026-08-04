import React, { useEffect, useRef } from 'react';
import { Calendar, BookOpen, PlusCircle, Download, Sparkles, Edit3, Upload, LogIn, LogOut, UserCheck, Settings } from 'lucide-react';

export default function Navbar({ 
  viewMode, 
  setViewMode, 
  user,
  onOpenAuth,
  onLogout,
  onOpenAdmin,
  onOpenSettings,
  onOpenImportSchedule, 
  onOpenManualCourse,
  onOpenQuickAdd, 
  onOpenCustomAdd, 
  onExportICS,
  courseCount,
  eventCount
}) {
  const pressTimer = useRef(null);

  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        onOpenAdmin();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenAdmin]);

  // Long-press gesture handler
  const handlePressStart = () => {
    pressTimer.current = setTimeout(() => {
      onOpenAdmin();
    }, 3000);
  };

  const handlePressEnd = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
    }
  };

  return (
    <header className="sticky top-0 z-40 glass-panel border-b border-slate-800/80 px-4 lg:px-6 py-2.5 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Brand Logo & Title */}
        <div 
          onMouseDown={handlePressStart}
          onMouseUp={handlePressEnd}
          onMouseLeave={handlePressEnd}
          onTouchStart={handlePressStart}
          onTouchEnd={handlePressEnd}
          onContextMenu={(e) => e.preventDefault()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpenAdmin(); } }}
          className="flex items-center gap-2.5 select-none cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-cyan-500/30 flex items-center justify-center text-lg shadow-sm">
            🎓
          </div>
          <div>
            <h1 className="text-base font-extrabold text-white tracking-tight">
              NTUST Student Calendar
            </h1>
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setViewMode('timetable')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'timetable'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>當學期課表 ({courseCount})</span>
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'calendar'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>綜合日曆 ({eventCount})</span>
          </button>
        </div>

        {/* Action Buttons Group */}
        <div className="flex flex-wrap items-center gap-2">

          {/* Quick Add Event */}
          <button
            onClick={onOpenQuickAdd}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 hover:brightness-110 shadow-lg shadow-cyan-500/20 transition-all active:scale-95"
          >
            <Sparkles className="w-4 h-4 fill-slate-950" />
            <span>一鍵快選課程行程</span>
          </button>

          {/* Import Schedule HTML Button */}
          <button
            onClick={onOpenImportSchedule}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900 border border-slate-800 text-slate-200 hover:bg-slate-800 transition-all"
            title="匯入選課清單 HTML 檔案"
          >
            <Upload className="w-3.5 h-3.5 text-cyan-400" />
            <span>匯入選課清單</span>
          </button>

          {/* Manual Course Editor */}
          <button
            onClick={onOpenManualCourse}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-800 text-cyan-300 hover:bg-slate-800 transition-all"
            title="手動新增或編輯課表"
          >
            <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
            <span>編輯/手動課表</span>
          </button>

          {/* Personal Event Add */}
          <button
            onClick={onOpenCustomAdd}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 transition-all"
          >
            <PlusCircle className="w-3.5 h-3.5 text-purple-400" />
            <span>新增個人行程</span>
          </button>

          {/* Settings Modal Trigger */}
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900 border border-slate-800 text-slate-200 hover:bg-slate-800 transition-all"
            title="開啟系統風格與偏好設定"
          >
            <Settings className="w-3.5 h-3.5 text-cyan-400" />
            <span>設定</span>
          </button>

          {/* Export ICS */}
          <button
            onClick={onExportICS}
            className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-all"
            title="匯出至 Google / Apple Calendar (.ics)"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span>.ics</span>
          </button>

          {/* Auth Button / User Status */}
          {user ? (
            <div className="flex items-center gap-1.5 bg-blue-950/80 border border-blue-500/40 p-1 rounded-xl">
              <div className="flex items-center gap-1 px-2 text-xs font-bold text-blue-300">
                <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>{user.name}</span>
              </div>
              <button
                onClick={onLogout}
                className="px-2 py-1 rounded-lg bg-red-950/80 border border-red-500/40 text-red-300 text-xs font-bold hover:bg-red-900/60 flex items-center gap-1 transition-all"
                title="登出帳號"
              >
                <LogOut className="w-3 h-3" />
                <span>登出</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md transition-all"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>登入 / 註冊帳號</span>
            </button>
          )}

        </div>

      </div>
    </header>
  );
}

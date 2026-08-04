import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus, Trash2, X, MapPin, Calendar as CalendarIcon, Clock, Edit3 } from 'lucide-react';

export default function CalendarView({ courses, events, onOpenQuickAdd, onOpenCustomAdd, onDeleteEvent, onEditEvent }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedFilter, setSelectedFilter] = useState('ALL');
  const [activeDetailEvent, setActiveDetailEvent] = useState(null);
  const [addMenuDate, setAddMenuDate] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const todayMonth = () => {
    const now = new Date();
    setCurrentDate(new Date(now.getFullYear(), now.getMonth(), now.getDate()));
  };

  const monthNames = ["1 月", "2 月", "3 月", "4 月", "5 月", "6 月", "7 月", "8 月", "9 月", "10 月", "11 月", "12 月"];
  const currentYear = new Date().getFullYear();
  const yearsList = Array.from({ length: 8 }, (_, i) => currentYear - 2 + i);

  const handleYearChange = (e) => {
    const newY = parseInt(e.target.value, 10);
    setCurrentDate(new Date(newY, month, 1));
  };

  const handleMonthChange = (e) => {
    const newM = parseInt(e.target.value, 10);
    setCurrentDate(new Date(year, newM, 1));
  };

  const firstDayIndex = new Date(year, month, 1).getDay();
  const adjustedFirstDay = (firstDayIndex + 6) % 7; // Monday = 0
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarCells = [];
  for (let i = 0; i < adjustedFirstDay; i++) {
    calendarCells.push(null);
  }
  for (let d = 1; d <= totalDaysInMonth; d++) {
    calendarCells.push(d);
  }

  const formatDateKey = (day) => {
    if (!day) return null;
    const mStr = String(month + 1).padStart(2, '0');
    const dStr = String(day).padStart(2, '0');
    return `${year}-${mStr}-${dStr}`;
  };

  const todayKey = new Date().toISOString().split('T')[0];

  const filteredEvents = useMemo(() => events.filter(evt => {
    if (selectedFilter === 'ALL') return true;
    if (selectedFilter === 'COURSES') return !evt.isCustom;
    if (selectedFilter === 'CUSTOM') return evt.isCustom;
    return true;
  }), [events, selectedFilter]);

  return (
    <div className="space-y-3 animate-fadeIn">
      
      {/* Calendar Header with Center Today Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800 glass-card">
        
        {/* Navigation Arrows & Year/Month Dropdowns */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button onClick={prevMonth} aria-label="上個月" className="p-1.5 rounded-lg text-slate-400 hover:text-white" title="上個月">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={nextMonth} aria-label="下個月" className="p-1.5 rounded-lg text-slate-400 hover:text-white" title="下個月">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <select
              value={year}
              onChange={handleYearChange}
              className="px-2 py-1 bg-slate-950 border border-slate-800 text-white rounded-lg text-xs font-bold font-mono focus:border-cyan-500 focus:outline-none"
            >
              {yearsList.map(y => (
                <option key={y} value={y}>{y} 年</option>
              ))}
            </select>

            <select
              value={month}
              onChange={handleMonthChange}
              className="px-2 py-1 bg-slate-950 border border-slate-800 text-white rounded-lg text-xs font-bold focus:border-cyan-500 focus:outline-none"
            >
              {monthNames.map((m, idx) => (
                <option key={idx} value={idx}>{m}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Center Today Button */}
        <button
          onClick={todayMonth}
          className="px-4 py-1.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-extrabold text-xs rounded-xl shadow-md hover:brightness-110 transition-all self-center"
        >
          📅 返回今天
        </button>

        {/* Filter Buttons */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setSelectedFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg ${selectedFilter === 'ALL' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400'}`}
            >
              全部 ({events.length})
            </button>
            <button
              onClick={() => setSelectedFilter('COURSES')}
              className={`px-2.5 py-1 rounded-lg ${selectedFilter === 'COURSES' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400'}`}
            >
              課程行程
            </button>
            <button
              onClick={() => setSelectedFilter('CUSTOM')}
              className={`px-2.5 py-1 rounded-lg ${selectedFilter === 'CUSTOM' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400'}`}
            >
              個人行程
            </button>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950/80 glass-panel p-2 shadow-xl">
        <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-slate-400 py-1.5 border-b border-slate-800/60">
          <span>一</span>
          <span>二</span>
          <span>三</span>
          <span>四</span>
          <span>五</span>
          <span className="text-blue-400">六</span>
          <span className="text-rose-400">日</span>
        </div>

        <div className="grid grid-cols-7 gap-1 mt-1">
          {calendarCells.map((day, idx) => {
            if (day === null) {
              return <div key={`empty-${idx}`} className="h-24 rounded-xl bg-slate-900/10 border border-slate-900/30"></div>;
            }

            const dateKey = formatDateKey(day);
            const isToday = dateKey === todayKey;
            const dayEvents = filteredEvents.filter(e => e.date === dateKey);

            return (
              <div
                key={`day-${day}`}
                className={`min-h-[95px] p-1.5 rounded-xl border transition-all flex flex-col justify-between overflow-hidden relative ${
                  isToday
                    ? 'bg-slate-900/90 border-cyan-500 shadow-md'
                    : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`w-5 h-5 rounded text-[11px] font-mono font-bold flex items-center justify-center ${
                      isToday ? 'bg-cyan-500 text-slate-950' : 'text-slate-300'
                    }`}
                  >
                    {day}
                  </span>

                  <div className="relative">
                    <button
                      onClick={() => setAddMenuDate(addMenuDate === dateKey ? null : dateKey)}
                      className="p-0.5 text-slate-500 hover:text-cyan-400 text-[10px]"
                      title="在當日新增行程"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    {addMenuDate === dateKey && (
                      <>
                        <div 
                          className="fixed inset-0 z-40" 
                          onClick={(e) => { e.stopPropagation(); setAddMenuDate(null); }}
                        />
                        <div className="absolute right-0 top-6 z-50 w-[100px] bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden text-xs">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenQuickAdd(null, dateKey);
                              setAddMenuDate(null);
                            }}
                            className="w-full text-left px-2.5 py-2 text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
                          >
                            📚 課程行程
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenCustomAdd();
                              setAddMenuDate(null);
                            }}
                            className="w-full text-left px-2.5 py-2 text-slate-200 hover:bg-slate-700 hover:text-white transition-colors border-t border-slate-700/50"
                          >
                            📌 個人行程
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Day Events List */}
                <div className="space-y-1 my-1 overflow-y-auto max-h-[65px] custom-scrollbar">
                  {dayEvents.map(evt => (
                    <div
                      key={evt.id}
                      onClick={() => setActiveDetailEvent(evt)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => { if (e.key === 'Enter') { setActiveDetailEvent(evt); } }}
                      className="p-1 rounded border text-[10px] flex items-center justify-between gap-1 cursor-pointer hover:brightness-125 transition-all"
                      style={{
                        backgroundColor: `${evt.color || '#3B82F6'}25`,
                        borderColor: `${evt.color || '#3B82F6'}60`,
                        color: '#f8fafc'
                      }}
                    >
                      <div className="font-medium flex items-center gap-1">
                        <span>{evt.tagIcon || '📌'}</span>
                        <span className="break-words line-clamp-2">{evt.title}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-[9px] text-slate-500 font-mono text-right">
                  {dayEvents.length > 0 && `${dayEvents.length} 項`}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Event Detail & Edit Modal */}
      {activeDetailEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden glass-panel p-5 space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="text-lg">{activeDetailEvent.tagIcon || '📌'}</span>
                <h3 className="text-sm font-bold text-white">{activeDetailEvent.title}</h3>
              </div>
              <button onClick={() => setActiveDetailEvent(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-2 text-cyan-400 font-mono">
                <CalendarIcon className="w-3.5 h-3.5" />
                <span>{activeDetailEvent.date}</span>
              </div>

              {(activeDetailEvent.startTime || activeDetailEvent.period) && (
                <div className="flex items-center gap-2 text-slate-300 font-mono">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    {activeDetailEvent.period ? `節次 ${activeDetailEvent.period} (` : ''}
                    {activeDetailEvent.startTime || '08:10'} - {activeDetailEvent.endTime || '09:00'}
                    {activeDetailEvent.period ? ')' : ''}
                  </span>
                </div>
              )}

              {activeDetailEvent.location && (
                <div className="flex items-center gap-2 text-slate-300">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{activeDetailEvent.location}</span>
                </div>
              )}

              {activeDetailEvent.description && (
                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-slate-400 text-xs mt-2">
                  {activeDetailEvent.description}
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
              <button
                onClick={() => {
                  onDeleteEvent(activeDetailEvent.id);
                  setActiveDetailEvent(null);
                }}
                className="px-3 py-1.5 rounded-lg bg-red-950/60 border border-red-500/40 text-red-300 text-xs font-semibold flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>刪除行程</span>
              </button>

              <button
                onClick={() => {
                  const targetEvt = activeDetailEvent;
                  setActiveDetailEvent(null);
                  onEditEvent(targetEvt);
                }}
                className="px-4 py-1.5 rounded-lg bg-cyan-500 text-slate-950 font-bold text-xs flex items-center gap-1 hover:bg-cyan-400 transition-colors shadow-md"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>編輯行程</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

import React, { useState, useMemo } from 'react';
import { Calendar, Clock, MapPin, Trash2, CheckCircle2, AlertCircle, Search, Filter, Edit3 } from 'lucide-react';

export default function EventList({ events, onDeleteEvent, onEditEvent }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');

  const sortedEvents = useMemo(() => [...events].sort((a, b) => new Date(a.date) - new Date(b.date)), [events]);

  const filteredEvents = useMemo(() => sortedEvents.filter(e => {
    // Category Filter
    if (filterCategory === 'COURSES' && e.isCustom) return false;
    if (filterCategory === 'CUSTOM' && !e.isCustom) return false;
    if (filterCategory !== 'ALL' && filterCategory !== 'COURSES' && filterCategory !== 'CUSTOM') {
      if (e.tag !== filterCategory && e.category !== filterCategory) return false;
    }

    // Search filter
    return (e.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.courseName && e.courseName.toLowerCase().includes(searchTerm.toLowerCase()));
  }), [sortedEvents, filterCategory, searchTerm]);

  const uniqueTags = [...new Set(events.map(e => e.tag || e.category).filter(Boolean))];

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 glass-card space-y-3.5">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white">近期行程與功課清單</h3>
            <p className="text-[10px] text-slate-400">共 {events.length} 項儲存行程</p>
          </div>
        </div>

        {/* Item 3: Filter Category Dropdown */}
        <div className="relative flex items-center">
          <Filter className="w-3 h-3 text-cyan-400 absolute left-2 pointer-events-none" />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            aria-label="行程類別篩選"
            className="pl-6 pr-2 py-1 bg-slate-950 border border-slate-800 text-cyan-300 rounded-xl text-xs font-bold focus:outline-none cursor-pointer"
          >
            <option value="ALL">全部篩選</option>
            <option value="COURSES">課程行程</option>
            <option value="CUSTOM">個人行程</option>
            {uniqueTags.map(tag => <option key={tag} value={tag}>{tag}</option>)}
          </select>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
        <input
          type="text"
          placeholder="搜尋課程或行程名稱..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          aria-label="搜尋行程"
          className="w-full pl-8 pr-3 py-1.5 rounded-xl glass-input text-xs"
        />
      </div>

      {/* Events List */}
      <div className="space-y-2 max-h-[450px] overflow-y-auto custom-scrollbar pr-1">
        {filteredEvents.length === 0 ? (
          <div className="p-6 text-center text-slate-500 text-xs space-y-1.5">
            <AlertCircle className="w-6 h-6 mx-auto text-slate-600" />
            <p>尚無符合篩選的行程記錄</p>
          </div>
        ) : (
          filteredEvents.map(evt => (
            <div
              key={evt.id}
              className="p-2.5 rounded-xl border border-slate-800 bg-slate-950/60 hover:border-slate-700 transition-all space-y-1.5 group"
            >
              <div className="flex items-center justify-between gap-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs">{evt.tagIcon || '📌'}</span>
                  <span className="text-xs font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                    {evt.title}
                  </span>
                </div>

                {/* Item 4: Action Buttons (Edit + Delete) */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onEditEvent(evt)}
                    className="p-1 rounded text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-all"
                    title="編輯行程"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteEvent(evt.id)}
                    className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-all"
                    title="刪除"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-400">
                <span className="flex items-center gap-1 font-mono text-cyan-400">
                  <Calendar className="w-3 h-3 text-cyan-500" />
                  <span>{evt.date}</span>
                </span>
                {(evt.startTime || evt.period) && (
                  <span className="flex items-center gap-1 font-mono text-slate-400">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>{evt.period ? `節次 ${evt.period} (` : ''}{evt.startTime || '08:10'}-{evt.endTime || '09:00'}{evt.period ? ')' : ''}</span>
                  </span>
                )}
                {evt.location && (
                  <span className="flex items-center gap-1 text-slate-400">
                    <MapPin className="w-3 h-3 text-slate-500" />
                    <span>{evt.location}</span>
                  </span>
                )}
              </div>

              {evt.description && (
                <p className="text-[10px] text-slate-400 bg-slate-900 p-1.5 rounded-lg border border-slate-800/60">
                  {evt.description}
                </p>
              )}
            </div>
          ))
        )}
      </div>

    </div>
  );
}

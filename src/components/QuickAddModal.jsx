import React, { useState, useEffect, useMemo } from 'react';
import { X, Sparkles, Settings } from 'lucide-react';
import { NTUST_PERIODS, getPeriodTimes } from '../utils/ntustPeriods';
import confetti from 'canvas-confetti';

export default function QuickAddModal({ 
  isOpen, 
  onClose, 
  courses, 
  tags,
  onUpdateTags,
  onAddEvent,
  initialCourseId = null,
  initialDate = null,
  initialPeriod = null,
  initialDay = null,
  editingEvent = null
}) {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedTag, setSelectedTag] = useState(null);
  const [eventDate, setEventDate] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState("1");
  const [startTime, setStartTime] = useState('08:10');
  const [endTime, setEndTime] = useState('09:00');
  const [customMemo, setCustomMemo] = useState('');

  // Tag Manager State
  const [isEditingTags, setIsEditingTags] = useState(false);
  const [newTagLabel, setNewTagLabel] = useState('');
  const [newTagIcon, setNewTagIcon] = useState('📌');

  const getQuickDates = () => {
    const dates = [];
    const today = new Date();

    const formatDateStr = (d) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };

    dates.push({ label: '今天', dateStr: formatDateStr(today) });
    const tmr = new Date(today);
    tmr.setDate(today.getDate() + 1);
    dates.push({ label: '明天', dateStr: formatDateStr(tmr) });

    for (let i = 2; i <= 6; i++) {
      const nextD = new Date(today);
      nextD.setDate(today.getDate() + i);
      const dayNames = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];
      dates.push({
        label: `${dayNames[nextD.getDay()]} (${nextD.getMonth()+1}/${nextD.getDate()})`,
        dateStr: formatDateStr(nextD)
      });
    }

    return dates;
  };

  const quickDatesList = useMemo(() => getQuickDates(), []);

  useEffect(() => {
    if (editingEvent) {
      const c = courses.find(item => item.id === editingEvent.courseId) || courses[0];
      setSelectedCourse(c);
      const t = tags.find(item => item.label === editingEvent.tag) || tags[0];
      setSelectedTag(t);
      setEventDate(editingEvent.date || new Date().toISOString().split('T')[0]);
      const periodVal = editingEvent.period || "1";
      setSelectedPeriod(periodVal);
      const times = getPeriodTimes(periodVal);
      setStartTime(editingEvent.startTime || times.start);
      setEndTime(editingEvent.endTime || times.end);
      setCustomMemo(editingEvent.description || '');
      return;
    }

    if (courses && courses.length > 0) {
      const defaultC = initialCourseId 
        ? courses.find(c => c.id === initialCourseId) || courses[0] 
        : courses[0];
      setSelectedCourse(defaultC);
    }
    if (tags && tags.length > 0 && !selectedTag) {
      setSelectedTag(tags[0]);
    }

    // Item 4: Calculate target date from initialDay (1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat, 7=Sun)
    if (initialDay) {
      const today = new Date();
      const currentDayOfWeek = today.getDay() === 0 ? 7 : today.getDay(); // 1..7
      let diff = initialDay - currentDayOfWeek;
      if (diff < 0) diff += 7; // Next week's weekday if passed
      const targetD = new Date(today);
      targetD.setDate(today.getDate() + diff);
      
      const y = targetD.getFullYear();
      const m = String(targetD.getMonth() + 1).padStart(2, '0');
      const d = String(targetD.getDate()).padStart(2, '0');
      setEventDate(`${y}-${m}-${d}`);
    } else {
      const todayStr = initialDate || new Date().toISOString().split('T')[0];
      setEventDate(todayStr);
    }

    if (initialPeriod) {
      setSelectedPeriod(String(initialPeriod));
      const times = getPeriodTimes(initialPeriod);
      setStartTime(times.start);
      setEndTime(times.end);
    }
  }, [isOpen, courses, tags, initialCourseId, initialDate, initialPeriod, initialDay, editingEvent]);

  const handlePeriodChange = (pVal) => {
    setSelectedPeriod(pVal);
    const times = getPeriodTimes(pVal);
    setStartTime(times.start);
    setEndTime(times.end);
  };

  if (!isOpen) return null;

  const generatedTitle = selectedCourse && selectedTag
    ? `[${selectedCourse.shortName || selectedCourse.name}] ${selectedTag.label}`
    : '請點選課程與標籤';

  const handleConfirm = () => {
    if (!selectedCourse || !selectedTag) return;

    const newEvent = {
      id: editingEvent ? editingEvent.id : `evt-${Date.now()}`,
      title: generatedTitle,
      courseId: selectedCourse.id,
      courseName: selectedCourse.name,
      tag: selectedTag.label,
      tagIcon: selectedTag.icon || '📌',
      date: eventDate,
      period: selectedPeriod,
      startTime,
      endTime,
      location: selectedCourse.location,
      color: selectedCourse.color || '#3B82F6',
      description: customMemo,
      createdAt: new Date().toISOString()
    };

    onAddEvent(newEvent);

    try {
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } });
    } catch (e) {}

    onClose();
  };

  const handleAddNewTag = (e) => {
    e.preventDefault();
    if (!newTagLabel.trim()) return;

    const newTag = {
      id: `tag-${Date.now()}`,
      label: newTagLabel.trim(),
      icon: newTagIcon || '📌',
      color: 'from-blue-500 to-cyan-600'
    };

    const updated = [...tags, newTag];
    onUpdateTags(updated);
    setSelectedTag(newTag);
    setNewTagLabel('');
  };

  const handleDeleteTag = (tagId) => {
    const updated = tags.filter(t => t.id !== tagId);
    onUpdateTags(updated);
    if (selectedTag?.id === tagId && updated.length > 0) {
      setSelectedTag(updated[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden glass-panel max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-white">
              {editingEvent ? '編輯課程行程' : '一鍵快選課程行程'}
            </h2>
          </div>
          <button onClick={onClose} aria-label="關閉" className="p-1 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 space-y-5 overflow-y-auto custom-scrollbar flex-1">

          {/* STEP 1: Course Chips */}
          <div>
            <span className="text-xs font-bold text-slate-300 block mb-2">1. 點選課程</span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {courses.map((c) => {
                const isSel = selectedCourse?.id === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedCourse(c)}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                      isSel
                        ? 'bg-slate-800 border-cyan-500 text-white font-bold shadow'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="truncate font-semibold">{c.shortName || c.name}</div>
                    <div className="text-[10px] text-slate-400 truncate mt-0.5">{c.location}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 2: Tag Chips */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-300">2. 點選事項標籤</span>
              <button
                type="button"
                onClick={() => setIsEditingTags(!isEditingTags)}
                className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1"
              >
                <Settings className="w-3 h-3" />
                <span>{isEditingTags ? '完成編輯' : '編輯/新增標籤'}</span>
              </button>
            </div>

            {isEditingTags && (
              <form onSubmit={handleAddNewTag} className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 mb-2.5 flex gap-2">
                <input
                  type="text"
                  placeholder="圖示"
                  value={newTagIcon}
                  onChange={(e) => setNewTagIcon(e.target.value)}
                  className="w-16 px-2 py-1 rounded glass-input text-xs text-center"
                />
                <input
                  type="text"
                  required
                  placeholder="新標籤 (例: 期中考)"
                  value={newTagLabel}
                  onChange={(e) => setNewTagLabel(e.target.value)}
                  className="flex-1 px-2.5 py-1 rounded glass-input text-xs"
                />
                <button type="submit" className="px-3 py-1 bg-cyan-500 text-slate-950 font-bold rounded text-xs">
                  新增
                </button>
              </form>
            )}

            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => {
                const isSel = selectedTag?.id === tag.id;
                return (
                  <div key={tag.id} className="relative group">
                    <button
                      type="button"
                      onClick={() => setSelectedTag(tag)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all flex items-center gap-1.5 ${
                        isSel
                          ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md font-bold'
                          : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span>{tag.icon}</span>
                      <span>{tag.label}</span>
                    </button>

                    {isEditingTags && (
                      <button
                        type="button"
                        onClick={() => handleDeleteTag(tag.id)}
                        className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white rounded-full flex items-center justify-center text-[10px]"
                      >
                        ×
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* STEP 3: Clickable Date & NTUST Period Selectors */}
          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
            
            {/* Quick Dates */}
            <div>
              <span className="text-[11px] font-bold text-slate-400 block mb-1.5">3. 點選日期</span>
              <div className="flex flex-wrap gap-1.5">
                {quickDatesList.map(item => (
                  <button
                    key={item.dateStr}
                    type="button"
                    onClick={() => setEventDate(item.dateStr)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                      eventDate === item.dateStr
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <div className="mt-1.5">
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="px-2 py-1 rounded-lg glass-input text-xs font-mono text-slate-300"
                />
              </div>
            </div>

            {/* NTUST Period Selectors */}
            <div>
              <span className="text-[11px] font-bold text-slate-400 block mb-1.5">4. 直接點選節次 (自動帶入時間)</span>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                {NTUST_PERIODS.map(p => {
                  const isSel = selectedPeriod === p.period;
                  return (
                    <button
                      key={p.period}
                      type="button"
                      onClick={() => handlePeriodChange(p.period)}
                      className={`p-1.5 rounded-lg border text-center text-xs transition-all ${
                        isSel
                          ? 'bg-blue-600 text-white border-blue-400 font-bold'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div className="font-bold">{p.name}</div>
                      <div className="text-[9px] text-slate-400 mt-0.5">{p.startTime}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Title Preview */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-400">自動預覽：</span>
              <span className="font-extrabold text-cyan-300 text-sm">{generatedTitle}</span>
            </div>

          </div>

          {/* 備註 */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 mb-1">備註說明</label>
            <textarea
              rows={2}
              placeholder="可填寫備註或補充說明..."
              value={customMemo}
              onChange={(e) => setCustomMemo(e.target.value)}
              className="w-full p-2.5 rounded-xl glass-input text-xs"
            />
          </div>

        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex justify-end gap-2 shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-xs text-slate-400">取消</button>
          <button
            onClick={handleConfirm}
            className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs shadow-md"
          >
            {editingEvent ? '儲存修改' : '一鍵儲存'}
          </button>
        </div>

      </div>
    </div>
  );
}

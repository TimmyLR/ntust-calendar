import React, { useState, useEffect, useMemo } from 'react';
import { X, Settings } from 'lucide-react';
import { DEFAULT_CUSTOM_CATEGORIES } from '../utils/ntustPeriods';

export default function AddCustomModal({ 
  isOpen, 
  onClose, 
  categories = DEFAULT_CUSTOM_CATEGORIES, 
  onUpdateCategories, 
  onAddEvent, 
  initialDate = null,
  editingEvent = null
}) {
  // Normalize categories list
  const catList = useMemo(() => (categories && categories.length > 0 ? categories : DEFAULT_CUSTOM_CATEGORIES).map((c, i) => {
    if (typeof c === 'string') {
      return { id: `cat-str-${i}`, label: c, icon: '📌', color: '#8B5CF6' };
    }
    return { id: c.id || `cat-obj-${i}`, label: c.label || c.name || '個人行程', icon: c.icon || '📌', color: c.color || '#8B5CF6' };
  }), [categories]);

  const [title, setTitle] = useState('');
  const [selectedCat, setSelectedCat] = useState(catList[0]);
  const [date, setDate] = useState(initialDate || new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('14:00');
  const [endTime, setEndTime] = useState('16:00');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');

  // Category Editor State
  const [isEditingCats, setIsEditingCats] = useState(false);
  const [newCatLabel, setNewCatLabel] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('📌');

  useEffect(() => {
    if (!isOpen) return;

    if (editingEvent) {
      const rawTitle = editingEvent.title || '';
      const cleanTitle = rawTitle.replace(/^\[.*?\]\s*/, '');
      setTitle(cleanTitle);

      const matchedCat = catList.find(c => c.label === editingEvent.category || c.label === editingEvent.tag) || catList[0];
      setSelectedCat(matchedCat);
      setDate(editingEvent.date || new Date().toISOString().split('T')[0]);
      setStartTime(editingEvent.startTime || '14:00');
      setEndTime(editingEvent.endTime || '16:00');
      setLocation(editingEvent.location || '');
      setDescription(editingEvent.description || '');
      return;
    }

    if (catList.length > 0) setSelectedCat(catList[0]);
    if (initialDate) setDate(initialDate);
    setTitle('');
    setLocation('');
    setDescription('');
  }, [isOpen, initialDate, editingEvent]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const catObj = selectedCat || catList[0] || { label: '個人行程', color: '#8B5CF6', icon: '📌' };

    const newEvt = {
      id: editingEvent ? editingEvent.id : `custom-${Date.now()}`,
      title: `[${catObj.label}] ${title.trim()}`,
      category: catObj.label,
      tag: catObj.label,
      tagIcon: catObj.icon || '📌',
      date,
      startTime,
      endTime,
      location,
      description,
      color: catObj.color || '#8B5CF6',
      isCustom: true,
      createdAt: new Date().toISOString()
    };

    onAddEvent(newEvt);
    onClose();
  };

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCatLabel.trim()) return;

    const colors = ['#8B5CF6', '#F59E0B', '#EC4899', '#10B981', '#06B6D4', '#3B82F6', '#EF4444'];
    const newCat = {
      id: `cat-${Date.now()}`,
      label: newCatLabel.trim(),
      icon: newCatIcon || '📌',
      color: colors[Math.floor(Math.random() * colors.length)]
    };

    const updated = [...catList, newCat];
    onUpdateCategories(updated);
    setSelectedCat(newCat);
    setNewCatLabel('');
  };

  const handleDeleteCategory = (catId) => {
    const updated = catList.filter(c => c.id !== catId);
    onUpdateCategories(updated);
    if (selectedCat?.id === catId && updated.length > 0) {
      setSelectedCat(updated[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden glass-panel">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-base font-black text-white">
            {editingEvent ? '編輯個人行程' : '新增一般個人行程'}
          </h3>
          <button onClick={onClose} aria-label="關閉" className="p-1 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Category Selector + Editor */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-extrabold text-slate-200">行程類別 (點選更換類別)</label>
              <button
                type="button"
                onClick={() => setIsEditingCats(!isEditingCats)}
                className="text-xs text-cyan-400 font-extrabold hover:underline flex items-center gap-1"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>{isEditingCats ? '完成編輯' : '編輯/新增類別'}</span>
              </button>
            </div>

            {isEditingCats && (
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 mb-3 flex gap-2">
                <input
                  type="text"
                  placeholder="圖示"
                  value={newCatIcon}
                  onChange={(e) => setNewCatIcon(e.target.value)}
                  className="w-16 px-2 py-1.5 rounded glass-input text-xs text-center font-bold"
                />
                <input
                  type="text"
                  placeholder="新類別名稱 (例: 家教兼職)"
                  value={newCatLabel}
                  onChange={(e) => setNewCatLabel(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded glass-input text-xs font-semibold"
                />
                <button
                  type="button"
                  onClick={handleAddCategory}
                  className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-extrabold rounded-lg text-xs shadow-md"
                >
                  新增
                </button>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {catList.map((cat) => {
                const isSel = selectedCat?.label === cat.label;
                return (
                  <div key={cat.id || cat.label} className="relative group">
                    <button
                      type="button"
                      onClick={() => setSelectedCat(cat)}
                      className={`px-4 py-2 rounded-xl text-xs font-extrabold border transition-all flex items-center gap-1.5 ${
                        isSel
                          ? 'bg-purple-600 text-white border-purple-400 shadow-md scale-105'
                          : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span className="text-sm">{cat.icon}</span>
                      <span>{cat.label}</span>
                    </button>

                    {isEditingCats && (
                      <button
                        type="button"
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold"
                      >
                        ×
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-extrabold text-slate-200 mb-1">行程名稱</label>
            <input
              type="text"
              required
              placeholder="例如: 家教打工、熱舞社練舞..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl glass-input text-sm font-semibold"
            />
          </div>

          {/* Date & Times */}
          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className="block text-xs font-extrabold text-slate-300 mb-1">日期</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-2.5 py-2 rounded-xl glass-input text-xs font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-extrabold text-slate-300 mb-1">開始時間</label>
              <input
                type="time"
                lang="en-GB"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-2.5 py-2 rounded-xl glass-input text-xs font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-extrabold text-slate-300 mb-1">結束時間</label>
              <input
                type="time"
                lang="en-GB"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-2.5 py-2 rounded-xl glass-input text-xs font-mono font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-300 mb-1">地點 (選填)</label>
            <input
              type="text"
              placeholder="例如: 體育館、圖書館 2F..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl glass-input text-xs font-semibold"
            />
          </div>

          {/* 描述 */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">描述說明</label>
            <textarea
              rows={2}
              placeholder="可填寫活動備註或詳細描述..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2.5 rounded-xl glass-input text-xs"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-800">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-extrabold text-slate-400 hover:text-white">取消</button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs shadow-md"
            >
              {editingEvent ? '儲存修改' : '儲存個人行程'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

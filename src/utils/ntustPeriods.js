export const WEEKDAYS = [
  { id: 1, name: '星期一', shortName: '一' },
  { id: 2, name: '星期二', shortName: '二' },
  { id: 3, name: '星期三', shortName: '三' },
  { id: 4, name: '星期四', shortName: '四' },
  { id: 5, name: '星期五', shortName: '五' },
];

export const WEEKDAYS_ALL = [
  { id: 1, name: '星期一', shortName: '一' },
  { id: 2, name: '星期二', shortName: '二' },
  { id: 3, name: '星期三', shortName: '三' },
  { id: 4, name: '星期四', shortName: '四' },
  { id: 5, name: '星期五', shortName: '五' },
  { id: 6, name: '星期六', shortName: '六' },
  { id: 7, name: '星期日', shortName: '日' },
];

export const NTUST_PERIODS = [
  { period: "1", name: "1", startTime: "08:10", endTime: "09:00" },
  { period: "2", name: "2", startTime: "09:10", endTime: "10:00" },
  { period: "3", name: "3", startTime: "10:20", endTime: "11:10" },
  { period: "4", name: "4", startTime: "11:20", endTime: "12:10" },
  { period: "5", name: "5", startTime: "12:20", endTime: "13:10" },
  { period: "6", name: "6", startTime: "13:20", endTime: "14:10" },
  { period: "7", name: "7", startTime: "14:20", endTime: "15:10" },
  { period: "8", name: "8", startTime: "15:30", endTime: "16:20" },
  { period: "9", name: "9", startTime: "16:30", endTime: "17:20" },
  { period: "10", name: "10", startTime: "17:30", endTime: "18:20" },
  { period: "11", name: "A", startTime: "18:25", endTime: "19:15" },
  { period: "12", name: "B", startTime: "19:20", endTime: "20:10" },
  { period: "13", name: "C", startTime: "20:15", endTime: "21:05" },
  { period: "14", name: "D", startTime: "21:10", endTime: "22:00" },
];

export function getPeriodTimes(periodCode) {
  const p = NTUST_PERIODS.find(item => item.period === String(periodCode) || item.name === String(periodCode));
  if (p) return { start: p.startTime, end: p.endTime, startTime: p.startTime, endTime: p.endTime };
  return { start: '08:10', end: '09:00', startTime: '08:10', endTime: '09:00' };
}

export const DEFAULT_QUICK_TAGS = [
  { id: 'tag-1', label: '期中報告', icon: '📝', color: 'from-blue-500 to-cyan-600' },
  { id: 'tag-2', label: '隨堂小考', icon: '✏️', color: 'from-emerald-500 to-teal-600' },
  { id: 'tag-3', label: '期末專題', icon: '💻', color: 'from-purple-500 to-indigo-600' },
  { id: 'tag-4', label: '作業繳交', icon: '📤', color: 'from-amber-500 to-orange-600' },
  { id: 'tag-5', label: '課前預習', icon: '📖', color: 'from-pink-500 to-rose-600' }
];

export const DEFAULT_CUSTOM_CATEGORIES = [
  { id: 'cat-1', label: '社團活動', icon: '⚽', color: '#8B5CF6' },
  { id: 'cat-2', label: '個人約會', icon: '☕', color: '#EC4899' },
  { id: 'cat-3', label: '打工兼職', icon: '💼', color: '#F59E0B' },
  { id: 'cat-4', label: '運動健身', icon: '🏋️', color: '#10B981' },
  { id: 'cat-5', label: '重要事宜', icon: '⭐', color: '#06B6D4' }
];

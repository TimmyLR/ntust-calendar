export const FIVE_SAMPLE_DEMO_COURSES = [
  {
    id: 'course-1',
    code: 'CS201',
    name: '演算法 (Algorithms)',
    shortName: '演算法',
    professor: '鄭教授',
    location: 'MA-205',
    credit: 3,
    color: '#3B82F6',
    schedule: [
      { day: 1, periods: ['3', '4'] },
      { day: 3, periods: ['3'] }
    ]
  },
  {
    id: 'course-2',
    code: 'CS202',
    name: '網路程式設計',
    shortName: '網路程式',
    professor: '陳教授',
    location: 'TR-310',
    credit: 3,
    color: '#10B981',
    schedule: [
      { day: 2, periods: ['6', '7', '8'] }
    ]
  },
  {
    id: 'course-3',
    code: 'CS203',
    name: '資料庫系統',
    shortName: '資料庫',
    professor: '林教授',
    location: 'IB-302',
    credit: 3,
    color: '#8B5CF6',
    schedule: [
      { day: 4, periods: ['2', '3', '4'] }
    ]
  },
  {
    id: 'course-4',
    code: 'CS204',
    name: '作業系統',
    shortName: '作業系統',
    professor: '黃教授',
    location: 'EE-101',
    credit: 3,
    color: '#F59E0B',
    schedule: [
      { day: 5, periods: ['6', '7', '8'] }
    ]
  },
  {
    id: 'course-5',
    code: 'CS205',
    name: '軟體工程',
    shortName: '軟體工程',
    professor: '張教授',
    location: 'MA-101',
    credit: 3,
    color: '#EC4899',
    schedule: [
      { day: 3, periods: ['6', '7'] }
    ]
  }
];

export const NTUST_SAMPLE_COURSES = FIVE_SAMPLE_DEMO_COURSES;

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

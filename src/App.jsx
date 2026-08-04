import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import AdminModal from './components/AdminModal';
import SettingsModal from './components/SettingsModal';
import ImportScheduleModal from './components/ImportScheduleModal';
import ManualCourseModal from './components/ManualCourseModal';
import QuickAddModal from './components/QuickAddModal';
import AddCustomModal from './components/AddCustomModal';
import TimetableGrid from './components/TimetableGrid';
import CalendarView from './components/CalendarView';
import EventList from './components/EventList';
import { Storage } from './utils/storage';
import { exportToICS } from './utils/icsExporter';
import { FIVE_SAMPLE_DEMO_COURSES } from '../server/mockData';
import { DEFAULT_QUICK_TAGS, DEFAULT_CUSTOM_CATEGORIES } from './utils/ntustPeriods';
import { Megaphone } from 'lucide-react';

export default function App() {
  const [viewMode, setViewMode] = useState('timetable'); // 'timetable' | 'calendar'
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [events, setEvents] = useState([]);
  const [tags, setTags] = useState(DEFAULT_QUICK_TAGS);
  const [categories, setCategories] = useState(DEFAULT_CUSTOM_CATEGORIES);
  const [announcement, setAnnouncement] = useState('');

  // Preference Settings: Theme, Font Size & Cloud API Endpoint
  const [theme, setTheme] = useState(localStorage.getItem('ntust_theme') || 'dark');
  const [fontSize, setFontSize] = useState(localStorage.getItem('ntust_font_size') || 'md');

  // Modals state
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isImportScheduleOpen, setIsImportScheduleOpen] = useState(false);
  const [isManualCourseOpen, setIsManualCourseOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isCustomAddOpen, setIsCustomAddOpen] = useState(false);

  // Quick add & edit contextual props
  const [quickAddCourseId, setQuickAddCourseId] = useState(null);
  const [quickAddDate, setQuickAddDate] = useState(null);
  const [quickAddPeriod, setQuickAddPeriod] = useState(null);
  const [quickAddDay, setQuickAddDay] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);

  const getInitialSampleEvents = () => [
    {
      id: 'evt-sample-1',
      title: '[演算法] 期中報告',
      courseId: 'course-1',
      courseName: '演算法 (Algorithms)',
      tag: '期中報告',
      tagIcon: '📝',
      date: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      period: '3',
      startTime: '10:20',
      endTime: '11:10',
      location: 'MA-205',
      color: '#3B82F6',
      description: '第三組簡報發表',
      createdAt: new Date().toISOString()
    }
  ];

  // Apply Theme & Font Scale to document <body> and <html> root
  useEffect(() => {
    // Migrate removed midnight theme to dark
    if (theme === 'midnight') setTheme('dark');
    document.body.classList.remove('theme-dark', 'theme-light');
    document.body.classList.add(`theme-${theme === 'midnight' ? 'dark' : theme}`);
    localStorage.setItem('ntust_theme', theme === 'midnight' ? 'dark' : theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.classList.remove('font-scale-sm', 'font-scale-md', 'font-scale-lg', 'font-scale-xl');
    document.documentElement.classList.add(`font-scale-${fontSize}`);
    localStorage.setItem('ntust_font_size', fontSize);
  }, [fontSize]);

  // Initialize app state: Ensure visitor ALWAYS gets 5 sample courses so page is never empty!
  useEffect(() => {
    const storedUser = Storage.getUser();
    const storedCourses = Storage.getCourses();
    const storedEvents = Storage.getEvents();
    const storedTags = Storage.getTags();
    const storedCats = Storage.getCategories();
    const storedAnnounce = localStorage.getItem('ntust_announcement');

    if (storedUser) setUser(storedUser);
    if (storedAnnounce) setAnnouncement(storedAnnounce);

    if (storedCourses && storedCourses.length > 0) {
      setCourses(storedCourses);
    } else {
      setCourses(FIVE_SAMPLE_DEMO_COURSES);
      Storage.saveCourses(FIVE_SAMPLE_DEMO_COURSES);
    }

    if (storedEvents && storedEvents.length > 0) {
      setEvents(storedEvents);
    } else {
      const initEvents = getInitialSampleEvents();
      setEvents(initEvents);
      Storage.saveEvents(initEvents);
    }

    if (storedTags && storedTags.length > 0) setTags(storedTags);
    if (storedCats && storedCats.length > 0) setCategories(storedCats);
  }, []);

  const handleUpdateAnnouncement = (text) => {
    setAnnouncement(text);
    if (text) {
      localStorage.setItem('ntust_announcement', text);
    } else {
      localStorage.removeItem('ntust_announcement');
    }
  };



  const handleResetDemoData = () => {
    if (window.confirm('確定要將課表與行程重置為系統預設的 5 門示範課程嗎？')) {
      setCourses(FIVE_SAMPLE_DEMO_COURSES);
      const defaultEvents = getInitialSampleEvents();
      setEvents(defaultEvents);
      Storage.saveCourses(FIVE_SAMPLE_DEMO_COURSES);
      Storage.saveEvents(defaultEvents);
      setIsSettingsOpen(false);
    }
  };

  const syncUserDataToBackend = (activeUser, updatedCourses, updatedEvents) => {
    if (!activeUser || !activeUser.username) return;
    Storage.saveUserActiveData(activeUser.username, updatedCourses, updatedEvents);
  };

  const handleAuthSuccess = (data) => {
    const loggedUser = data.user;
    setUser(loggedUser);
    Storage.saveUser(loggedUser);

    const userCourses = data.courses || [];
    const userEvents = data.events || [];

    setCourses(userCourses);
    setEvents(userEvents);

    Storage.saveCourses(userCourses);
    Storage.saveEvents(userEvents);
    Storage.saveUserActiveData(loggedUser.username, userCourses, userEvents);
  };

  const handleLogout = () => {
    setUser(null);
    Storage.saveUser(null);
    setCourses(FIVE_SAMPLE_DEMO_COURSES);
    const defaultEvents = getInitialSampleEvents();
    setEvents(defaultEvents);
    Storage.saveCourses(FIVE_SAMPLE_DEMO_COURSES);
    Storage.saveEvents(defaultEvents);
  };

  const handleImportCourses = (importedCourses) => {
    setCourses(importedCourses);
    Storage.saveCourses(importedCourses);
    syncUserDataToBackend(user, importedCourses, events);
  };

  const handleUpdateCourses = (updatedCourses) => {
    setCourses(updatedCourses);
    Storage.saveCourses(updatedCourses);
    syncUserDataToBackend(user, updatedCourses, events);
  };

  const handleAddEvent = (newEvent) => {
    const existsIndex = events.findIndex(e => e.id === newEvent.id);
    let updated = [];
    if (existsIndex >= 0) {
      updated = [...events];
      updated[existsIndex] = newEvent;
    } else {
      updated = [newEvent, ...events];
    }
    setEvents(updated);
    Storage.saveEvents(updated);
    syncUserDataToBackend(user, courses, updated);
  };

  const handleDeleteEvent = (eventId) => {
    const updated = events.filter(e => e.id !== eventId);
    setEvents(updated);
    Storage.saveEvents(updated);
    syncUserDataToBackend(user, courses, updated);
  };

  const handleUpdateTags = (updatedTags) => {
    setTags(updatedTags);
    Storage.saveTags(updatedTags);
  };

  const handleUpdateCategories = (updatedCats) => {
    setCategories(updatedCats);
    Storage.saveCategories(updatedCats);
  };

  const openQuickAddModal = (courseId = null, date = null, period = null, day = null) => {
    setEditingEvent(null);
    setQuickAddCourseId(courseId);
    setQuickAddDate(date);
    setQuickAddPeriod(period);
    setQuickAddDay(day);
    setIsQuickAddOpen(true);
  };

  const handleOpenEditEvent = (evt) => {
    setEditingEvent(evt);
    if (evt.isCustom) {
      setIsCustomAddOpen(true);
    } else {
      setIsQuickAddOpen(true);
    }
  };

  const handleExportICS = () => {
    exportToICS(events, courses);
  };

  const handleExportBackupJSON = () => {
    const backupObj = {
      user,
      courses,
      events,
      tags,
      categories,
      exportedAt: new Date().toISOString()
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupObj, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `ntust_calendar_user_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="min-h-screen flex flex-col font-sans transition-colors duration-300">
      
      {/* Navbar */}
      <Navbar
        viewMode={viewMode}
        setViewMode={setViewMode}
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenImportSchedule={() => setIsImportScheduleOpen(true)}
        onOpenManualCourse={() => setIsManualCourseOpen(true)}
        onOpenQuickAdd={() => openQuickAddModal(null, null, null, null)}
        onOpenCustomAdd={() => {
          setEditingEvent(null);
          setIsCustomAddOpen(true);
        }}
        onExportICS={handleExportICS}
        courseCount={courses.length}
        eventCount={events.length}
      />

      {/* Global Announcement Banner */}
      {announcement && (
        <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 px-4 py-2.5 text-sm font-extrabold shadow-md flex items-center justify-center gap-2 animate-fadeIn">
          <Megaphone className="w-4 h-4 shrink-0 fill-slate-950" />
          <span>{announcement}</span>
        </div>
      )}

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 lg:p-6 space-y-4">
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          
          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {viewMode === 'timetable' ? (
              <TimetableGrid
                courses={courses}
                events={events}
                onQuickAddForCourse={(courseId, periodId, dayId) => openQuickAddModal(courseId, null, periodId, dayId)}
                onOpenImportSchedule={() => setIsImportScheduleOpen(true)}
              />
            ) : (
              <CalendarView
                courses={courses}
                events={events}
                onOpenQuickAdd={(courseId, date) => openQuickAddModal(courseId, date, null, null)}
                onOpenCustomAdd={() => {
                  setEditingEvent(null);
                  setIsCustomAddOpen(true);
                }}
                onDeleteEvent={handleDeleteEvent}
                onEditEvent={handleOpenEditEvent}
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <EventList
              events={events}
              onDeleteEvent={handleDeleteEvent}
              onEditEvent={handleOpenEditEvent}
            />
          </div>

        </div>

      </main>

      {/* Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        onUpdateAnnouncement={handleUpdateAnnouncement}
        currentAnnouncement={announcement}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        theme={theme}
        onUpdateTheme={setTheme}
        fontSize={fontSize}
        onUpdateFontSize={setFontSize}
        onResetDemoData={handleResetDemoData}
        onExportBackup={handleExportBackupJSON}
      />

      <ImportScheduleModal
        isOpen={isImportScheduleOpen}
        onClose={() => setIsImportScheduleOpen(false)}
        onImportCourses={handleImportCourses}
      />

      <ManualCourseModal
        isOpen={isManualCourseOpen}
        onClose={() => setIsManualCourseOpen(false)}
        currentCourses={courses}
        onUpdateCourses={handleUpdateCourses}
      />

      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => {
          setIsQuickAddOpen(false);
          setEditingEvent(null);
        }}
        courses={courses}
        tags={tags}
        onUpdateTags={handleUpdateTags}
        onAddEvent={handleAddEvent}
        initialCourseId={quickAddCourseId}
        initialDate={quickAddDate}
        initialPeriod={quickAddPeriod}
        initialDay={quickAddDay}
        editingEvent={editingEvent}
      />

      <AddCustomModal
        isOpen={isCustomAddOpen}
        onClose={() => {
          setIsCustomAddOpen(false);
          setEditingEvent(null);
        }}
        categories={categories}
        onUpdateCategories={handleUpdateCategories}
        onAddEvent={handleAddEvent}
        editingEvent={editingEvent}
      />

    </div>
  );
}

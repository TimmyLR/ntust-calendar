const USERS_DB_KEY = 'ntust_app_users_db';
const USER_KEY = 'ntust_user';
const COURSES_KEY = 'ntust_courses';
const EVENTS_KEY = 'ntust_events';
const TAGS_KEY = 'ntust_tags';
const CATS_KEY = 'ntust_categories';

export const Storage = {
  getUsersDb() {
    try {
      const data = localStorage.getItem(USERS_DB_KEY);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  },

  saveUsersDb(db) {
    try {
      localStorage.setItem(USERS_DB_KEY, JSON.stringify(db));
    } catch {}
  },

  // Sanitize string to prevent XSS — strip all HTML tags
  _sanitize(str) {
    return (str || '').replace(/<[^>]*>/g, '').trim();
  },

  // Brute-force rate limiter: max 5 failed logins per 60 seconds
  _loginAttempts: {},
  _checkRateLimit(uKey) {
    const now = Date.now();
    const record = this._loginAttempts[uKey];
    if (!record) return true;
    // Clean old attempts (older than 60s)
    record.times = record.times.filter(t => now - t < 60000);
    return record.times.length < 5;
  },
  _recordFailedLogin(uKey) {
    if (!this._loginAttempts[uKey]) this._loginAttempts[uKey] = { times: [] };
    this._loginAttempts[uKey].times.push(Date.now());
  },

  registerUserClient(username, password, name) {
    const uKey = this._sanitize(username).toLowerCase();
    const pwd = this._sanitize(password);
    const displayName = this._sanitize(name) || '學生';

    if (!uKey || !pwd) return { success: false, message: '請輸入帳號與密碼！' };
    if (!/^[a-zA-Z0-9_]{2,20}$/.test(uKey)) return { success: false, message: '帳號僅允許英文、數字與底線，2～20 字元。' };
    if (pwd.length < 4) return { success: false, message: '密碼長度至少 4 位！' };
    if (displayName.length > 20) return { success: false, message: '姓名長度不得超過 20 字元！' };

    const db = this.getUsersDb();
    if (db[uKey]) {
      return { success: false, message: '此帳號已被註冊，請直接登入！' };
    }

    const newUser = {
      username: uKey,
      password: pwd,
      name: displayName,
      courses: [],
      events: []
    };

    db[uKey] = newUser;
    this.saveUsersDb(db);

    return {
      success: true,
      message: '註冊成功！已為您建立個人專屬空課表。',
      user: { username: uKey, name: newUser.name },
      courses: [],
      events: []
    };
  },

  loginUserClient(username, password) {
    const uKey = this._sanitize(username).toLowerCase();
    const pwd = this._sanitize(password);

    if (!uKey || !pwd) return { success: false, message: '請輸入帳號與密碼！' };

    if (!this._checkRateLimit(uKey)) {
      return { success: false, message: '登入嘗試過於頻繁，請稍候 1 分鐘後重試。' };
    }

    const db = this.getUsersDb();
    const user = db[uKey];

    if (!user || user.password !== pwd) {
      this._recordFailedLogin(uKey);
      return { success: false, message: '帳號或密碼錯誤，請重新確認！' };
    }

    return {
      success: true,
      message: `歡迎回來，${user.name}！`,
      user: { username: user.username, name: user.name },
      courses: user.courses || [],
      events: user.events || []
    };
  },

  saveUserActiveData(username, courses, events) {
    const uKey = (username || '').trim().toLowerCase();
    if (!uKey) return;
    const db = this.getUsersDb();
    if (db[uKey]) {
      db[uKey].courses = courses;
      db[uKey].events = events;
      this.saveUsersDb(db);
    }
  },

  getUser() {
    try {
      const data = localStorage.getItem(USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  saveUser(user) {
    try {
      if (!user) localStorage.removeItem(USER_KEY);
      else localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch {}
  },

  getCourses() {
    try {
      const data = localStorage.getItem(COURSES_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  saveCourses(courses) {
    try {
      localStorage.setItem(COURSES_KEY, JSON.stringify(courses));
    } catch {}
  },

  getEvents() {
    try {
      const data = localStorage.getItem(EVENTS_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  saveEvents(events) {
    try {
      localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
    } catch {}
  },

  getTags() {
    try {
      const data = localStorage.getItem(TAGS_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  saveTags(tags) {
    try {
      localStorage.setItem(TAGS_KEY, JSON.stringify(tags));
    } catch {}
  },

  getCategories() {
    try {
      const data = localStorage.getItem(CATS_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  saveCategories(cats) {
    try {
      localStorage.setItem(CATS_KEY, JSON.stringify(cats));
    } catch {}
  },

  clearAll() {
    try {
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(COURSES_KEY);
      localStorage.removeItem(EVENTS_KEY);
    } catch {}
  }
};

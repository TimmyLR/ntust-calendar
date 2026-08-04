import React, { useState, useEffect, useMemo } from 'react';
import { X, ShieldCheck, Users, Megaphone, Trash2, Key, Eye, Download, Lock, CheckCircle2, AlertCircle, Search, RefreshCw } from 'lucide-react';
import { Storage } from '../utils/storage';

export default function AdminModal({ isOpen, onClose, onUpdateAnnouncement, currentAnnouncement }) {
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [tab, setTab] = useState('users'); // 'users' | 'announcement' | 'backup'
  
  const [usersDb, setUsersDb] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [announcementText, setAnnouncementText] = useState(currentAnnouncement || '');
  
  const [editingUsername, setEditingUsername] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [selectedUserDetail, setSelectedUserDetail] = useState(null);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const refreshUsersList = async () => {
    try {
      const res = await fetch('/api/admin/users').catch(() => null);
      if (res && res.ok) {
        const data = await res.json();
        if (data.success && data.users) {
          const db = {};
          data.users.forEach(u => { db[u.username] = u; });
          setUsersDb(db);
          return;
        }
      }
    } catch {}
    // Fallback to localStorage if server is unreachable
    const db = Storage.getUsersDb();
    setUsersDb(db);
  };

  useEffect(() => {
    if (isOpen) {
      refreshUsersList();
      setAnnouncementText(currentAnnouncement || '');
    }
  }, [isOpen, currentAnnouncement]);

  // Rate limiting for admin login
  const [adminAttempts, setAdminAttempts] = useState([]);

  const usersList = useMemo(() => Object.values(usersDb).filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase()))
  ), [usersDb, searchTerm]);

  if (!isOpen) return null;

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    // Rate limit: max 3 attempts per 60 seconds
    const now = Date.now();
    const recentAttempts = adminAttempts.filter(t => now - t < 60000);
    if (recentAttempts.length >= 3) {
      setErrorMsg('嘗試次數過多，請等待 1 分鐘後再試。');
      setAdminPassword('');
      return;
    }

    // Hash-based verification — password never stored in plaintext in bundle
    const enc = new TextEncoder();
    const hashBuf = await crypto.subtle.digest('SHA-256', enc.encode(adminPassword.trim()));
    const hashHex = Array.from(new Uint8Array(hashBuf)).map(b => b.toString(16).padStart(2, '0')).join('');
    if (hashHex === '5c6719252144a6a5956bab5a5b58d462f94648205476d3b2051da37f41637f17') {
      setIsAdminUnlocked(true);
      setErrorMsg('');
      setAdminAttempts([]);
      refreshUsersList();
    } else {
      setAdminAttempts([...recentAttempts, now]);
      setAdminPassword('');
      const remaining = 3 - recentAttempts.length - 1;
      setErrorMsg(`金鑰密碼錯誤！剩餘嘗試次數：${remaining}`);
    }
  };

  const handleDeleteUser = async (uKey) => {
    if (!window.confirm(`確定要刪除帳號「${uKey}」及其所有個人行程資料嗎？此動作無法復原。`)) return;
    try {
      const res = await fetch('/api/admin/delete-user', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: uKey })
      }).catch(() => null);
      if (res && res.ok) {
        setSuccessMsg(`已成功刪除帳號：${uKey}`);
        if (selectedUserDetail?.username === uKey) setSelectedUserDetail(null);
        refreshUsersList();
        return;
      }
    } catch {}
    // Fallback to localStorage
    const db = Storage.getUsersDb();
    delete db[uKey];
    Storage.saveUsersDb(db);
    setUsersDb({ ...db });
    setSuccessMsg(`已成功刪除帳號：${uKey}`);
    if (selectedUserDetail?.username === uKey) setSelectedUserDetail(null);
  };

  const handleResetPassword = async (uKey) => {
    if (!newPassword.trim()) return;
    try {
      const res = await fetch('/api/admin/reset-password', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: uKey, newPassword: newPassword.trim() })
      }).catch(() => null);
      if (res && res.ok) {
        setSuccessMsg(`已重設帳號 ${uKey} 的密碼！`);
        setEditingUsername(null);
        setNewPassword('');
        return;
      }
    } catch {}
    // Fallback to localStorage
    const db = Storage.getUsersDb();
    if (db[uKey]) {
      db[uKey].password = newPassword.trim();
      Storage.saveUsersDb(db);
      setUsersDb({ ...db });
      setSuccessMsg(`已重設帳號 ${uKey} 的密碼！`);
      setEditingUsername(null);
      setNewPassword('');
    }
  };

  const handlePublishAnnouncement = (e) => {
    e.preventDefault();
    onUpdateAnnouncement(announcementText.trim());
    setSuccessMsg('已成功發布全站廣播公告！');
  };

  const handleExportBackup = () => {
    const db = Storage.getUsersDb();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(db, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `ntust_calendar_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden glass-panel max-h-[92vh] flex flex-col">
        
        {/* Clean Header without (Admin Dashboard) or subtitle */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-base">
              ⚙️
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white">管理系統</h3>
            </div>
          </div>
          <button onClick={onClose} aria-label="關閉" className="p-1 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        {!isAdminUnlocked ? (
          /* Password Screen */
          <div className="p-8 space-y-4 max-w-md mx-auto w-full text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">系統安全驗證</h4>
              <p className="text-xs text-slate-400 mt-1">請輸入存取金鑰密碼</p>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center justify-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-3">
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  placeholder="輸入存取金鑰密碼"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl glass-input text-xs font-mono"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 transition-all"
              >
                解鎖進入
              </button>
            </form>
          </div>
        ) : (
          /* Main Admin Panel */
          <div className="flex-1 flex flex-col overflow-hidden">
            
            {/* Admin Tabs */}
            <div className="px-6 py-2.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setTab('users')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                    tab === 'users' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>會員帳號管理 ({usersList.length})</span>
                </button>

                <button
                  onClick={() => setTab('announcement')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                    tab === 'announcement' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Megaphone className="w-3.5 h-3.5" />
                  <span>發布全站公告</span>
                </button>

                <button
                  onClick={() => setTab('backup')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                    tab === 'backup' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>資料庫備份</span>
                </button>
              </div>

              <button
                onClick={refreshUsersList}
                className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-amber-400 transition-all"
                title="重新整理資料"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-4">

              {successMsg && (
                <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{successMsg}</span>
                </div>
              )}

              {tab === 'users' && (
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="搜尋使用者帳號或姓名..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl glass-input text-xs"
                    />
                  </div>

                  <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/60">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 font-semibold">
                        <tr>
                          <th className="p-3">帳號 (Username)</th>
                          <th className="p-3">姓名 (Name)</th>
                          <th className="p-3">課程數</th>
                          <th className="p-3">行程數</th>
                          <th className="p-3 text-right">管理操作</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {usersList.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="p-6 text-center text-slate-500">
                              尚無註冊會員帳號
                            </td>
                          </tr>
                        ) : (
                          usersList.map((u) => (
                            <tr key={u.username} className="hover:bg-slate-900/60 transition-colors">
                              <td className="p-3 font-mono font-bold text-amber-400">{u.username}</td>
                              <td className="p-3 text-slate-200">{u.name}</td>
                              <td className="p-3 text-slate-400">{u.courses?.length || 0} 門</td>
                              <td className="p-3 text-slate-400">{u.events?.length || 0} 項</td>
                              <td className="p-3 text-right space-x-1">
                                <button
                                  onClick={() => setSelectedUserDetail(u)}
                                  className="p-1 rounded bg-slate-800 text-cyan-300 hover:bg-slate-700 transition-all text-[11px] px-2"
                                  title="檢視課表與行程"
                                >
                                  <Eye className="w-3 h-3 inline mr-1" />
                                  <span>查看課表</span>
                                </button>
                                <button
                                  onClick={() => setEditingUsername(editingUsername === u.username ? null : u.username)}
                                  className="p-1 rounded bg-slate-800 text-amber-300 hover:bg-slate-700 transition-all text-[11px] px-2"
                                  title="重設密碼"
                                >
                                  <Key className="w-3 h-3 inline mr-1" />
                                  <span>改密碼</span>
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(u.username)}
                                  className="p-1 rounded bg-red-950 border border-red-500/40 text-red-400 hover:bg-red-900/60 transition-all text-[11px] px-2"
                                  title="刪除帳號"
                                >
                                  <Trash2 className="w-3 h-3 inline" />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {editingUsername && (
                    <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/40 space-y-2 animate-fadeIn">
                      <h4 className="text-xs font-bold text-amber-300 flex items-center gap-1">
                        <Key className="w-3.5 h-3.5" />
                        <span>重設「{editingUsername}」的登入密碼</span>
                      </h4>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="輸入新密碼..."
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="flex-1 px-3 py-1.5 rounded-lg glass-input text-xs"
                        />
                        <button
                          onClick={() => handleResetPassword(editingUsername)}
                          className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs"
                        >
                          確定更換密碼
                        </button>
                      </div>
                    </div>
                  )}

                  {selectedUserDetail && (
                    <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/40 space-y-2 animate-fadeIn">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-cyan-300">
                          👤 「{selectedUserDetail.name} ({selectedUserDetail.username})」的個人課表 ({selectedUserDetail.courses?.length || 0} 門)
                        </h4>
                        <button onClick={() => setSelectedUserDetail(null)} className="text-slate-400 hover:text-white text-xs">
                          關閉檢視
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
                        {selectedUserDetail.courses?.map(c => (
                          <span key={c.id} className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
                            {c.name} ({c.professor || '教授'}) - {c.location || '教室'}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {tab === 'announcement' && (
                <form onSubmit={handlePublishAnnouncement} className="space-y-4">
                  <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs space-y-1">
                    <div className="font-bold flex items-center gap-1 text-white">
                      <Megaphone className="w-4 h-4 text-amber-400" />
                      <span>全站系統廣播公告功能</span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      在此發布的公告會即時顯示在全站所有學生行事曆頁面的頂部！
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">廣播公告內容 (若留空則代表關閉公告)</label>
                    <textarea
                      rows={4}
                      placeholder="例如: 📢 [系統公告] 113 學年度加退選將於本週五截止，請同學們及時確定課表！"
                      value={announcementText}
                      onChange={(e) => setAnnouncementText(e.target.value)}
                      className="w-full p-3 rounded-xl glass-input text-xs"
                    />
                  </div>

                  <div className="flex justify-between items-center">
                    <button
                      type="button"
                      onClick={() => {
                        setAnnouncementText('');
                        onUpdateAnnouncement('');
                        setSuccessMsg('已清除全站廣播公告！');
                      }}
                      className="px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-red-400 text-xs font-semibold"
                    >
                      清除公告
                    </button>

                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center gap-1.5"
                    >
                      <Megaphone className="w-4 h-4" />
                      <span>發布廣播公告</span>
                    </button>
                  </div>
                </form>
              )}

              {tab === 'backup' && (
                <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400">
                    <Download className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">全站資料庫一鍵匯出與備份</h4>
                    <p className="text-xs text-slate-400 mt-1">匯出包含全站註冊會員、個別課表與行程紀錄的 JSON 資料庫備份檔</p>
                  </div>

                  <button
                    onClick={handleExportBackup}
                    className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-cyan-500/20 transition-all inline-flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>下載全站資料庫備份 (.json)</span>
                  </button>
                </div>
              )}

            </div>

          </div>
        )}

      </div>
    </div>
  );
}

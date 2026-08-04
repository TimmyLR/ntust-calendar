import React, { useState } from 'react';
import { X, Lock, User, UserPlus, LogIn, AlertCircle, CheckCircle2, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { Storage } from '../utils/storage';
import { NTUST_SAMPLE_COURSES } from '../../server/mockData';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [tab, setTab] = useState('login'); // 'login' | 'register'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMsg('請輸入帳號與密碼！');
      return;
    }
    if (tab === 'register' && !name.trim()) {
      setErrorMsg('請輸入姓名或暱稱！');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const uInput = username.trim();
    const pInput = password.trim();
    const nInput = name.trim() || '小明';

    try {
      // Try backend server auth endpoint first
      const endpoint = tab === 'register' ? '/api/auth/register' : '/api/auth/login';
      const payload = tab === 'register' 
        ? { username: uInput, password: pInput, name: nInput }
        : { username: uInput, password: pInput };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch((err) => { console.warn('[Auth] Server unreachable:', err.message); return null; });

      if (res) {
        // Server is reachable — always use server response (both success AND error)
        const data = await res.json();
        if (data.success) {
          setSuccessMsg(data.message || (tab === 'register' ? '註冊成功！' : '登入成功！'));
          setTimeout(() => {
            onAuthSuccess(data);
            onClose();
          }, 600);
        } else {
          setErrorMsg(data.message || '操作失敗，請重新確認！');
        }
        setLoading(false);
        return;
      }

      // Fallback ONLY when server is completely unreachable (static deployment)
      let clientResult;
      if (tab === 'register') {
        clientResult = Storage.registerUserClient(uInput, pInput, nInput, NTUST_SAMPLE_COURSES, []);
      } else {
        clientResult = Storage.loginUserClient(uInput, pInput);
      }

      if (clientResult.success) {
        setSuccessMsg(clientResult.message);
        setTimeout(() => {
          onAuthSuccess(clientResult);
          onClose();
        }, 600);
      } else {
        setErrorMsg(clientResult.message);
      }

    } catch (err) {
      setErrorMsg('操作發生錯誤，請重試。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden glass-panel flex flex-col">
        
        {/* Header Tabs */}
        <div className="px-6 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => {
                setTab('login');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1 ${
                tab === 'login' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>帳號登入</span>
            </button>

            <button
              onClick={() => {
                setTab('register');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1 ${
                tab === 'register' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>註冊新帳號</span>
            </button>
          </div>

          <button onClick={onClose} aria-label="關閉" className="p-1 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} autoComplete="off" data-form-type="other" data-lpignore="true" className="space-y-3.5">
            {tab === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">您的姓名 / 暱稱 (Name)</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="例如: 小明"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl glass-input text-xs"
                    autoComplete="off"
                    data-lpignore="true"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">帳號 / 學號 (Username)</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  name="app_uid"
                  placeholder="請輸入自訂帳號或學號"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl glass-input text-xs"
                  autoComplete="off"
                  data-lpignore="true"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">密碼 (Password)</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  name="app_key"
                  placeholder="請輸入密碼"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl glass-input text-xs"
                  autoComplete="one-time-code"
                  data-lpignore="true"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-200"
                  title={showPassword ? "隱藏密碼" : "顯示密碼"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>每個帳號擁有獨立專屬的課表與行程紀錄。</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? '處理中...' : (tab === 'register' ? '立即註冊新帳號' : '登入個人帳號')}
            </button>
          </form>

        </div>

      </div>
    </div>
  );
}

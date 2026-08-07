import React from 'react';
import { X, Settings, Moon, Sun, Type, RefreshCw, Download, Palette, Smartphone } from 'lucide-react';

export default function SettingsModal({ 
  isOpen, 
  onClose, 
  theme, 
  onUpdateTheme, 
  fontSize, 
  onUpdateFontSize, 
  onResetDemoData,
  onExportBackup,
  isInstallable,
  isStandalone,
  onInstallPWA
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden glass-panel flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-black text-white">系統風格與基礎設定 (Settings)</h3>
          </div>
          <button onClick={onClose} aria-label="關閉" className="p-1 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">

          {/* 1. Theme Selector */}
          <div className="space-y-2.5">
            <label className="text-sm font-extrabold text-slate-200 flex items-center gap-2">
              <Palette className="w-4 h-4 text-purple-400" />
              <span>主題色彩切換 (Theme Mode)</span>
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              
              <button
                type="button"
                onClick={() => onUpdateTheme('dark')}
                className={`p-3.5 rounded-xl border text-center text-xs font-bold transition-all flex flex-col items-center gap-1.5 ${
                  theme === 'dark'
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md font-black scale-105'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Moon className="w-5 h-5 text-cyan-300" />
                <span>🌙 經典深色</span>
              </button>

              <button
                type="button"
                onClick={() => onUpdateTheme('light')}
                className={`p-3.5 rounded-xl border text-center text-xs font-bold transition-all flex flex-col items-center gap-1.5 ${
                  theme === 'light'
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md font-black scale-105'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Sun className="w-5 h-5 text-amber-400" />
                <span>☀️ 清爽淺色</span>
              </button>

            </div>
          </div>

          {/* 2. Font Size Scaling */}
          <div className="space-y-2.5">
            <label className="text-sm font-extrabold text-slate-200 flex items-center gap-2">
              <Type className="w-4 h-4 text-emerald-400" />
              <span>全站字體大小縮放 (Font Size)</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'sm', label: '偏小' },
                { id: 'md', label: '標準 (預設)' },
                { id: 'lg', label: '大字體' },
                { id: 'xl', label: '超大字體' }
              ].map(f => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => onUpdateFontSize(f.id)}
                  className={`py-2.5 px-2 rounded-xl border text-center text-xs font-bold transition-all ${
                    fontSize === f.id
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-black shadow'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3. PWA Installation (Hidden if already in standalone app mode) */}
          {!isStandalone && (
            <div className="space-y-2 pt-4 border-t border-slate-800">
              <label className="text-sm font-extrabold text-slate-200 flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-cyan-400" />
                <span>應用程式安裝 (App Installation)</span>
              </label>
              {isInstallable ? (
                <button
                  type="button"
                  onClick={onInstallPWA}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs shadow-lg transition-all flex items-center justify-center gap-2 scale-[1.02]"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>📱 安裝至桌面 / 手機主畫面 (Install APP)</span>
                </button>
              ) : (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 text-xs flex items-center justify-between">
                  <span>💡 可使用瀏覽器選單「新增至主畫面」下載應用程式</span>
                </div>
              )}
            </div>
          )}

          {/* 4. Backup & Reset Actions */}
          <div className="space-y-2 pt-4 border-t border-slate-800 flex justify-between items-center">
            <button
              type="button"
              onClick={onResetDemoData}
              className="px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-red-400 text-xs font-extrabold transition-all flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>重置為範例課表</span>
            </button>

            <button
              type="button"
              onClick={onExportBackup}
              className="px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-cyan-300 hover:bg-slate-800 text-xs font-extrabold transition-all flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>下載個人備份檔 (.json)</span>
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs shadow-md"
          >
            完成設定
          </button>
        </div>

      </div>
    </div>
  );
}

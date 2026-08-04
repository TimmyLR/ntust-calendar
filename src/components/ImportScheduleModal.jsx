import React, { useState } from 'react';
import { X, Upload, FileCode, CheckCircle2, AlertCircle, ArrowRight, FileText } from 'lucide-react';
import { parseNTUSTHtml } from '../utils/ntustHtmlParser';

export default function ImportScheduleModal({ isOpen, onClose, onImportCourses }) {
  const [tab, setTab] = useState('file'); // 'file' | 'text'
  const [pastedHtml, setPastedHtml] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const processFile = (file) => {
    if (!file) return;
    setErrorMsg('');
    setSuccessMsg('');

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result;
        if (typeof content === 'string') {
          const parsed = parseNTUSTHtml(content);
          if (parsed && parsed.length > 0) {
            setSuccessMsg(`成功從「${file.name}」解析並匯入 ${parsed.length} 門台科大課程！`);
            setTimeout(() => {
              onImportCourses(parsed);
              onClose();
            }, 700);
          } else {
            setErrorMsg('無法從檔案中識別台科大課表，請確認選擇的是「選課清單 - 國立臺灣科技大學選課系統.html」檔案！');
          }
        }
      } catch (err) {
        setErrorMsg('讀取檔案失敗，請重新選擇 HTML 檔案。');
      }
    };
    reader.onerror = () => setErrorMsg('檔案讀取失敗，請重試');
    reader.readAsText(file, 'UTF-8');
  };

  // Handle HTML File Selection / Upload
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    processFile(file);
  };

  // Handle Text / HTML Paste
  const handleTextImport = (e) => {
    e.preventDefault();
    if (!pastedHtml.trim()) {
      setErrorMsg('請先貼上選課清單網頁內容或 HTML！');
      return;
    }

    try {
      const parsed = parseNTUSTHtml(pastedHtml);
      if (parsed && parsed.length > 0) {
        setSuccessMsg(`成功解析並匯入 ${parsed.length} 門台科大課程！`);
        setTimeout(() => {
          onImportCourses(parsed);
          onClose();
        }, 700);
      } else {
        setErrorMsg('無效的網頁內容，請確認貼上的是選課系統 (ChooseList/D01/D01) 的原始碼或文字內容！');
      }
    } catch (err) {
      setErrorMsg('解析發生錯誤，請重試。');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden glass-panel flex flex-col">
        
        {/* Header Tabs */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setTab('file')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                tab === 'file' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>匯入 HTML 檔案 (推薦)</span>
            </button>

            <button
              onClick={() => setTab('text')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                tab === 'text' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>貼上網頁 HTML 碼</span>
            </button>
          </div>

          <button onClick={onClose} aria-label="關閉" className="p-1 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 flex-1">

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

          {tab === 'file' ? (
            /* TAB 1: File Upload for NTUST "選課清單 - 國立臺灣科技大學選課系統.html" */
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 text-cyan-300 text-xs space-y-1.5">
                <div className="font-bold text-white flex items-center gap-1 text-sm">
                  <FileCode className="w-4 h-4 text-cyan-400" />
                  <span>支援「選課清單 - 國立臺灣科技大學選課系統.html」</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  請在選課網頁右鍵「另存新檔」，選擇 HTML 檔案並上傳，即可直接讀取全部 20+ 門課程與功課表！
                </p>
              </div>

              {/* Upload Box */}
              <label 
                className="border-2 border-dashed border-slate-700 hover:border-cyan-500 bg-slate-950/60 hover:bg-slate-900/80 rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all group"
                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                onDrop={(e) => { e.preventDefault(); e.stopPropagation(); const file = e.dataTransfer.files[0]; processFile(file); }}
              >
                <Upload className="w-12 h-12 text-cyan-400 group-hover:scale-110 transition-transform mb-3" />
                <span className="text-sm font-extrabold text-white mb-1">點擊選擇 HTML 課表檔案</span>
                <span className="text-xs text-slate-400">或拖放 `.html` 檔案至此處</span>
                <input
                  type="file"
                  accept=".html,.htm"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          ) : (
            /* TAB 2: Text / HTML Paste */
            <form onSubmit={handleTextImport} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">貼上選課網頁原始碼或文字</label>
                <textarea
                  rows={6}
                  required
                  placeholder="請在此處貼上選課系統 ChooseList/D01/D01 的網頁 HTML 原始碼或複製的文字內容..."
                  value={pastedHtml}
                  onChange={(e) => setPastedHtml(e.target.value)}
                  className="w-full p-3.5 rounded-xl glass-input text-xs font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-extrabold text-xs shadow-lg shadow-cyan-500/20 hover:brightness-110 transition-all flex items-center justify-center gap-2"
              >
                <span>一鍵解析並匯入課表</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

        </div>

      </div>
    </div>
  );
}

import { useState, useRef, useCallback } from 'react';
import { CaseFormData, AttachmentFile, GeneratedCase } from '../data/caseWriterTypes';
import { caseCategories } from '../data/caseCategories';
import { generateCase, exportCase, TranslatedFields } from '../data/caseGenerator';
import { translateFormFields } from '../data/translator';

const emptyForm: CaseFormData = {
  mcid: '',
  issueScope: 'account',
  asinList: '',
  existingCaseId: '',
  category: '',
  subcategory: '',
  description: '',
  actionsTaken: '',
  desiredOutcome: '',
  attachments: [],
};

export default function CaseWriter() {
  const [form, setForm] = useState<CaseFormData>(emptyForm);
  const [generated, setGenerated] = useState<GeneratedCase | null>(null);
  const [step, setStep] = useState<'form' | 'preview'>('form');
  const [copyFeedback, setCopyFeedback] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const update = useCallback(<K extends keyof CaseFormData>(key: K, val: CaseFormData[K]) => {
    setForm(prev => ({ ...prev, [key]: val }));
  }, []);

  const selectedCategory = caseCategories.find(c => c.id === form.category);
  const selectedSub = selectedCategory?.subcategories.find(s => s.id === form.subcategory);

  const canGenerate =
    form.mcid.trim() !== '' &&
    form.category !== '' &&
    form.subcategory !== '' &&
    form.description.trim() !== '' &&
    form.actionsTaken.trim() !== '' &&
    form.desiredOutcome.trim() !== '' &&
    (form.issueScope === 'account' || form.asinList.trim() !== '');

  async function handleGenerate() {
    if (!canGenerate) return;
    setIsGenerating(true);
    try {
      // 翻譯賣家填寫的中文內容為英文
      let translatedEn: TranslatedFields | undefined;
      try {
        translatedEn = await translateFormFields({
          description: form.description,
          actionsTaken: form.actionsTaken,
          desiredOutcome: form.desiredOutcome,
        });
      } catch {
        // 翻譯失敗時，英文版會使用原文（中文）
        translatedEn = undefined;
      }
      const result = generateCase(form, translatedEn);
      setGenerated(result);
      setStep('preview');
    } finally {
      setIsGenerating(false);
    }
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        const att: AttachmentFile = {
          id: crypto.randomUUID(),
          name: file.name,
          type: file.type,
          size: file.size,
          dataUrl: reader.result as string,
          preview: file.type.startsWith('image/') ? reader.result as string : undefined,
        };
        setForm(prev => ({ ...prev, attachments: [...prev.attachments, att] }));
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  }

  function removeAttachment(id: string) {
    update('attachments', form.attachments.filter(a => a.id !== id));
  }

  async function copyToClipboard(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopyFeedback(label);
      setTimeout(() => setCopyFeedback(''), 2000);
    } catch { /* fallback */ }
  }

  async function handleExport() {
    if (!generated) return;
    await exportCase(generated, form);
  }

  function handleReset() {
    setForm(emptyForm);
    setGenerated(null);
    setStep('form');
  }

  if (step === 'preview' && generated) {
    return <PreviewStep
      generated={generated} form={form} copyFeedback={copyFeedback}
      onCopy={copyToClipboard} onExport={handleExport}
      onBack={() => setStep('form')} onReset={handleReset}
    />;
  }

  // Calculate form completion
  const formSteps = [
    { label: '基本資訊', done: form.mcid.trim() !== '' },
    { label: '問題分類', done: form.category !== '' && form.subcategory !== '' },
    { label: '問題詳情', done: form.description.trim() !== '' && form.actionsTaken.trim() !== '' && form.desiredOutcome.trim() !== '' },
  ];
  const completedSteps = formSteps.filter(s => s.done).length;

  return (
    <div className="space-y-6">
      {/* Form progress stepper */}
      <div className="bg-white rounded-xl border p-4 animate-fadeIn">
        <div className="flex items-center justify-between">
          {formSteps.map((s, i) => (
            <div key={i} className="flex items-center flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                s.done ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {s.done ? '✓' : i + 1}
              </div>
              <span className={`ml-2 text-sm hidden sm:inline ${s.done ? 'text-green-700 font-medium' : 'text-gray-400'}`}>
                {s.label}
              </span>
              {i < formSteps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-3 transition-all duration-500 ${
                  s.done ? 'bg-green-400' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="mt-2 text-xs text-gray-400 text-center">
          {completedSteps}/{formSteps.length} 步驟完成
        </div>
      </div>
      {/* 基本資訊 */}
      <Section title="基本資訊" icon="🔑">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="賣家 MCID" required>
            <input type="text" value={form.mcid}
              onChange={e => update('mcid', e.target.value)}
              placeholder="例如：A1B2C3D4E5F6G7" className="input-field" />
          </Field>
          <Field label="問題範圍" required>
            <div className="flex gap-3 mt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="scope" checked={form.issueScope === 'account'}
                  onChange={() => update('issueScope', 'account')} className="accent-amazon-orange" />
                <span className="text-sm">帳號相關</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="scope" checked={form.issueScope === 'asin'}
                  onChange={() => update('issueScope', 'asin')} className="accent-amazon-orange" />
                <span className="text-sm">ASIN 相關</span>
              </label>
            </div>
          </Field>
        </div>
        {form.issueScope === 'asin' && (
          <Field label="ASIN 編號" required className="mt-4">
            <input type="text" value={form.asinList}
              onChange={e => update('asinList', e.target.value)}
              placeholder="多個 ASIN 請用逗號隔開，例如：B08XYZ1234, B09ABC5678" className="input-field" />
          </Field>
        )}
        <Field label="已開立的 Case ID（選填）" className="mt-4">
          <input type="text" value={form.existingCaseId}
            onChange={e => update('existingCaseId', e.target.value)}
            placeholder="若已在後台開過 Case，請填入 Case ID" className="input-field" />
        </Field>
      </Section>

      {/* 問題分類 */}
      <Section title="問題分類" icon="📂">
        <Field label="選擇問題類別" required>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1">
            {caseCategories.map(cat => (
              <button key={cat.id}
                onClick={() => { update('category', cat.id); update('subcategory', ''); }}
                className={`p-3 rounded-lg border text-left transition text-sm ${
                  form.category === cat.id
                    ? 'border-amazon-orange bg-orange-50 ring-1 ring-amazon-orange'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}>
                <span className="text-lg">{cat.icon}</span>
                <div className="mt-1 font-medium">{cat.label}</div>
              </button>
            ))}
          </div>
        </Field>
        {selectedCategory && (
          <Field label="選擇子類別" required className="mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
              {selectedCategory.subcategories.map(sub => (
                <button key={sub.id} onClick={() => update('subcategory', sub.id)}
                  className={`p-3 rounded-lg border text-left transition text-sm ${
                    form.subcategory === sub.id
                      ? 'border-amazon-orange bg-orange-50 ring-1 ring-amazon-orange'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}>
                  <div className="font-medium">{sub.label}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{sub.labelEn}</div>
                </button>
              ))}
            </div>
          </Field>
        )}
      </Section>

      {/* 參考資源 */}
      {selectedSub && selectedSub.helpLinks.length > 0 && (
        <Section title="💡 官方參考資源" icon="">
          <p className="text-sm text-gray-500 mb-3">在開 Case 之前，建議先參考以下官方資源，可能已有解決方案：</p>
          <div className="space-y-2">
            {selectedSub.helpLinks.map((link, i) => (
              <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-amazon-blue hover:bg-blue-50/30 transition text-sm group">
                <span className="text-lg">{link.source === 'youtube' ? '🎬' : link.source === 'amazon-tw' ? '🌏' : '📖'}</span>
                <span className="group-hover:text-amazon-blue">{link.title}</span>
                <span className="ml-auto text-gray-300 group-hover:text-amazon-blue">↗</span>
              </a>
            ))}
          </div>
        </Section>
      )}

      {/* 問題描述 */}
      <Section title="問題詳情" icon="✏️">
        <Field label="問題描述" required hint={selectedSub?.templateHints.descriptionPrompt}>
          <textarea value={form.description} onChange={e => update('description', e.target.value)}
            placeholder={selectedSub?.templateHints.descriptionPrompt ?? '請詳細描述你遇到的問題...'} rows={4} className="input-field resize-y" />
          <div className="text-xs text-gray-400 text-right mt-1">{form.description.length} 字</div>
        </Field>
        <Field label="已採取的改善措施" required hint={selectedSub?.templateHints.actionsPrompt} className="mt-4">
          <textarea value={form.actionsTaken} onChange={e => update('actionsTaken', e.target.value)}
            placeholder={selectedSub?.templateHints.actionsPrompt ?? '請說明你已經做了哪些嘗試...'} rows={3} className="input-field resize-y" />
          <div className="text-xs text-gray-400 text-right mt-1">{form.actionsTaken.length} 字</div>
        </Field>
        <Field label="希望得到的結果" required hint={selectedSub?.templateHints.outcomePrompt} className="mt-4">
          <textarea value={form.desiredOutcome} onChange={e => update('desiredOutcome', e.target.value)}
            placeholder={selectedSub?.templateHints.outcomePrompt ?? '請說明你期望的處理結果...'} rows={2} className="input-field resize-y" />
          <div className="text-xs text-gray-400 text-right mt-1">{form.desiredOutcome.length} 字</div>
        </Field>
      </Section>

      {/* 附件上傳 */}
      <Section title="附件上傳" icon="📎">
        <p className="text-sm text-gray-500 mb-3">上傳截圖或相關文件作為佐證（支援圖片、PDF 等）</p>
        <input ref={fileInputRef} type="file" multiple accept="image/*,.pdf,.doc,.docx,.xlsx,.csv"
          onChange={handleFileUpload} className="hidden" />
        <button onClick={() => fileInputRef.current?.click()}
          className="px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-amazon-orange hover:text-amazon-orange transition w-full">
          點擊上傳檔案 或 拖曳檔案至此
        </button>
        {form.attachments.length > 0 && (
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
            {form.attachments.map(att => (
              <div key={att.id} className="relative border rounded-lg p-2 group">
                {att.preview
                  ? <img src={att.preview} alt={att.name} className="w-full h-20 object-cover rounded" />
                  : <div className="w-full h-20 bg-gray-100 rounded flex items-center justify-center text-2xl">📄</div>}
                <div className="text-xs text-gray-500 mt-1 truncate">{att.name}</div>
                <button onClick={() => removeAttachment(att.id)}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition"
                  aria-label={`移除 ${att.name}`}>×</button>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* 產生按鈕 */}
      <div className="flex flex-col items-center pb-8 gap-2">
        <button onClick={handleGenerate} disabled={!canGenerate || isGenerating}
          className="px-10 py-3 bg-amazon-orange text-white font-semibold rounded-lg text-lg
            hover:bg-orange-500 hover:shadow-lg hover:-translate-y-0.5
            transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed
            disabled:hover:translate-y-0 disabled:hover:shadow-none shadow-md">
          {isGenerating ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              翻譯並產生中...
            </span>
          ) : '🚀 產生 Case 內容（含自動翻譯）'}
        </button>
        {!canGenerate && !isGenerating && (
          <p className="text-xs text-gray-400">請填寫所有必填欄位（標有 <span className="text-red-500">*</span> 的欄位）</p>
        )}
      </div>
    </div>
  );
}

/* ── Preview Step ── */
interface PreviewProps {
  generated: GeneratedCase;
  form: CaseFormData;
  copyFeedback: string;
  onCopy: (text: string, label: string) => void;
  onExport: () => void;
  onBack: () => void;
  onReset: () => void;
}

function PreviewStep({ generated, form, copyFeedback, onCopy, onExport, onBack, onReset }: PreviewProps) {
  const [tab, setTab] = useState<'zh' | 'en'>('zh');

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-gradient-to-r from-green-700 to-green-600 rounded-xl p-6 text-white shadow-lg">
        <h2 className="text-xl font-bold mb-1">✅ Case 內容已產生</h2>
        <p className="text-sm text-green-200">請檢視以下內容，中文內容已自動翻譯為英文版。可直接複製貼到 Seller Central 或匯出</p>
      </div>

      {/* 參考資源 */}
      {generated.helpLinks.length > 0 && (
        <Section title="💡 建議先參考的官方資源" icon="">
          <p className="text-sm text-gray-500 mb-2">開 Case 前建議先查閱，可能已有自助解決方案：</p>
          <div className="space-y-2">
            {generated.helpLinks.map((link, i) => (
              <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-amazon-blue hover:bg-blue-50/30 transition text-sm group">
                <span className="text-lg">{link.source === 'youtube' ? '🎬' : link.source === 'amazon-tw' ? '🌏' : '📖'}</span>
                <span className="group-hover:text-amazon-blue">{link.title}</span>
                <span className="ml-auto text-gray-300 group-hover:text-amazon-blue">↗</span>
              </a>
            ))}
          </div>
        </Section>
      )}

      {/* 語言切換 */}
      <div className="flex gap-2">
        <button onClick={() => setTab('zh')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            tab === 'zh' ? 'bg-amazon-dark text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}>🇹🇼 中文版</button>
        <button onClick={() => setTab('en')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            tab === 'en' ? 'bg-amazon-dark text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}>🇺🇸 English</button>
      </div>

      {/* Case 內容 */}
      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-400">{tab === 'zh' ? '主旨' : 'Subject'}</div>
            <div className="font-medium text-sm">{tab === 'zh' ? generated.zhTitle : generated.enTitle}</div>
          </div>
          <button onClick={() => onCopy(
            tab === 'zh' ? `${generated.zhTitle}\n\n${generated.zhBody}` : `${generated.enTitle}\n\n${generated.enBody}`,
            tab === 'zh' ? '中文版已複製' : 'English copied'
          )}
            className={`px-4 py-1.5 text-sm rounded-lg transition-all duration-200 font-medium ${
              copyFeedback ? 'bg-green-500 text-white' : 'bg-amazon-orange text-white hover:bg-orange-500 hover:shadow-md'
            }`}>
            {copyFeedback ? `✓ ${copyFeedback}` : '📋 複製全文'}
          </button>
        </div>
        <pre className="p-4 text-sm whitespace-pre-wrap font-sans text-gray-700 leading-relaxed max-h-[500px] overflow-y-auto">
          {tab === 'zh' ? generated.zhBody : generated.enBody}
        </pre>
      </div>

      {/* 附件提醒 */}
      {form.attachments.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="text-sm font-medium text-amber-800 mb-2">📎 記得附上以下檔案：</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {form.attachments.map(att => (
              <div key={att.id} className="flex items-center gap-2 text-xs text-amber-700 bg-white rounded p-2 border border-amber-100">
                {att.preview
                  ? <img src={att.preview} alt={att.name} className="w-8 h-8 object-cover rounded" />
                  : <span className="text-lg">📄</span>}
                <span className="truncate">{att.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 操作按鈕 */}
      <div className="flex flex-wrap gap-3 justify-center pb-8">
        <button onClick={onBack} className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 hover:border-gray-400 transition-all duration-200">
          ← 返回修改
        </button>
        <button onClick={onExport} className="px-6 py-2.5 bg-amazon-blue text-white rounded-lg text-sm hover:bg-blue-700 hover:shadow-md transition-all duration-200">
          {form.attachments.length > 0 ? '📥 匯出 ZIP 壓縮檔' : '📥 匯出 TXT 檔案'}
        </button>
        <button onClick={onReset} className="px-6 py-2.5 bg-gray-600 text-white rounded-lg text-sm hover:bg-gray-700 hover:shadow-md transition-all duration-200">
          🔄 撰寫新 Case
        </button>
      </div>
    </div>
  );
}

/* ── Shared UI Components ── */
function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow duration-200 animate-fadeIn">
      <h3 className="text-base font-semibold text-amazon-dark mb-4">
        {icon && <span className="mr-1">{icon}</span>}{title}
      </h3>
      {children}
    </section>
  );
}

function Field({ label, required, hint, className, children }: {
  label: string; required?: boolean; hint?: string; className?: string; children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {hint && <p className="text-xs text-gray-400 mb-1">{hint}</p>}
      {children}
    </div>
  );
}

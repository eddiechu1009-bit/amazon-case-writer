import CaseWriter from './components/CaseWriter';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-amazon-dark text-white px-4 py-3 flex items-center justify-between sticky top-0 z-50 shadow-lg">
        <div className="flex items-center gap-3">
          <span className="text-xl">📝</span>
          <h1 className="text-lg font-semibold">Amazon Seller Support Case 撰寫工具</h1>
        </div>
        <div className="text-xs text-gray-400">
          Seller Central Case &amp; SIM Escalation
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <CaseWriter />
      </main>

      <footer className="text-center text-xs text-gray-400 py-6 border-t">
        本工具協助賣家撰寫結構化的 Seller Support Case，產生中英文版內容。
        <br />
        也可用於內部 SIM Escalation 使用。僅供參考，請依實際情況調整內容。
      </footer>
    </div>
  );
}

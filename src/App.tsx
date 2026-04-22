import CaseWriter from './components/CaseWriter';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-amazon-dark text-white px-4 py-3 flex items-center justify-between sticky top-0 z-50 shadow-lg">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📝</span>
          <div>
            <h1 className="text-lg font-semibold">Amazon Seller Support Case 撰寫工具</h1>
            <p className="text-xs text-gray-400">適用所有站點 · Seller Central Case &amp; SIM Escalation</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <CaseWriter />
      </main>

      <footer className="text-center text-xs text-gray-400 py-6 border-t">
        本工具協助賣家撰寫結構化的 Seller Support Case，產生中英文版內容。適用於所有 Amazon 站點（US/EU/UK/JP/AU 等）。
        <br />
        也可用於內部 SIM Escalation 使用。僅供參考，請依實際情況調整內容。
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <a href="https://amzeuseller.netlify.app/" target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-gray-100 hover:bg-amazon-orange/10 hover:text-amazon-dark rounded-lg transition-all duration-200">🇪🇺 新賣家準備工具</a>
          <a href="https://eu-seller-toolkit.netlify.app/" target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-gray-100 hover:bg-amazon-orange/10 hover:text-amazon-dark rounded-lg transition-all duration-200">🛠️ 營運工具箱</a>
          <a href="https://eu-accounting.netlify.app/" target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-gray-100 hover:bg-amazon-orange/10 hover:text-amazon-dark rounded-lg transition-all duration-200">📊 帳務分析工具</a>
        </div>
      </footer>
    </div>
  );
}

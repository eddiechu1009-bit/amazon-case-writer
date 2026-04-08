/**
 * 中翻英翻譯模組
 * 策略：Amazon 賣家專業術語詞典 + MyMemory 免費翻譯 API
 * 先用詞典保護專業術語不被誤翻，再送 API 翻譯整段
 */

// Amazon 賣家常用中英術語對照表
const amazonTerms: [RegExp, string][] = [
  // 帳號相關
  [/賣家帳號/g, 'seller account'],
  [/帳號健康度/g, 'Account Health'],
  [/帳號停權/g, 'account suspension'],
  [/停權/g, 'suspension'],
  [/行動計畫/g, 'Plan of Action (POA)'],
  [/申訴/g, 'appeal'],
  [/績效通知/g, 'Performance Notification'],
  [/帳號審核/g, 'account review'],
  [/身份驗證/g, 'identity verification'],
  [/帳號關聯/g, 'account linking'],

  // Listing 相關
  [/商品刊登/g, 'product listing'],
  [/下架/g, 'deactivated'],
  [/抑制/g, 'suppressed'],
  [/跟賣/g, 'hijacking'],
  [/變體/g, 'variation'],
  [/父體/g, 'parent ASIN'],
  [/子體/g, 'child ASIN'],
  [/商品詳情頁/g, 'product detail page'],
  [/五點描述/g, 'bullet points'],
  [/商品標題/g, 'product title'],
  [/後台/g, 'Seller Central'],
  [/前台/g, 'product detail page'],
  [/類目/g, 'category'],
  [/節點/g, 'browse node'],
  [/關鍵字/g, 'keywords'],
  [/搜尋詞/g, 'search terms'],

  // FBA 相關
  [/入倉/g, 'inbound shipment'],
  [/出倉/g, 'outbound'],
  [/庫存/g, 'inventory'],
  [/倉庫/g, 'fulfillment center'],
  [/配送/g, 'fulfillment'],
  [/移除訂單/g, 'removal order'],
  [/退貨/g, 'return'],
  [/賠償/g, 'reimbursement'],
  [/遺失/g, 'lost'],
  [/損壞/g, 'damaged'],
  [/貨件/g, 'shipment'],
  [/提貨單/g, 'Bill of Lading (BOL)'],
  [/裝箱單/g, 'packing list'],

  // 品牌相關
  [/品牌註冊/g, 'Brand Registry'],
  [/品牌備案/g, 'Brand Registry'],
  [/智慧財產權/g, 'intellectual property'],
  [/智財權/g, 'intellectual property'],
  [/商標/g, 'trademark'],
  [/專利/g, 'patent'],
  [/版權/g, 'copyright'],
  [/授權書/g, 'Letter of Authorization'],
  [/侵權/g, 'infringement'],
  [/投訴/g, 'complaint'],
  [/反通知/g, 'counter-notice'],

  // 合規相關
  [/合規/g, 'compliance'],
  [/認證/g, 'certification'],
  [/測試報告/g, 'test report'],
  [/安規/g, 'safety compliance'],
  [/包裝法規/g, 'packaging regulations'],

  // 費用相關
  [/佣金/g, 'referral fee'],
  [/倉儲費/g, 'storage fee'],
  [/配送費/g, 'fulfillment fee'],
  [/撥款/g, 'disbursement'],
  [/保留金/g, 'reserve'],
  [/多收費/g, 'overcharge'],

  // 通用
  [/消費者/g, 'customer'],
  [/買家/g, 'buyer'],
  [/賣家/g, 'seller'],
  [/訂單/g, 'order'],
  [/客服/g, 'Seller Support'],
  [/截圖/g, 'screenshot'],
  [/佐證/g, 'supporting evidence'],
  [/附件/g, 'attachment'],
];

/**
 * 用 Amazon 術語詞典預處理文字
 * 將中文專業術語替換為英文，避免翻譯 API 誤翻
 */
function applyTermDictionary(text: string): string {
  let result = text;
  for (const [pattern, replacement] of amazonTerms) {
    result = result.replace(pattern, replacement);
  }
  return result;
}

/**
 * 呼叫 MyMemory 免費翻譯 API
 * 限制：每天 5000 字免費，單次最多 500 字
 * https://mymemory.translated.net/doc/spec.php
 */
async function translateViaAPI(text: string): Promise<string> {
  // MyMemory 單次限制 500 字，需要分段
  const chunks = splitText(text, 450);
  const results: string[] = [];

  for (const chunk of chunks) {
    try {
      const params = new URLSearchParams({
        q: chunk,
        langpair: 'zh-TW|en',
      });
      const res = await fetch(`https://api.mymemory.translated.net/get?${params}`);
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      const translated = data?.responseData?.translatedText;
      if (translated) {
        results.push(translated);
      } else {
        results.push(chunk); // fallback: 保留原文
      }
    } catch {
      results.push(chunk); // fallback: 保留原文
    }
  }

  return results.join(' ');
}

/** 將文字按句子分段，每段不超過 maxLen 字元 */
function splitText(text: string, maxLen: number): string[] {
  if (text.length <= maxLen) return [text];

  const sentences = text.split(/(?<=[。！？\n])/);
  const chunks: string[] = [];
  let current = '';

  for (const sentence of sentences) {
    if ((current + sentence).length > maxLen && current.length > 0) {
      chunks.push(current.trim());
      current = sentence;
    } else {
      current += sentence;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

/**
 * 主翻譯函式：中文 → 英文
 * 1. 先用 Amazon 術語詞典替換專業術語
 * 2. 再用 MyMemory API 翻譯整段
 */
export async function translateToEnglish(chineseText: string): Promise<string> {
  if (!chineseText.trim()) return '';

  // Step 1: 術語預處理
  const preprocessed = applyTermDictionary(chineseText);

  // Step 2: 如果預處理後已經大部分是英文，直接返回
  const chineseCharCount = (preprocessed.match(/[\u4e00-\u9fff]/g) || []).length;
  if (chineseCharCount === 0) return preprocessed;

  // Step 3: API 翻譯
  const translated = await translateViaAPI(preprocessed);
  return translated;
}

/**
 * 批次翻譯多個欄位
 */
export async function translateFormFields(fields: {
  description: string;
  actionsTaken: string;
  desiredOutcome: string;
}): Promise<{
  description: string;
  actionsTaken: string;
  desiredOutcome: string;
}> {
  const [description, actionsTaken, desiredOutcome] = await Promise.all([
    translateToEnglish(fields.description),
    translateToEnglish(fields.actionsTaken),
    translateToEnglish(fields.desiredOutcome),
  ]);
  return { description, actionsTaken, desiredOutcome };
}

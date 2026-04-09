import { CaseCategory } from './caseWriterTypes';

export const caseCategories: CaseCategory[] = [
  {
    id: 'listing',
    label: 'Listing 問題',
    labelEn: 'Listing Issues',
    icon: '📦',
    subcategories: [
      {
        id: 'listing-suppressed',
        label: 'Listing 被下架 / 抑制',
        labelEn: 'Listing Suppressed / Deactivated',
        helpLinks: [
          { title: '修正被抑制的商品 - Seller University', url: 'https://sellercentral.amazon.com/help/hub/reference/G200898440', source: 'seller-central' },
          { title: 'Amazon 全球開店 - 商品刊登教學', url: 'https://gs.amazon.com.tw/learn/seller-university?ref=as_tw_ags_footer_su', source: 'amazon-tw' },
          { title: 'Amazon 全球開店 YouTube 教學', url: 'https://www.youtube.com/@amazonglobalsellingtw', source: 'youtube' },
        ],
        templateHints: {
          descriptionPrompt: '請描述 Listing 被下架的情況，例如：何時被下架、收到什麼通知、影響哪些 ASIN',
          actionsPrompt: '請說明已採取的改善措施，例如：修改了哪些欄位、上傳了什麼文件',
          outcomePrompt: '例如：希望恢復 Listing 上架狀態',
        },
      },
      {
        id: 'listing-hijack',
        label: 'Listing 被跟賣 / 侵權',
        labelEn: 'Listing Hijacked / IP Infringement',
        helpLinks: [
          { title: '品牌註冊與保護 - Amazon Brand Registry', url: 'https://brandregistry.amazon.com/', source: 'seller-central' },
          { title: '檢舉侵權 - Report a Violation', url: 'https://sellercentral.amazon.com/help/hub/reference/G200444420', source: 'seller-central' },
        ],
        templateHints: {
          descriptionPrompt: '請描述跟賣或侵權情況，例如：哪些賣家在跟賣、是否有品牌註冊',
          actionsPrompt: '請說明已採取的措施，例如：已透過 Brand Registry 提交檢舉、已發送停止侵權通知',
          outcomePrompt: '例如：希望移除未授權賣家、恢復品牌獨佔',
        },
      },
      {
        id: 'listing-merge-split',
        label: 'Listing 合併 / 拆分 / 變體問題',
        labelEn: 'Listing Merge / Split / Variation Issues',
        helpLinks: [
          { title: '管理變體關係 - Seller Central', url: 'https://sellercentral.amazon.com/help/hub/reference/G201958220', source: 'seller-central' },
        ],
        templateHints: {
          descriptionPrompt: '請描述變體問題，例如：哪些 ASIN 需要合併或拆分、目前的變體結構',
          actionsPrompt: '請說明已嘗試的操作，例如：透過 Flat File 上傳、使用 Add a Product 工具',
          outcomePrompt: '例如：希望將指定 ASIN 合併為同一父體、或拆分為獨立 Listing',
        },
      },
    ],
  },
  {
    id: 'account',
    label: '帳號問題',
    labelEn: 'Account Issues',
    icon: '👤',
    subcategories: [
      {
        id: 'account-suspended',
        label: '帳號被停權 / 審核',
        labelEn: 'Account Suspended / Under Review',
        helpLinks: [
          { title: '帳號健康度 - Account Health', url: 'https://sellercentral.amazon.com/help/hub/reference/G200205250', source: 'seller-central' },
          { title: 'Amazon 全球開店 - 帳號管理', url: 'https://gs.amazon.com.tw/', source: 'amazon-tw' },
        ],
        templateHints: {
          descriptionPrompt: '請描述帳號問題，例如：何時收到停權通知、停權原因為何',
          actionsPrompt: '請說明已採取的改善措施，例如：已提交行動計畫 (POA)、已更新文件',
          outcomePrompt: '例如：希望恢復帳號銷售權限',
        },
      },
      {
        id: 'account-verification',
        label: 'KYC / 身份驗證',
        labelEn: 'KYC / Identity Verification',
        helpLinks: [
          { title: 'KYC 驗證流程 - Seller Central', url: 'https://sellercentral.amazon.com/help/hub/reference/G201468460', source: 'seller-central' },
          { title: '亞馬遜 KYC 合規指南', url: 'https://gs.amazon.com.tw/', source: 'amazon-tw' },
        ],
        templateHints: {
          descriptionPrompt: '請描述驗證問題，例如：卡在哪個驗證步驟、上傳了什麼文件被拒',
          actionsPrompt: '請說明已嘗試的操作，例如：重新上傳文件、聯繫過幾次客服',
          outcomePrompt: '例如：希望完成 KYC 驗證、通過身份審核',
        },
      },
      {
        id: 'account-linked',
        label: '帳號關聯 / 多帳號問題',
        labelEn: 'Account Linked / Multiple Accounts',
        helpLinks: [
          { title: '多帳號政策 - Seller Central', url: 'https://sellercentral.amazon.com/help/hub/reference/G200386250', source: 'seller-central' },
        ],
        templateHints: {
          descriptionPrompt: '請描述帳號關聯情況，例如：收到什麼關聯通知、涉及哪些帳號',
          actionsPrompt: '請說明已採取的措施，例如：已提交申訴、已說明帳號獨立性',
          outcomePrompt: '例如：希望解除帳號關聯、恢復銷售權限',
        },
      },
    ],
  },
  {
    id: 'fba',
    label: 'FBA 物流問題',
    labelEn: 'FBA / Fulfillment Issues',
    icon: '🚚',
    subcategories: [
      {
        id: 'fba-lost-damaged',
        label: 'FBA 庫存遺失 / 損壞',
        labelEn: 'FBA Inventory Lost / Damaged',
        helpLinks: [
          { title: 'FBA 庫存賠償政策', url: 'https://sellercentral.amazon.com/help/hub/reference/G200213130', source: 'seller-central' },
        ],
        templateHints: {
          descriptionPrompt: '請描述庫存問題，例如：遺失數量、損壞情況、Shipment ID',
          actionsPrompt: '請說明已採取的措施，例如：已開過 Reimbursement Case、已提供出貨證明',
          outcomePrompt: '例如：希望獲得庫存賠償、找回遺失庫存',
        },
      },
      {
        id: 'fba-shipment',
        label: 'FBA 入倉問題',
        labelEn: 'FBA Inbound Shipment Issues',
        helpLinks: [
          { title: 'FBA 入倉要求 - Seller Central', url: 'https://sellercentral.amazon.com/help/hub/reference/G200141510', source: 'seller-central' },
        ],
        templateHints: {
          descriptionPrompt: '請描述入倉問題，例如：Shipment ID、入倉數量差異、被拒收原因',
          actionsPrompt: '請說明已採取的措施，例如：已提供 BOL、已聯繫貨代確認',
          outcomePrompt: '例如：希望更正入倉數量、重新安排入倉',
        },
      },
      {
        id: 'fba-removal',
        label: 'FBA 移除 / 退貨問題',
        labelEn: 'FBA Removal / Return Issues',
        helpLinks: [
          { title: 'FBA 移除訂單 - Seller Central', url: 'https://sellercentral.amazon.com/help/hub/reference/G200280650', source: 'seller-central' },
        ],
        templateHints: {
          descriptionPrompt: '請描述移除或退貨問題，例如：移除訂單狀態、退貨數量異常',
          actionsPrompt: '請說明已採取的措施，例如：已建立移除訂單、已檢查退貨報告',
          outcomePrompt: '例如：希望加速移除處理、釐清退貨差異',
        },
      },
    ],
  },
  {
    id: 'payment',
    label: '付款與費用問題',
    labelEn: 'Payment & Fee Issues',
    icon: '💰',
    subcategories: [
      {
        id: 'payment-disbursement',
        label: '撥款延遲 / 保留',
        labelEn: 'Disbursement Delayed / Reserve',
        helpLinks: [
          { title: '付款常見問題 - Seller Central', url: 'https://sellercentral.amazon.com/help/hub/reference/G19301', source: 'seller-central' },
        ],
        templateHints: {
          descriptionPrompt: '請描述付款問題，例如：撥款延遲多久、保留金額多少',
          actionsPrompt: '請說明已採取的措施，例如：已確認銀行帳戶正確、已聯繫客服',
          outcomePrompt: '例如：希望釋放保留款項、恢復正常撥款週期',
        },
      },
      {
        id: 'payment-fee-dispute',
        label: '費用爭議 / 多收費',
        labelEn: 'Fee Dispute / Overcharge',
        helpLinks: [
          { title: 'FBA 費用說明 - Seller Central', url: 'https://sellercentral.amazon.com/help/hub/reference/G201112670', source: 'seller-central' },
        ],
        templateHints: {
          descriptionPrompt: '請描述費用問題，例如：哪筆費用有誤、正確金額應為多少',
          actionsPrompt: '請說明已採取的措施，例如：已比對費用報告、已提供商品尺寸證明',
          outcomePrompt: '例如：希望退還多收費用、更正費用計算',
        },
      },
    ],
  },
  {
    id: 'brand',
    label: '品牌與智財權',
    labelEn: 'Brand & IP Issues',
    icon: '🛡️',
    subcategories: [
      {
        id: 'brand-registry',
        label: '品牌註冊問題',
        labelEn: 'Brand Registry Issues',
        helpLinks: [
          { title: 'Amazon Brand Registry', url: 'https://brandregistry.amazon.com/', source: 'seller-central' },
          { title: 'Brand Registry 申請教學', url: 'https://gs.amazon.com.tw/learn/seller-university?ref=as_tw_ags_footer_su', source: 'amazon-tw' },
        ],
        templateHints: {
          descriptionPrompt: '請描述品牌註冊問題，例如：申請被拒原因、驗證碼未收到',
          actionsPrompt: '請說明已採取的措施，例如：已重新提交申請、已更新商標資訊',
          outcomePrompt: '例如：希望完成品牌註冊、獲得 A+ Content 權限',
        },
      },
      {
        id: 'brand-ip-complaint',
        label: '收到智財權投訴',
        labelEn: 'IP Complaint Received',
        helpLinks: [
          { title: '智財權政策 - Seller Central', url: 'https://sellercentral.amazon.com/help/hub/reference/G201361070', source: 'seller-central' },
        ],
        templateHints: {
          descriptionPrompt: '請描述投訴情況，例如：投訴類型（商標/專利/版權）、涉及哪些 ASIN',
          actionsPrompt: '請說明已採取的措施，例如：已聯繫投訴方、已提交反通知',
          outcomePrompt: '例如：希望撤銷投訴、恢復 ASIN 銷售',
        },
      },
    ],
  },
  {
    id: 'compliance',
    label: '合規與安全',
    labelEn: 'Compliance & Safety',
    icon: '📋',
    subcategories: [
      {
        id: 'compliance-product-safety',
        label: '產品安全合規文件',
        labelEn: 'Product Safety Compliance Documents',
        helpLinks: [
          { title: '產品合規要求 - Seller Central', url: 'https://sellercentral.amazon.com/help/hub/reference/G521FMF7YC4YNRAX', source: 'seller-central' },
          { title: 'Product Safety - CE/UKCA/FCC Marking', url: 'https://sellercentral.amazon.com/help/hub/reference/G201813130', source: 'seller-central' },
        ],
        templateHints: {
          descriptionPrompt: '請描述合規問題，例如：需要哪些認證文件、被要求提供什麼證明',
          actionsPrompt: '請說明已採取的措施，例如：已取得 CE 認證、已上傳合規文件',
          outcomePrompt: '例如：希望通過合規審核、恢復商品銷售',
        },
      },
      {
        id: 'compliance-vat',
        label: 'VAT / 稅務問題',
        labelEn: 'VAT / Tax Issues',
        helpLinks: [
          { title: 'VAT 常見問題 - Seller Central', url: 'https://sellercentral.amazon.com/help/hub/reference/G201468380', source: 'seller-central' },
          { title: 'Amazon VAT Services', url: 'https://sellercentral.amazon.com/tax/registrations', source: 'seller-central' },
        ],
        templateHints: {
          descriptionPrompt: '請描述稅務問題，例如：VAT 號碼驗證失敗、稅務設定有誤',
          actionsPrompt: '請說明已採取的措施，例如：已上傳 VAT 證書、已聯繫稅務代理',
          outcomePrompt: '例如：希望完成 VAT 驗證、更正稅務設定',
        },
      },
      {
        id: 'compliance-eppr',
        label: 'EPR / 包裝法規',
        labelEn: 'EPR / Packaging Regulations',
        helpLinks: [
          { title: 'EPR 要求 - Seller Central', url: 'https://sellercentral.amazon.com/help/hub/reference/GKQM6P7BVQHMMFSC', source: 'seller-central' },
        ],
        templateHints: {
          descriptionPrompt: '請描述 EPR 問題，例如：哪個國家的 EPR 號碼有問題、註冊狀態',
          actionsPrompt: '請說明已採取的措施，例如：已完成 EPR 註冊、已上傳註冊號碼',
          outcomePrompt: '例如：希望通過 EPR 驗證、解除銷售限制',
        },
      },
    ],
  },
  {
    id: 'other',
    label: '其他問題',
    labelEn: 'Other Issues',
    icon: '❓',
    subcategories: [
      {
        id: 'other-general',
        label: '一般諮詢',
        labelEn: 'General Inquiry',
        helpLinks: [
          { title: 'Amazon 全球開店台灣', url: 'https://gs.amazon.com.tw/', source: 'amazon-tw' },
          { title: 'Seller University 教學影片', url: 'https://gs.amazon.com.tw/learn/seller-university?ref=as_tw_ags_footer_su', source: 'amazon-tw' },
          { title: 'Amazon 全球開店 YouTube', url: 'https://www.youtube.com/@amazonglobalsellingtw', source: 'youtube' },
        ],
        templateHints: {
          descriptionPrompt: '請詳細描述你遇到的問題',
          actionsPrompt: '請說明你已經嘗試過的解決方法',
          outcomePrompt: '請說明你希望得到什麼樣的協助或結果',
        },
      },
    ],
  },
];

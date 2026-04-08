import JSZip from 'jszip';
import { CaseFormData, GeneratedCase, HelpLink } from './caseWriterTypes';
import { caseCategories } from './caseCategories';

function findCategoryAndSub(categoryId: string, subcategoryId: string) {
  const cat = caseCategories.find(c => c.id === categoryId);
  const sub = cat?.subcategories.find(s => s.id === subcategoryId);
  return { cat, sub };
}

function formatAsinList(asinList: string): string {
  return asinList.split(/[,，\s]+/).filter(Boolean).join(', ');
}

/* ─── 子類別專屬的申訴策略模板 ─── */
interface AppealTemplate {
  zhOpening: (ctx: TemplateCtx) => string;
  enOpening: (ctx: TemplateCtx) => string;
  zhClosing: (ctx: TemplateCtx) => string;
  enClosing: (ctx: TemplateCtx) => string;
}

interface TemplateCtx {
  mcid: string;
  isAsin: boolean;
  asinFormatted: string;
  existingCaseId: string;
  description: string;
  actionsTaken: string;
  desiredOutcome: string;
  attachmentCount: number;
  catLabel: string;
  catLabelEn: string;
  subLabel: string;
  subLabelEn: string;
}

const defaultTemplate: AppealTemplate = {
  zhOpening: (ctx) => `致 Seller Support 團隊，您好：

我是賣家（MCID: ${ctx.mcid}），針對「${ctx.subLabel}」問題提交此案件，懇請貴團隊協助處理。

我們一直致力於為 Amazon 平台上的消費者提供優質的購物體驗，並嚴格遵守平台的各項政策與規範。然而，目前遇到以下問題，影響了我們正常的營運與服務品質，進而可能對消費者體驗造成負面影響。`,

  enOpening: (ctx) => `Dear Seller Support Team,

I am writing on behalf of Seller Account MCID: ${ctx.mcid} regarding a "${ctx.subLabelEn}" issue. We respectfully request your assistance in resolving this matter.

We are committed to providing an excellent shopping experience for Amazon customers and strictly adhere to all platform policies and guidelines. However, we are currently facing an issue that is impacting our normal operations and, consequently, the quality of service we can provide to customers.`,

  zhClosing: (ctx) => `我們理解 Amazon 平台以消費者體驗為核心的經營理念，也深知解決此問題對於維護消費者權益的重要性。上述問題若能獲得妥善處理，我們將能持續為消費者提供穩定、優質的產品與服務。

懇請 Seller Support 團隊審閱我們所提供的資料與說明，並指導我們後續應如何處理。如需任何額外資訊或文件，我們將立即配合提供。

感謝您的時間與專業協助，期待您的回覆。

此致
賣家 MCID: ${ctx.mcid}`,

  enClosing: (ctx) => `We fully understand that Amazon's marketplace is built on a customer-centric philosophy, and we recognize the importance of resolving this issue to protect customer interests. Once this matter is properly addressed, we will be able to continue delivering consistent, high-quality products and services to customers.

We respectfully request the Seller Support team to review the documentation and explanations provided, and guide us on the appropriate next steps. Should any additional information or documentation be required, we will provide it promptly.

Thank you for your time and professional assistance. We look forward to your response.

Best regards,
Seller MCID: ${ctx.mcid}`,
};

const subcategoryTemplates: Record<string, AppealTemplate> = {
  'listing-suppressed': {
    zhOpening: (ctx) => `致 Seller Support 團隊，您好：

我是賣家（MCID: ${ctx.mcid}），我的商品 Listing 目前處於被抑制/下架狀態，嚴重影響了消費者的購買體驗與我們的正常營運。

我們深知 Amazon 對商品品質與 Listing 合規性的高標準要求，這些標準的存在正是為了保障消費者能獲得準確的商品資訊與良好的購物體驗。我們完全支持這些政策，並已針對問題進行了全面的檢視與改善。`,

    enOpening: (ctx) => `Dear Seller Support Team,

I am writing regarding Seller Account MCID: ${ctx.mcid}. Our product listing(s) are currently suppressed/deactivated, which is significantly impacting the customer shopping experience and our normal business operations.

We fully understand and support Amazon's high standards for product quality and listing compliance, as these standards exist to ensure customers receive accurate product information and an excellent shopping experience. We have conducted a thorough review and implemented improvements to address the issue.`,

    zhClosing: (ctx) => `恢復 Listing 後，消費者將能正常瀏覽並購買我們的商品，我們也將持續監控 Listing 品質，確保所有商品資訊的準確性與合規性，為消費者提供最佳的購物體驗。

懇請 Seller Support 團隊審閱我們的改善措施與佐證資料，協助恢復 Listing 的正常狀態。如需任何補充資料，我們將立即提供。

感謝您的協助。

此致
賣家 MCID: ${ctx.mcid}`,

    enClosing: (ctx) => `Once the listing is reinstated, customers will be able to browse and purchase our products normally. We will continue to monitor listing quality and ensure the accuracy and compliance of all product information to provide customers with the best possible shopping experience.

We respectfully request the Seller Support team to review our corrective actions and supporting documentation, and assist in restoring the listing to active status. Should any additional materials be needed, we will provide them immediately.

Thank you for your assistance.

Best regards,
Seller MCID: ${ctx.mcid}`,
  },

  'account-suspended': {
    zhOpening: (ctx) => `致 Seller Support 團隊，您好：

我是賣家（MCID: ${ctx.mcid}），我的帳號目前處於停權/審核狀態。我對此問題高度重視，並已深入分析問題根因，制定了全面的改善行動計畫（Plan of Action）。

我們充分理解 Amazon 對賣家帳號健康度的嚴格要求，這些標準的目的是確保每一位消費者都能在安全、可信賴的環境中購物。我們完全認同這一理念，並已採取具體措施來解決問題。`,

    enOpening: (ctx) => `Dear Seller Support Team,

I am writing regarding Seller Account MCID: ${ctx.mcid}, which is currently suspended/under review. We take this matter very seriously and have conducted a thorough root cause analysis, developing a comprehensive Plan of Action (POA) to address the issues identified.

We fully understand Amazon's stringent requirements for seller account health, which exist to ensure every customer can shop in a safe and trustworthy environment. We wholeheartedly support this philosophy and have taken concrete steps to resolve the issues.`,

    zhClosing: (ctx) => `我們承諾在帳號恢復後，將持續嚴格遵守 Amazon 的所有政策與準則，定期檢視帳號健康指標，確保為消費者提供卓越的購物體驗。我們已建立內部監控機制，防止類似問題再次發生。

懇請 Seller Support 團隊審閱我們的行動計畫與佐證資料，給予我們恢復帳號的機會。我們已做好充分準備，隨時配合提供任何額外所需的資訊。

感謝您的時間與考量。

此致
賣家 MCID: ${ctx.mcid}`,

    enClosing: (ctx) => `We commit to strictly adhering to all Amazon policies and guidelines upon account reinstatement. We will regularly review account health metrics and ensure an outstanding shopping experience for customers. We have established internal monitoring mechanisms to prevent similar issues from recurring.

We respectfully request the Seller Support team to review our Plan of Action and supporting documentation, and grant us the opportunity to reinstate our account. We are fully prepared to provide any additional information that may be required.

Thank you for your time and consideration.

Best regards,
Seller MCID: ${ctx.mcid}`,
  },

  'fba-lost-damaged': {
    zhOpening: (ctx) => `致 Seller Support 團隊，您好：

我是賣家（MCID: ${ctx.mcid}），就 FBA 倉庫中的庫存遺失/損壞問題提交此案件。此問題不僅影響我們的庫存管理與營運效率，也直接影響了消費者能否及時收到商品。

根據 Amazon FBA 庫存賠償政策，當庫存在 Amazon 倉庫中遺失或損壞時，賣家有權申請合理的賠償。我們已詳細核對了庫存記錄，確認以下差異確實存在。`,

    enOpening: (ctx) => `Dear Seller Support Team,

I am writing regarding Seller Account MCID: ${ctx.mcid} to report an FBA inventory lost/damaged issue. This matter not only affects our inventory management and operational efficiency but also directly impacts customers' ability to receive their orders in a timely manner.

In accordance with Amazon's FBA Inventory Reimbursement Policy, sellers are entitled to reasonable reimbursement when inventory is lost or damaged within Amazon's fulfillment centers. We have thoroughly reconciled our inventory records and confirmed the following discrepancies.`,

    zhClosing: (ctx) => `妥善處理此庫存問題將確保我們能維持充足的庫存水位，讓消費者能持續享有快速、可靠的配送服務。我們已提供完整的出貨記錄與庫存對帳資料作為佐證。

懇請 Seller Support 團隊依據 FBA 庫存賠償政策審閱此案件，並協助處理合理的賠償。如需任何額外的出貨證明或文件，我們將立即提供。

感謝您的協助。

此致
賣家 MCID: ${ctx.mcid}`,

    enClosing: (ctx) => `Properly resolving this inventory issue will ensure we can maintain adequate stock levels, allowing customers to continue enjoying fast and reliable delivery service. We have provided complete shipping records and inventory reconciliation data as supporting evidence.

We respectfully request the Seller Support team to review this case in accordance with the FBA Inventory Reimbursement Policy and process the appropriate reimbursement. Should any additional shipping documentation be required, we will provide it immediately.

Thank you for your assistance.

Best regards,
Seller MCID: ${ctx.mcid}`,
  },

  'brand-ip-complaint': {
    zhOpening: (ctx) => `致 Seller Support 團隊，您好：

我是賣家（MCID: ${ctx.mcid}），我們收到了一項智慧財產權投訴，對此我們高度重視並已進行詳細的調查與回應準備。

我們始終尊重智慧財產權，並嚴格確保所有銷售的商品均為正品且具有合法的銷售授權。針對此次投訴，我們已仔細審查了相關商品的來源、授權文件及合規性。`,

    enOpening: (ctx) => `Dear Seller Support Team,

I am writing regarding Seller Account MCID: ${ctx.mcid}. We have received an intellectual property complaint, which we take very seriously. We have conducted a detailed investigation and prepared a comprehensive response.

We have always respected intellectual property rights and strictly ensure that all products we sell are authentic and backed by legitimate sales authorization. In response to this complaint, we have carefully reviewed the sourcing, authorization documentation, and compliance of the products in question.`,

    zhClosing: (ctx) => `解決此智財權問題將確保消費者能繼續購買到正品商品，維護消費者的權益與信任。我們已提供完整的授權文件與商品來源證明作為佐證。

懇請 Seller Support 團隊審閱我們的回應與佐證資料，協助撤銷此投訴或指導我們後續的處理步驟。我們願意全力配合任何進一步的調查。

感謝您的協助。

此致
賣家 MCID: ${ctx.mcid}`,

    enClosing: (ctx) => `Resolving this IP issue will ensure customers can continue to purchase authentic products, protecting their rights and trust. We have provided complete authorization documents and product sourcing evidence for your review.

We respectfully request the Seller Support team to review our response and supporting documentation, and assist in retracting this complaint or guide us on the appropriate next steps. We are fully prepared to cooperate with any further investigation.

Thank you for your assistance.

Best regards,
Seller MCID: ${ctx.mcid}`,
  },

  'compliance-product-safety': {
    zhOpening: (ctx) => `致 Seller Support 團隊，您好：

我是賣家（MCID: ${ctx.mcid}），就產品安全合規文件的相關問題提交此案件。我們深知產品安全是保障消費者權益的最基本要求，也是 Amazon 平台最重視的核心標準之一。

我們的商品已通過相關的安全認證與測試，並持有有效的合規文件。以下提供詳細的合規狀態說明與佐證資料。`,

    enOpening: (ctx) => `Dear Seller Support Team,

I am writing regarding Seller Account MCID: ${ctx.mcid} about a product safety compliance documentation matter. We fully understand that product safety is the most fundamental requirement for protecting customer interests and one of Amazon's core standards.

Our products have passed the relevant safety certifications and testing, and we hold valid compliance documentation. Below we provide a detailed explanation of our compliance status along with supporting evidence.`,

    zhClosing: (ctx) => `確保產品安全合規不僅是法規要求，更是我們對每一位消費者的承諾。我們已提供完整的認證文件與測試報告，證明我們的商品符合所有適用的安全標準。

懇請 Seller Support 團隊審閱我們的合規文件，協助通過審核並恢復商品的正常銷售。如需任何額外的認證文件或測試報告，我們將立即提供。

感謝您的協助。

此致
賣家 MCID: ${ctx.mcid}`,

    enClosing: (ctx) => `Ensuring product safety compliance is not only a regulatory requirement but also our commitment to every customer. We have provided complete certification documents and test reports demonstrating that our products meet all applicable safety standards.

We respectfully request the Seller Support team to review our compliance documentation, assist in passing the review, and restore normal sales status for our products. Should any additional certification documents or test reports be required, we will provide them immediately.

Thank you for your assistance.

Best regards,
Seller MCID: ${ctx.mcid}`,
  },
};

/* ─── 核心生成函式 ─── */
function getTemplate(subcategoryId: string): AppealTemplate {
  return subcategoryTemplates[subcategoryId] ?? defaultTemplate;
}

function buildBody(
  lang: 'zh' | 'en',
  template: AppealTemplate,
  ctx: TemplateCtx,
): string {
  const opening = lang === 'zh' ? template.zhOpening(ctx) : template.enOpening(ctx);
  const closing = lang === 'zh' ? template.zhClosing(ctx) : template.enClosing(ctx);

  const hasCase = ctx.existingCaseId.trim() !== '';
  const divider = '━━━━━━━━━━━━━━━━━━━━━━━━';

  let body = opening + '\n\n';

  if (hasCase) {
    if (lang === 'zh') {
      body += `📌 相關案件編號：${ctx.existingCaseId}\n`;
      body += `此問題先前已開立案件但尚未獲得妥善解決，故再次提交以尋求進一步的專業協助。\n\n`;
    } else {
      body += `📌 Related Case ID: ${ctx.existingCaseId}\n`;
      body += `This issue was previously reported but has not yet been adequately resolved. We are following up to seek further professional assistance.\n\n`;
    }
  }

  // 案件摘要區塊
  body += `${divider}\n`;
  if (lang === 'zh') {
    body += `📋 問題分類：${ctx.catLabel} > ${ctx.subLabel}\n`;
    body += ctx.isAsin ? `📦 相關 ASIN：${ctx.asinFormatted}\n` : `👤 問題範圍：帳號層級\n`;
  } else {
    body += `📋 Issue Category: ${ctx.catLabelEn} > ${ctx.subLabelEn}\n`;
    body += ctx.isAsin ? `📦 Related ASIN(s): ${ctx.asinFormatted}\n` : `👤 Scope: Account-level issue\n`;
  }
  body += `${divider}\n\n`;

  // 問題描述 — 融入賣家原文
  if (lang === 'zh') {
    body += `一、問題說明\n\n`;
    body += `${ctx.description}\n\n`;
    body += `二、已採取的改善措施\n\n`;
    body += `針對上述問題，我們已積極採取以下具體改善措施：\n\n`;
    body += `${ctx.actionsTaken}\n\n`;
    body += `三、期望的處理結果\n\n`;
    body += `基於以上說明與改善措施，我們懇請 Seller Support 團隊協助達成以下結果：\n\n`;
    body += `${ctx.desiredOutcome}\n\n`;
  } else {
    body += `I. Issue Description\n\n`;
    body += `${ctx.description}\n\n`;
    body += `II. Corrective Actions Taken\n\n`;
    body += `To address the above issue, we have proactively implemented the following specific corrective measures:\n\n`;
    body += `${ctx.actionsTaken}\n\n`;
    body += `III. Desired Resolution\n\n`;
    body += `Based on the above explanation and corrective actions, we respectfully request the Seller Support team to assist in achieving the following outcome:\n\n`;
    body += `${ctx.desiredOutcome}\n\n`;
  }

  // 附件說明
  if (ctx.attachmentCount > 0) {
    if (lang === 'zh') {
      body += `📎 佐證資料：已附上 ${ctx.attachmentCount} 個相關檔案，包含截圖、文件等佐證資料，請參閱。\n\n`;
    } else {
      body += `📎 Supporting Evidence: ${ctx.attachmentCount} supporting file(s) have been attached, including screenshots and relevant documentation for your reference.\n\n`;
    }
  }

  body += closing;
  return body;
}

export interface TranslatedFields {
  description: string;
  actionsTaken: string;
  desiredOutcome: string;
}

export function generateCase(form: CaseFormData, translatedEn?: TranslatedFields): GeneratedCase {
  const { cat, sub } = findCategoryAndSub(form.category, form.subcategory);
  const helpLinks: HelpLink[] = sub?.helpLinks ?? [];

  // 中文版 context — 使用賣家原始輸入
  const zhCtx: TemplateCtx = {
    mcid: form.mcid,
    isAsin: form.issueScope === 'asin',
    asinFormatted: form.issueScope === 'asin' ? formatAsinList(form.asinList) : '',
    existingCaseId: form.existingCaseId,
    description: form.description,
    actionsTaken: form.actionsTaken,
    desiredOutcome: form.desiredOutcome,
    attachmentCount: form.attachments.length,
    catLabel: cat?.label ?? '其他問題',
    catLabelEn: cat?.labelEn ?? 'Other Issues',
    subLabel: sub?.label ?? '',
    subLabelEn: sub?.labelEn ?? '',
  };

  // 英文版 context — 使用翻譯後的內容（若有），否則用原文
  const enCtx: TemplateCtx = {
    ...zhCtx,
    description: translatedEn?.description ?? form.description,
    actionsTaken: translatedEn?.actionsTaken ?? form.actionsTaken,
    desiredOutcome: translatedEn?.desiredOutcome ?? form.desiredOutcome,
  };

  const template = getTemplate(form.subcategory);

  const zhTitle = `[${zhCtx.catLabel}] ${zhCtx.subLabel} - MCID: ${form.mcid}`;
  const enTitle = `[${zhCtx.catLabelEn}] ${zhCtx.subLabelEn} - MCID: ${form.mcid}`;
  const zhBody = buildBody('zh', template, zhCtx);
  const enBody = buildBody('en', template, enCtx);

  return { zhTitle, enTitle, zhBody, enBody, helpLinks };
}

/* ─── 匯出功能 ─── */
function buildCaseText(generated: GeneratedCase, form: CaseFormData): string {
  let output = '';
  output += `${'='.repeat(60)}\n`;
  output += `  Amazon Seller Support Case\n`;
  output += `  Generated: ${new Date().toLocaleString('zh-TW')}\n`;
  output += `${'='.repeat(60)}\n\n`;

  output += `${'─'.repeat(60)}\n`;
  output += `  中文版 (Chinese Version)\n`;
  output += `${'─'.repeat(60)}\n\n`;
  output += `主旨：${generated.zhTitle}\n\n`;
  output += generated.zhBody;
  output += `\n\n`;

  output += `${'─'.repeat(60)}\n`;
  output += `  英文版 (English Version)\n`;
  output += `${'─'.repeat(60)}\n\n`;
  output += `Subject: ${generated.enTitle}\n\n`;
  output += generated.enBody;
  output += `\n\n`;

  if (generated.helpLinks.length > 0) {
    output += `${'─'.repeat(60)}\n`;
    output += `  參考資源 (Reference Links)\n`;
    output += `${'─'.repeat(60)}\n\n`;
    generated.helpLinks.forEach((link, i) => {
      output += `${i + 1}. ${link.title}\n   ${link.url}\n\n`;
    });
  }

  if (form.attachments.length > 0) {
    output += `${'─'.repeat(60)}\n`;
    output += `  附件清單 (Attachments)\n`;
    output += `${'─'.repeat(60)}\n\n`;
    form.attachments.forEach((att, i) => {
      output += `${i + 1}. ${att.name} (${(att.size / 1024).toFixed(1)} KB)\n`;
    });
  }

  return output;
}

/** 無附件時匯出純文字，有附件時匯出 ZIP */
export async function exportCase(
  generated: GeneratedCase,
  form: CaseFormData,
): Promise<void> {
  const caseText = buildCaseText(generated, form);
  const timestamp = Date.now();
  const prefix = `case-${form.mcid}-${timestamp}`;

  if (form.attachments.length === 0) {
    // 純文字匯出
    const blob = new Blob([caseText], { type: 'text/plain;charset=utf-8' });
    downloadBlob(blob, `${prefix}.txt`);
    return;
  }

  // ZIP 匯出：Case 文字 + 所有附件
  const zip = new JSZip();
  zip.file(`${prefix}.txt`, caseText);

  const attachFolder = zip.folder('attachments');
  for (const att of form.attachments) {
    if (att.dataUrl && attachFolder) {
      const base64Data = att.dataUrl.split(',')[1];
      if (base64Data) {
        attachFolder.file(att.name, base64Data, { base64: true });
      }
    }
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  downloadBlob(zipBlob, `${prefix}.zip`);
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** Case Writer 工具的型別定義 */

export interface CaseFormData {
  mcid: string;
  issueScope: 'account' | 'asin';
  asinList: string;
  existingCaseId: string;
  category: string;
  subcategory: string;
  description: string;
  actionsTaken: string;
  desiredOutcome: string;
  attachments: AttachmentFile[];
}

export interface AttachmentFile {
  id: string;
  name: string;
  type: string;
  size: number;
  dataUrl: string;       // base64 data URL for all files (used for ZIP export)
  preview?: string;      // same as dataUrl for images, undefined for non-images
}

export interface CaseCategory {
  id: string;
  label: string;
  labelEn: string;
  icon: string;
  subcategories: CaseSubcategory[];
}

export interface CaseSubcategory {
  id: string;
  label: string;
  labelEn: string;
  helpLinks: HelpLink[];
  templateHints: TemplateHints;
}

export interface HelpLink {
  title: string;
  url: string;
  source: 'seller-central' | 'seller-university' | 'amazon-tw' | 'youtube' | 'other';
}

export interface TemplateHints {
  descriptionPrompt: string;
  actionsPrompt: string;
  outcomePrompt: string;
}

export interface GeneratedCase {
  zhTitle: string;
  enTitle: string;
  zhBody: string;
  enBody: string;
  helpLinks: HelpLink[];
}

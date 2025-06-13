// SNSシェア用テンプレート設定
export interface ShareTemplate {
  platform: 'twitter' | 'line' | 'instagram' | 'tiktok' | 'general';
  freeTemplate: string; // 無料版テンプレート（ハッシュタグ・リンク強制）
  proTemplate: string;  // Pro版テンプレート（カスタマイズ可能）
}

export const SHARE_TEMPLATES: ShareTemplate[] = [
  {
    platform: 'twitter',
    freeTemplate: `{text}

#AI文章変換 #RephraseMaster #文章術 #言葉遊び

AIで文章を様々なスタイルに変換↓
https://rephrase-master.com`,
    proTemplate: `{text}`
  },
  {
    platform: 'line',
    freeTemplate: `{text}

AIで文章を様々なスタイルに変換できるよ！
https://rephrase-master.com`,
    proTemplate: `{text}`
  },
  {
    platform: 'instagram',
    freeTemplate: `{text}

#AI文章変換 #RephraseMaster #文章術 #言葉遊び #クリエイティブ #文章力アップ

AIで文章を様々なスタイルに変換↓
https://rephrase-master.com`,
    proTemplate: `{text}`
  },
  {
    platform: 'tiktok',
    freeTemplate: `{text}

#AI文章変換 #RephraseMaster #文章術 #言葉遊び #TikTok #バズる

AIで文章を様々なスタイルに変換↓
https://rephrase-master.com`,
    proTemplate: `{text}`
  },
  {
    platform: 'general',
    freeTemplate: `{text}

AIで文章を様々なスタイルに変換！
https://rephrase-master.com`,
    proTemplate: `{text}`
  }
];

// デフォルトのハッシュタグ設定
export const DEFAULT_HASHTAGS = {
  twitter: ['#AI文章変換', '#RephraseMaster', '#文章術', '#言葉遊び'],
  instagram: ['#AI文章変換', '#RephraseMaster', '#文章術', '#言葉遊び', '#クリエイティブ', '#文章力アップ'],
  tiktok: ['#AI文章変換', '#RephraseMaster', '#文章術', '#言葉遊び', '#TikTok', '#バズる'],
  line: [],
  general: ['#AI文章変換', '#RephraseMaster']
};

// デフォルトのリンク設定
export const DEFAULT_LINK = 'https://rephrase-master.com';

// テンプレートを取得
export const getShareTemplate = (
  platform: ShareTemplate['platform'], 
  isPro: boolean = false
): string => {
  const template = SHARE_TEMPLATES.find(t => t.platform === platform);
  if (!template) {
    const generalTemplate = SHARE_TEMPLATES.find(t => t.platform === 'general')!;
    return isPro ? generalTemplate.proTemplate : generalTemplate.freeTemplate;
  }
  return isPro ? template.proTemplate : template.freeTemplate;
};
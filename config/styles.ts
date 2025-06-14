// スタイル設定の中央管理
export interface RephraseStyle {
  id: string;
  name: string;
  description: string;
  emoji: string;
  color: string;
  prompt: string;
  category?: 'popular' | 'creative' | 'business' | 'fun';
  isLimited?: boolean; // 期間限定フラグ
  limitEndDate?: Date; // 期間限定終了日
}

// スタイル一覧（将来的に追加・変更しやすい構造）
export const REPHRASE_STYLES: RephraseStyle[] = [
  {
    id: 'meigen',
    name: '名言風',
    description: '深く響く名言のように',
    emoji: '💭',
    color: '#8B5CF6',
    prompt: '以下の文章を、深く心に響く名言のような表現に言い換えてください。哲学的で印象的な言葉遣いを使用してください。',
    category: 'popular'
  },
  {
    id: 'yawaraka',
    name: '柔らかい文章',
    description: '優しく温かい表現',
    emoji: '🌸',
    color: '#F472B6',
    prompt: '以下の文章を、優しく温かみのある柔らかい表現に言い換えてください。読み手に安心感を与える丁寧で親しみやすい言葉遣いを使用してください。',
    category: 'popular'
  },
  {
    id: 'catchcopy',
    name: 'キャッチコピー風',
    description: '印象的で覚えやすく',
    emoji: '✨',
    color: '#F59E0B',
    prompt: '以下の文章を、印象的で覚えやすいキャッチコピー風に言い換えてください。短くて響きの良い、商品やサービスの宣伝文句のような表現を使用してください。',
    category: 'business'
  },
  {
    id: 'sns',
    name: 'SNS投稿向け',
    description: 'バズりやすい投稿文',
    emoji: '📱',
    color: '#06B6D4',
    prompt: '以下の文章を、SNSでバズりやすい投稿文に言い換えてください。親しみやすく、シェアしたくなるような魅力的な表現を使用してください。',
    category: 'popular'
  },
  {
    id: 'kousekou',
    name: '文章校正',
    description: '正確で読みやすく',
    emoji: '📝',
    color: '#059669',
    prompt: '以下の文章を、より正確で読みやすく校正してください。文法の誤りを修正し、より自然で分かりやすい表現に整えてください。',
    category: 'business'
  },
  {
    id: 'menhera',
    name: 'メンヘラ風',
    description: '繊細で感情的な表現',
    emoji: '🥺',
    color: '#EC4899',
    prompt: '以下の文章を、感情的で繊細な、メンヘラ風の表現に言い換えてください。不安定で脆い感情を表現してください。',
    category: 'fun'
  },
  {
    id: 'chuunibyou',
    name: '厨二病風',
    description: '中二病的でカッコイイ',
    emoji: '⚡',
    color: '#6366F1',
    prompt: '以下の文章を、中二病的でカッコイイ表現に言い換えてください。厨二病らしい大げさで壮大な言葉遣いを使用してください。',
    category: 'fun'
  },
  {
    id: 'keigo',
    name: '敬語風',
    description: '丁寧で上品な表現',
    emoji: '🙏',
    color: '#1F2937',
    prompt: '以下の文章を、丁寧で上品な敬語表現に言い換えてください。ビジネスシーンで使えるような丁寧語を使用してください。',
    category: 'business'
  },
  // 将来追加予定のスタイル（準備）
  {
    id: 'iminsin-sukebe',
    name: '意味深スケベ風',
    description: '普通の言葉なのに、なぜかちょっと意味深に聞こえる…',
    emoji: '😏',
    color: '#FF6B9D',
    prompt: '以下の文章を、直接的ではないが意味深で少しスケベな響きを持つ表現に言い換えてください。品を保ちながらも、読み手がドキッとするような言葉遣いを使用してください。',
    category: 'fun',
    isLimited: true,
    limitEndDate: new Date('2024-12-31'), // 例：年末まで限定
  }
];

// スタイルIDからスタイル情報を取得
export const getStyleById = (id: string): RephraseStyle | undefined => {
  return REPHRASE_STYLES.find(style => style.id === id);
};

// カテゴリー別にスタイルを取得
export const getStylesByCategory = (category: RephraseStyle['category']) => {
  return REPHRASE_STYLES.filter(style => style.category === category);
};

// 期間限定スタイルをフィルタリング
export const getActiveStyles = (): RephraseStyle[] => {
  const now = new Date();
  return REPHRASE_STYLES.filter(style => {
    if (!style.isLimited) return true;
    if (!style.limitEndDate) return true;
    return now < style.limitEndDate;
  });
};
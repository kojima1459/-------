// スタイル設定の中央管理
export interface RephraseStyle {
  id: string;
  name: string;
  description: string;
  emoji: string;
  color: string;
  prompt: string;
  category?: 'popular' | 'creative' | 'business' | 'fun' | 'pro';
  isLimited?: boolean; // 期間限定フラグ
  limitEndDate?: Date; // 期間限定終了日
  isPro?: boolean; // Pro版限定フラグ
}

// スタイル一覧（将来的に追加・変更しやすい構造）
export const REPHRASE_STYLES: RephraseStyle[] = [
  // === 人気・定番スタイル ===
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
    id: 'sns',
    name: 'SNS投稿向け',
    description: 'バズりやすい投稿文',
    emoji: '📱',
    color: '#06B6D4',
    prompt: '以下の文章を、SNSでバズりやすい投稿文に言い換えてください。親しみやすく、シェアしたくなるような魅力的な表現を使用してください。',
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

  // === 文学・作家風スタイル ===
  {
    id: 'murakami',
    name: '村上春樹風',
    description: 'やたら余白の多い静謐な文体＋ポエム感',
    emoji: '📚',
    color: '#059669',
    prompt: '以下の文章を、村上春樹風の独特な文体に言い換えてください。静謐で詩的、やや哲学的で余白のある表現を使用してください。',
    category: 'creative'
  },
  {
    id: 'haiku',
    name: '俳句風',
    description: '5.7.5のリズムで即席俳句化',
    emoji: '🍃',
    color: '#0D9488',
    prompt: '以下の文章を、俳句の5-7-5音律に従って俳句風に言い換えてください。季語や自然の美しさを感じられる表現を心がけてください。',
    category: 'creative'
  },

  // === 政治・社会風スタイル ===
  {
    id: 'koizumi',
    name: '小泉進次郎風',
    description: '言ってるようで何も言っていない政治的レトリック風',
    emoji: '🗣️',
    color: '#DC2626',
    prompt: '以下の文章を、小泉進次郎風の政治的レトリックに言い換えてください。言ってるようで何も言っていない、でも何か深そうに聞こえる表現を使用してください。',
    category: 'fun'
  },
  {
    id: 'politician',
    name: '政治家会見風',
    description: '「責任は重く受け止めております」的な言い回しの記者会見風',
    emoji: '📺',
    color: '#1F2937',
    prompt: '以下の文章を、政治家の記者会見風に言い換えてください。「責任は重く受け止めております」のような定型的で回りくどい表現を使用してください。',
    category: 'fun'
  },

  // === ネット・SNS文化スタイル ===
  {
    id: 'mbot',
    name: 'エムbot風',
    description: 'SNSで流行る「意味深そうで意味がない」ポエム風',
    emoji: '🤖',
    color: '#EC4899',
    prompt: '以下の文章を、エムbot風の意味深そうで意味がないポエム風に言い換えてください。SNSで見かける謎めいた短文風の表現を使用してください。',
    category: 'fun'
  },

  // === 技術・専門職風スタイル ===
  {
    id: 'engineer',
    name: 'エンジニア風',
    description: '技術者特有の比喩／カタカナ語／謎の省略語混じりで言い換え',
    emoji: '💻',
    color: '#6366F1',
    prompt: '以下の文章を、エンジニア風の技術的な表現に言い換えてください。プログラミング用語や技術的な比喩、カタカナ語を多用した表現を使用してください。',
    category: 'creative'
  },
  {
    id: 'psychologist',
    name: 'サイコロジカルアナリスト風',
    description: '占い師／心理カウンセラー風に意味深なコメント化',
    emoji: '🔮',
    color: '#7C3AED',
    prompt: '以下の文章を、心理カウンセラーや占い師風の意味深な分析コメントに言い換えてください。深層心理や潜在意識に言及する表現を使用してください。',
    category: 'creative'
  },

  // === 言語学・暗号スタイル ===
  {
    id: 'rare-language',
    name: '珍しい言語風',
    description: '架空言語風／エスペラント／ラテン語風／古英語風／エルフ語風など',
    emoji: '🌍',
    color: '#059669',
    prompt: '以下の文章を、珍しい言語や古代語風に言い換えてください。ラテン語、古英語、エスペラント、または架空言語風の表現を使用してください。',
    category: 'creative'
  },
  {
    id: 'cipher',
    name: '暗号風',
    description: 'ROT13／モールス信号／謎の記号混じりで出力',
    emoji: '🔐',
    color: '#1F2937',
    prompt: '以下の文章を、暗号風に言い換えてください。モールス信号、ROT13、または謎の記号を混ぜた暗号のような表現を使用してください。',
    category: 'creative'
  },
  {
    id: 'runic',
    name: 'ルーン文字風',
    description: '視覚的に映える古代風ルーン文字化',
    emoji: '⚡',
    color: '#92400E',
    prompt: '以下の文章を、古代ルーン文字風の神秘的な表現に言い換えてください。古代の魔法や神話を感じさせる荘厳な言葉遣いを使用してください。',
    category: 'creative'
  },

  // === ビジネス・フォーマルスタイル ===
  {
    id: 'keigo',
    name: '敬語風',
    description: '丁寧で上品な表現',
    emoji: '🙏',
    color: '#1F2937',
    prompt: '以下の文章を、丁寧で上品な敬語表現に言い換えてください。ビジネスシーンで使えるような丁寧語を使用してください。',
    category: 'business'
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

  // === 特殊・個性的スタイル ===
  {
    id: 'asd',
    name: 'ASD風',
    description: 'ASD的独特な言語選択／主観的な観察のズレを出す',
    emoji: '🧩',
    color: '#7C3AED',
    prompt: '以下の文章を、ASD的な独特な観点から言い換えてください。細部への注目や独特な言語選択、主観的な観察を含む表現を使用してください。',
    category: 'creative'
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

  // === Pro版限定スタイル（仮実装） ===
  {
    id: 'iminsin-sukebe',
    name: '意味深スケベ風',
    description: '普通の言葉なのに、なぜかちょっと意味深に聞こえる…',
    emoji: '😏',
    color: '#FF6B9D',
    prompt: '以下の文章を、直接的ではないが意味深で少しスケベな響きを持つ表現に言い換えてください。品を保ちながらも、読み手がドキッとするような言葉遣いを使用してください。',
    category: 'pro',
    isPro: true,
    isLimited: true,
    limitEndDate: new Date('2024-12-31'),
  },
  {
    id: 'pro-premium',
    name: 'プレミアム変換',
    description: 'Pro版限定の特別な変換スタイル',
    emoji: '👑',
    color: '#F59E0B',
    prompt: '以下の文章を、最高級の文章表現に言い換えてください。洗練された語彙と美しい文体を使用して、読み手を魅了する文章に仕上げてください。',
    category: 'pro',
    isPro: true,
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
export const getActiveStyles = (isPro: boolean = false): RephraseStyle[] => {
  const now = new Date();
  return REPHRASE_STYLES.filter(style => {
    // Pro版限定スタイルの表示制御
    if (style.isPro && !isPro) return false;
    
    // 期間限定チェック
    if (!style.isLimited) return true;
    if (!style.limitEndDate) return true;
    return now < style.limitEndDate;
  });
};

// Pro版限定スタイルのみ取得
export const getProStyles = (): RephraseStyle[] => {
  return REPHRASE_STYLES.filter(style => style.isPro);
};
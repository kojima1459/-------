// スタイル設定の中央管理
export interface RephraseStyle {
  id: string;
  name: string;
  description: string;
  emoji: string;
  color: string;
  prompt: string;
  category?: 'popular' | 'creative' | 'business' | 'fun' | 'pro' | 'political' | 'literary' | 'social' | 'tech';
  isLimited?: boolean; // 期間限定フラグ
  limitEndDate?: Date; // 期間限定終了日
  isPro?: boolean; // Pro版限定フラグ
  priority?: number; // 表示優先順位
}

// スタイル一覧（16種の新スタイル + 既存スタイル統合）
export const REPHRASE_STYLES: RephraseStyle[] = [
  // === 🔥 新実装16スタイル（優先順位順） ===
  
  // 1. 小泉進次郎風
  {
    id: 'koizumi-shinjiro',
    name: '小泉進次郎風',
    description: '言ってるようで何も言っていない政治的レトリック',
    emoji: '🗣️',
    color: '#DC2626',
    prompt: `以下の文章を、小泉進次郎氏のように「言っているようで言っていない」ような言い回しで変換してください。
特徴的な構造：循環論法、抽象的な確信、言葉の言及、メタ発言、そして感情的断言。
最重要：聞いてる間に「なんか言ってる」感、読後「何も言ってない」感が共存していること。`,
    category: 'political',
    priority: 1
  },
  
  // 2. 岸田元首相風
  {
    id: 'kishida',
    name: '岸田元首相風',
    description: '丁寧に検討を進める方向で真摯に対応',
    emoji: '📺',
    color: '#1F2937',
    prompt: `以下の文章を、岸田文雄元首相のような「検討を加味した上で丁寧に前向きな姿勢を示す」言い回しに変換してください。
内容は曖昧で構いません。あくまで誠実そうで、何も断定しない文体にしてください。
使ってほしい語彙：「丁寧に」「慎重に」「検討を進める方向で」「真摯に」「今後とも」「検討を加速する」「対応」`,
    category: 'political',
    priority: 2
  },
  
  // 3. 村上春樹風
  {
    id: 'murakami-haruki',
    name: '村上春樹風',
    description: '静謐で詩的、やや哲学的で余白のある文体',
    emoji: '📚',
    color: '#059669',
    prompt: `以下の文章を、村上春樹風の文体に変換してください。
静謐なリズム感、内省的な独白、不思議な比喩、そして日常への淡い違和感を含めてください。
擬人化や抽象的時間表現、「なぜか」「ふと」といった曖昧な表現も歓迎です。`,
    category: 'literary',
    priority: 3
  },
  
  // 4. 意味深スケベ風
  {
    id: 'iminsin-sukebe',
    name: '意味深スケベ風',
    description: '健全なのに、なぜか少し色っぽく意味深に...',
    emoji: '😏',
    color: '#FF6B9D',
    prompt: `以下の文章を、健全な内容のまま、なぜか少し色っぽく、意味深に感じるように変換してください。
直接的な表現は禁止。あくまで行間と雰囲気で"感じさせる"ようにしてください。`,
    category: 'pro',
    isPro: true,
    priority: 4
  },
  
  // 5. 哲学者風
  {
    id: 'philosopher',
    name: '哲学者風',
    description: '「そもそも」から始まる抽象的思考',
    emoji: '🤔',
    color: '#7C3AED',
    prompt: `以下の文章を、哲学的思考を感じさせるスタイルに変換してください。
「そもそも」から始まり、抽象的・概念的な表現を多く含み、論理のようで論理でない深さを演出してください。
語彙例：「存在」「意味」「不可逆性」「問い」「構造」「解釈」など。`,
    category: 'creative',
    priority: 5
  },
  
  // 6. 名言風（中身なし）
  {
    id: 'meigen-empty',
    name: '名言風',
    description: '何となく名言っぽいリズムと余韻',
    emoji: '💭',
    color: '#8B5CF6',
    prompt: `以下の文章を、何となく名言っぽいリズムと余韻で変換してください。
内容の深さは不要です。「それっぽくて刺さりそう」という印象が出るようにしてください。
「〜とは、○○である」など断定文も歓迎。`,
    category: 'popular',
    priority: 6
  },
  
  // 7. 関西弁風
  {
    id: 'kansai-ben',
    name: '関西弁風',
    description: 'ウィットとツッコミを感じさせるテンポ',
    emoji: '🥢',
    color: '#F59E0B',
    prompt: `以下の文章を、関西弁で少し笑えるような、テンポのある感じに言い換えてください。
ウィットとツッコミを感じさせる自然な文体で、堅すぎないように注意してください。`,
    category: 'fun',
    priority: 7
  },
  
  // 8. エンジニア風（業界ノリ）
  {
    id: 'engineer-meme',
    name: 'エンジニア風',
    description: 'HTTPステータスコード混じりのテック業界ノリ',
    emoji: '💻',
    color: '#6366F1',
    prompt: `以下の文章を、テック業界のミームっぽいノリで変換してください。
HTTPステータスコード、CLI表現、システムエラー風の語彙などを使用してください。
例：「感情404 Not Found」「仕様です」「デプロイ完了」など。`,
    category: 'tech',
    priority: 8
  },
  
  // 9. インスタ改行ポエム風
  {
    id: 'insta-poem',
    name: 'インスタ改行ポエム風',
    description: '1行ごとに短く、余白を感じさせる構造',
    emoji: '📱',
    color: '#E91E63',
    prompt: `以下の文章を、Instagramによくある改行ポエム風に変換してください。
改行は1行ごとに短く、余白を感じさせる構造にしてください。
抽象的な言葉＋絵文字も適度に使用OKです。`,
    category: 'social',
    priority: 9
  },
  
  // 10. おじさん構文
  {
    id: 'ojisan-kobun',
    name: 'おじさん構文',
    description: '顔文字、語尾カタカナ、過剰ハートマーク',
    emoji: '👨‍💼',
    color: '#8D4B4B',
    prompt: `以下の文章を、昭和生まれのおじさんがLINEで送ってきそうな文体に変換してください。
顔文字、語尾のカタカナ、過剰なハートマークや絵文字、「今日はありがとうネ」的な言い回しを含めてください。`,
    category: 'fun',
    priority: 10
  },
  
  // 11. 中２病風
  {
    id: 'chuunibyou-pro',
    name: '中２病風',
    description: '「我」「闇」「封印」の世界観全開',
    emoji: '⚡',
    color: '#6366F1',
    prompt: `以下の文章を、中二病っぽい言い回しに変換してください。
「我」「闇」「封印」「真の名」などの語彙を使って、中二病の世界観を全開にしてください。`,
    category: 'fun',
    priority: 11
  },
  
  // 12. メンヘラ/鬱ポエム風
  {
    id: 'menhera-poem',
    name: 'メンヘラ/鬱ポエム風',
    description: 'やや病んだ雰囲気のモノローグ',
    emoji: '🥺',
    color: '#EC4899',
    prompt: `以下の文章を、やや病んだ雰囲気のポエム風に変換してください。
自分を責めたり、世界に違和感を感じているようなモノローグで綴ってください。`,
    category: 'creative',
    priority: 12
  },
  
  // 13. ビジネス意識高い系
  {
    id: 'business-ishikitakai',
    name: 'ビジネス意識高い系',
    description: 'スタバでMacBook開いてドヤってそうな自称コンサル',
    emoji: '☕',
    color: '#10B981',
    prompt: `以下の文章を、スタバでMacBook開いてドヤってそうな「自称コンサル」っぽく変換してください。
カタカナ語の多用、根拠の薄い断定、ムダに熱い言葉を使って、内容は薄くても語ってる感じを演出してください。`,
    category: 'business',
    priority: 13
  },
  
  // 14. 英語（実用）
  {
    id: 'english-practical',
    name: '英語',
    description: '自然な英語翻訳（フォーマル×カジュアル）',
    emoji: '🌍',
    color: '#3B82F6',
    prompt: `以下の日本語文章を、自然な英語に翻訳してください。フォーマルすぎずカジュアルすぎないトーンでお願いします。`,
    category: 'business',
    priority: 14
  },
  
  // 15. 童話風
  {
    id: 'fairytale',
    name: '童話風',
    description: '子ども向けの優しい童話のような文体',
    emoji: '🧚‍♀️',
    color: '#F472B6',
    prompt: `以下の文章を、子ども向けの優しい童話のような文体に変換してください。
動物や風景を比喩に使い、語尾は「〜ました」「〜です」に統一してください。`,
    category: 'creative',
    priority: 15
  },
  
  // 16. 古代言語風
  {
    id: 'ancient-language',
    name: '古代言語風',
    description: '架空の古代言語風でファンタジー響き',
    emoji: '📜',
    color: '#92400E',
    prompt: `以下の文章を、架空の古代言語風に変換してください。文法は少し崩れていても構いません。
語尾に「-eth」「-dor」「-na」などをつけて、ファンタジー風の響きを持たせてください。`,
    category: 'creative',
    priority: 16
  },
  
  // === 既存スタイル（優先順位調整済み） ===
  
  {
    id: 'yawaraka',
    name: '柔らかい文章',
    description: '優しく温かい表現',
    emoji: '🌸',
    color: '#F472B6',
    prompt: '以下の文章を、優しく温かみのある柔らかい表現に言い換えてください。読み手に安心感を与える丁寧で親しみやすい言葉遣いを使用してください。',
    category: 'popular',
    priority: 17
  },
  {
    id: 'sns',
    name: 'SNS投稿向け',
    description: 'バズりやすい投稿文',
    emoji: '📱',
    color: '#06B6D4',
    prompt: '以下の文章を、SNSでバズりやすい投稿文に言い換えてください。親しみやすく、シェアしたくなるような魅力的な表現を使用してください。',
    category: 'social',
    priority: 18
  },
  {
    id: 'catchcopy',
    name: 'キャッチコピー風',
    description: '印象的で覚えやすく',
    emoji: '✨',
    color: '#F59E0B',
    prompt: '以下の文章を、印象的で覚えやすいキャッチコピー風に言い換えてください。短くて響きの良い、商品やサービスの宣伝文句のような表現を使用してください。',
    category: 'business',
    priority: 19
  },
  {
    id: 'keigo',
    name: '敬語風',
    description: '丁寧で上品な表現',
    emoji: '🙏',
    color: '#1F2937',
    prompt: '以下の文章を、丁寧で上品な敬語表現に言い換えてください。ビジネスシーンで使えるような丁寧語を使用してください。',
    category: 'business',
    priority: 20
  },
];

// スタイルIDからスタイル情報を取得
export const getStyleById = (id: string): RephraseStyle | undefined => {
  return REPHRASE_STYLES.find(style => style.id === id);
};

// カテゴリー別にスタイルを取得
export const getStylesByCategory = (category: RephraseStyle['category']) => {
  return REPHRASE_STYLES.filter(style => style.category === category);
};

// 期間限定スタイルをフィルタリング + 優先順位順でソート
export const getActiveStyles = (isPro: boolean = false): RephraseStyle[] => {
  const now = new Date();
  return REPHRASE_STYLES
    .filter(style => {
      // Pro版限定スタイルの表示制御
      if (style.isPro && !isPro) return false;
      
      // 期間限定チェック
      if (!style.isLimited) return true;
      if (!style.limitEndDate) return true;
      return now < style.limitEndDate;
    })
    .sort((a, b) => {
      // 優先順位でソート（小さい数字が先頭）
      const priorityA = a.priority || 999;
      const priorityB = b.priority || 999;
      return priorityA - priorityB;
    });
};

// Pro版限定スタイルのみ取得
export const getProStyles = (): RephraseStyle[] => {
  return REPHRASE_STYLES.filter(style => style.isPro);
};
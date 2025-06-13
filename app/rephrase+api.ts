import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'your-api-key-here',
});

const STYLE_PROMPTS = {
  meigen: '以下の文章を、深く心に響く名言のような表現に言い換えてください。哲学的で印象的な言葉遣いを使用してください。',
  menhera: '以下の文章を、感情的で繊細な、メンヘラ風の表現に言い換えてください。不安定で脆い感情を表現してください。',
  chuunibyou: '以下の文章を、中二病的でカッコイイ表現に言い換えてください。厨二病らしい大げさで壮大な言葉遣いを使用してください。',
  keigo: '以下の文章を、丁寧で上品な敬語表現に言い換えてください。ビジネスシーンで使えるような丁寧語を使用してください。',
  kansai: '以下の文章を、親しみやすい関西弁に言い換えてください。関西弁特有の語尾や表現を使用してください。',
  poet: '以下の文章を、美しく詩的な表現に言い換えてください。韻律や比喩を使った芸術的な言葉遣いを使用してください。',
  business: '以下の文章を、プロフェッショナルなビジネス表現に言い換えてください。フォーマルで効率的な言葉遣いを使用してください。',
  gyaru: '以下の文章を、元気で可愛いギャル風の表現に言い換えてください。ギャル特有の言葉遣いや語尾を使用してください。',
};

export async function POST(request: Request) {
  try {
    const { text, style } = await request.json();

    if (!text || !style) {
      return Response.json(
        { error: '文章とスタイルを指定してください' },
        { status: 400 }
      );
    }

    const prompt = STYLE_PROMPTS[style as keyof typeof STYLE_PROMPTS];
    if (!prompt) {
      return Response.json(
        { error: '無効なスタイルです' },
        { status: 400 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `あなたは文章を様々なスタイルで言い換える専門家です。指定されたスタイルに従って、自然で魅力的な日本語の文章に言い換えてください。元の意味を保ちながら、指定されたスタイルの特徴を明確に表現してください。`,
        },
        {
          role: 'user',
          content: `${prompt}\n\n文章: ${text}`,
        },
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const result = completion.choices[0]?.message?.content?.trim();
    
    if (!result) {
      return Response.json(
        { error: 'AIからの応答を取得できませんでした' },
        { status: 500 }
      );
    }

    return Response.json({ result });
  } catch (error) {
    console.error('Rephrase API error:', error);
    
    if (error instanceof Error && error.message.includes('API key')) {
      return Response.json(
        { error: 'APIキーが設定されていません' },
        { status: 401 }
      );
    }

    return Response.json(
      { error: '処理中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
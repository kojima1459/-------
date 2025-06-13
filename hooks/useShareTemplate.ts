import { useSettings } from './SettingsContext';

interface ShareTemplateOptions {
  text: string;
  style: string;
  platform?: 'twitter' | 'line' | 'instagram' | 'tiktok' | 'general';
}

const STYLE_HASHTAGS: { [key: string]: string } = {
  'meigen': '#名言風',
  'menhera': '#メンヘラ風', 
  'chuunibyou': '#厨二病風',
  'keigo': '#敬語風',
  'kansai': '#関西弁風',
  'poet': '#詩人風',
  'business': '#ビジネス風',
  'gyaru': '#ギャル風',
};

const LP_LINK = 'https://rephrase-master.app';

export function useShareTemplate() {
  const { isPro, shareTagsEnabled, lpLinkEnabled } = useSettings();

  const generateTemplate = ({ text, style, platform = 'general' }: ShareTemplateOptions): string => {
    let content = text;
    
    // Pro版でタグ無効の場合
    const shouldShowTags = isPro ? shareTagsEnabled : true;
    const shouldShowLpLink = isPro ? lpLinkEnabled : true;

    // タグを生成
    if (shouldShowTags) {
      const appTag = '#RephraseMaster';
      const styleTag = STYLE_HASHTAGS[style] || `#${style}風`;
      const tags = `${appTag} ${styleTag}`;
      content = `${content}\n\n${tags}`;
    }

    // LPリンクを追加
    if (shouldShowLpLink) {
      content = `${content}\n\n${LP_LINK}`;
    }

    // プラットフォーム別の最適化
    switch (platform) {
      case 'twitter':
        // Twitterは文字数制限を考慮
        const maxLength = 280;
        if (content.length <= maxLength) {
          return content;
        }
        // 文字数オーバーの場合はテキストを調整
        const overageAmount = content.length - maxLength;
        const baseTextReduction = overageAmount + 3; // "..."分
        const availableTextLength = text.length - baseTextReduction;
        
        if (availableTextLength > 10) { // 最低限の文字数を確保
          const truncatedText = text.substring(0, availableTextLength) + '...';
          let result = truncatedText;
          
          if (shouldShowTags) {
            const appTag = '#RephraseMaster';
            const styleTag = STYLE_HASHTAGS[style] || `#${style}風`;
            result = `${result}\n\n${appTag} ${styleTag}`;
          }
          
          if (shouldShowLpLink) {
            result = `${result}\n\n${LP_LINK}`;
          }
          
          return result;
        }
        return content; // フォールバック
        
      case 'line':
        return content;
        
      case 'instagram':
        // Instagramはハッシュタグを強調
        if (shouldShowTags && shouldShowLpLink) {
          return `${text}\n\n・\n#RephraseMaster ${STYLE_HASHTAGS[style] || `#${style}風`}\n\n✨AI文章言い換えアプリで生成✨\n${LP_LINK}`;
        } else if (shouldShowTags) {
          return `${text}\n\n・\n#RephraseMaster ${STYLE_HASHTAGS[style] || `#${style}風`}\n\n✨AI文章言い換えアプリで生成✨`;
        } else if (shouldShowLpLink) {
          return `${text}\n\n✨AI文章言い換えアプリで生成✨\n${LP_LINK}`;
        }
        return `${text}\n\n✨AI文章言い換えアプリで生成✨`;
        
      case 'tiktok':
        return content;
        
      default:
        return content;
    }
  };

  const getShareUrl = (platform: string, content: string): string => {
    const encodedContent = encodeURIComponent(content);
    
    switch (platform) {
      case 'twitter':
        return `https://twitter.com/intent/tweet?text=${encodedContent}`;
      case 'line':
        return `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(LP_LINK)}&text=${encodedContent}`;
      default:
        return '';
    }
  };

  return {
    generateTemplate,
    getShareUrl,
    canRemoveTags: isPro,
    canRemoveLpLink: isPro,
    tagsEnabled: isPro ? shareTagsEnabled : true,
    lpLinkEnabled: isPro ? lpLinkEnabled : true,
  };
}
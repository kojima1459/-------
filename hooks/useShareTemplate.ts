import { useSettings } from './SettingsContext';
import { getShareTemplate, DEFAULT_HASHTAGS, DEFAULT_LINK } from '@/config/shareTemplates';

interface ShareTemplateOptions {
  text: string;
  style: string;
  platform?: 'twitter' | 'line' | 'instagram' | 'tiktok' | 'general';
}

export function useShareTemplate() {
  const { 
    isPro, 
    shareTagsEnabled, 
    lpLinkEnabled, 
    customHashtags = [],
    customLink = DEFAULT_LINK
  } = useSettings();

  const generateTemplate = ({ text, style, platform = 'general' }: ShareTemplateOptions): string => {
    const baseTemplate = getShareTemplate(platform, isPro);
    let content = baseTemplate.replace('{text}', text);

    // Pro版でカスタマイズが無効の場合、または無料版の場合は強制付与
    if (!isPro || (isPro && shareTagsEnabled)) {
      const hashtags = isPro && customHashtags.length > 0 
        ? customHashtags 
        : DEFAULT_HASHTAGS[platform] || DEFAULT_HASHTAGS.general;
      
      if (hashtags.length > 0 && !content.includes('#')) {
        content += '\n\n' + hashtags.join(' ');
      }
    }

    // リンク付与
    if (!isPro || (isPro && lpLinkEnabled)) {
      const link = isPro ? customLink : DEFAULT_LINK;
      if (!content.includes('http') && link) {
        content += '\n\n' + link;
      }
    }

    return content.trim();
  };

  const getShareUrl = (platform: string, content: string): string => {
    const encodedContent = encodeURIComponent(content);
    
    switch (platform) {
      case 'twitter':
        return `https://twitter.com/intent/tweet?text=${encodedContent}`;
      case 'line':
        return `https://social-plugins.line.me/lineit/share?url=${encodedContent}`;
      default:
        return `https://twitter.com/intent/tweet?text=${encodedContent}`;
    }
  };

  return {
    generateTemplate,
    getShareUrl,
    canRemoveTags: isPro,
    canRemoveLpLink: isPro
  };
}
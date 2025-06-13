import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  X, 
  Copy, 
  Twitter, 
  MessageCircle, 
  Instagram, 
  Video,
  Crown,
  ExternalLink,
  Download,
  Share2
} from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import { useShareTemplate } from '@/hooks/useShareTemplate';
import { useSettings } from '@/hooks/SettingsContext';

interface ShareModalProps {
  visible: boolean;
  onClose: () => void;
  rephraseText: string;
  style: string;
  onUpgradePress: () => void;
}

const SNS_PLATFORMS = [
  {
    id: 'twitter',
    name: 'X (Twitter)',
    icon: Twitter,
    color: '#1DA1F2',
    description: 'ツイートして共有',
  },
  {
    id: 'line',
    name: 'LINE',
    icon: MessageCircle,
    color: '#00B900',
    description: 'LINEで送信',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: Instagram,
    color: '#E4405F',
    description: '画像として保存',
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    icon: Video,
    color: '#000000',
    description: '動画用テキスト',
  },
];

export function ShareModal({ visible, onClose, rephraseText, style, onUpgradePress }: ShareModalProps) {
  const { generateTemplate, getShareUrl, canRemoveTags, canRemoveLpLink } = useShareTemplate();
  const { isPro } = useSettings();
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);

  const handleShare = async (platform: string) => {
    const content = generateTemplate({ 
      text: rephraseText, 
      style, 
      platform: platform as any 
    });

    try {
      switch (platform) {
        case 'twitter':
          const twitterUrl = getShareUrl('twitter', content);
          await Linking.openURL(twitterUrl);
          break;
          
        case 'line':
          const lineUrl = getShareUrl('line', content);
          await Linking.openURL(lineUrl);
          break;
          
        case 'instagram':
          // Instagram用は画像生成を推奨
          Alert.alert(
            'Instagram投稿',
            'Instagramでは画像での投稿が効果的です。\n\nテキストをコピーして、お気に入りの画像編集アプリで素敵な画像を作成してください！',
            [
              { text: 'キャンセル', style: 'cancel' },
              { 
                text: 'テキストをコピー', 
                onPress: () => copyToClipboard(content)
              },
            ]
          );
          break;
          
        case 'tiktok':
          // TikTok用はテキストコピー
          Alert.alert(
            'TikTok投稿',
            'TikTokでの投稿用にテキストをコピーします。\n\n動画の説明文やコメントに使用してください！',
            [
              { text: 'キャンセル', style: 'cancel' },
              { 
                text: 'テキストをコピー', 
                onPress: () => copyToClipboard(content)
              },
            ]
          );
          break;
          
        default:
          await copyToClipboard(content);
      }
      
      // 投稿後のエンゲージメント
      if (platform !== 'instagram' && platform !== 'tiktok') {
        setTimeout(() => {
          Alert.alert(
            '🎉 シェア完了！',
            'シェアありがとうございます！\n\n他にも様々なスタイルで言い換えを試してみませんか？',
            [
              { text: 'もう一度言い換える', onPress: onClose },
              { text: '他のスタイルを試す', onPress: onClose },
            ]
          );
        }, 1000);
      }
      
    } catch (error) {
      Alert.alert('エラー', 'シェアに失敗しました。もう一度お試しください。');
    }
  };

  const copyToClipboard = async (content: string) => {
    await Clipboard.setStringAsync(content);
    Alert.alert('コピー完了', 'クリップボードにコピーしました！');
  };

  const handleCopyAll = () => {
    const content = generateTemplate({ text: rephraseText, style });
    copyToClipboard(content);
  };

  const renderPlatformButton = (platform: typeof SNS_PLATFORMS[0]) => {
    const IconComponent = platform.icon;
    
    return (
      <TouchableOpacity
        key={platform.id}
        style={styles.platformButton}
        onPress={() => handleShare(platform.id)}
      >
        <View style={[styles.platformIconContainer, { backgroundColor: platform.color }]}>
          <IconComponent size={24} color="#ffffff" />
        </View>
        <View style={styles.platformContent}>
          <Text style={styles.platformName}>{platform.name}</Text>
          <Text style={styles.platformDescription}>{platform.description}</Text>
        </View>
        <ExternalLink size={16} color="#9ca3af" />
      </TouchableOpacity>
    );
  };

  const renderCustomizationSettings = () => {
    if (!canRemoveTags && !canRemoveLpLink) {
      return (
        <View style={styles.customizationInfoContainer}>
          <View style={styles.customizationInfo}>
            <Crown size={16} color="#F59E0B" />
            <Text style={styles.customizationInfoText}>
              Pro版でハッシュタグとリンクの表示をカスタマイズできます
            </Text>
          </View>
          <TouchableOpacity style={styles.upgradeSmallButton} onPress={onUpgradePress}>
            <Text style={styles.upgradeSmallButtonText}>アップグレード</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.proFeature}>
        <View style={styles.proHeader}>
          <Crown size={16} color="#F59E0B" />
          <Text style={styles.proText}>Pro版特典: カスタマイズ可能</Text>
        </View>
        <Text style={styles.proDescription}>
          Settings画面でハッシュタグとリンクの表示を制御できます
        </Text>
      </View>
    );
  };

  const previewContent = generateTemplate({ text: rephraseText, style });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <LinearGradient
          colors={['#8B5CF6', '#EC4899', '#F59E0B']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={24} color="#ffffff" />
            </TouchableOpacity>
            <Text style={styles.title}>SNSシェア</Text>
            <View style={styles.placeholder} />
          </View>
        </LinearGradient>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* プレビュー */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>投稿プレビュー</Text>
            <View style={styles.previewContainer}>
              <Text style={styles.previewText}>{previewContent}</Text>
              <TouchableOpacity style={styles.copyPreviewButton} onPress={handleCopyAll}>
                <Copy size={16} color="#8B5CF6" />
                <Text style={styles.copyPreviewButtonText}>全文をコピー</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* カスタマイズ情報 */}
          <View style={styles.section}>
            {renderCustomizationSettings()}
          </View>

          {/* SNSプラットフォーム */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>シェア先を選択</Text>
            <View style={styles.platformsContainer}>
              {SNS_PLATFORMS.map(renderPlatformButton)}
            </View>
          </View>

          {/* 使い方のヒント */}
          <View style={styles.section}>
            <View style={styles.tipsContainer}>
              <Text style={styles.tipsTitle}>💡 シェアのコツ</Text>
              <Text style={styles.tipsText}>
                • Instagramでは画像と組み合わせると効果的{'\n'}
                • TikTokでは動画のキャプションとして活用{'\n'}
                • ハッシュタグでより多くの人に届けよう{'\n'}
                • 定期的な投稿でフォロワーを増やそう
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1f2937',
    marginBottom: 12,
  },
  previewContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  previewText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#1f2937',
    lineHeight: 20,
    marginBottom: 12,
  },
  copyPreviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#8B5CF6',
  },
  copyPreviewButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#8B5CF6',
  },
  customizationInfoContainer: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F59E0B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  customizationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  customizationInfoText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#92400E',
    flex: 1,
  },
  upgradeSmallButton: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  upgradeSmallButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  proFeature: {
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  proHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  proText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1e40af',
  },
  proDescription: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#1e40af',
    opacity: 0.8,
  },
  platformsContainer: {
    gap: 12,
  },
  platformButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  platformIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  platformContent: {
    flex: 1,
  },
  platformName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1f2937',
    marginBottom: 2,
  },
  platformDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
  },
  tipsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  tipsTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1f2937',
    marginBottom: 8,
  },
  tipsText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
    lineHeight: 20,
  },
});
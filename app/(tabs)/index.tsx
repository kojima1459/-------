import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
  FlatList,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Send, Sparkles, Crown, Share2 } from 'lucide-react-native';
import { useSettings } from '@/hooks/SettingsContext';
import { useRouter } from 'expo-router';
import { ShareModal } from '@/components/ShareModal';

const REPHRASE_STYLES = [
  { id: 'meigen', name: '名言風', description: '深く響く名言のように', emoji: '💭', color: '#8B5CF6' },
  { id: 'menhera', name: 'メンヘラ風', description: '感情的で繊細な表現', emoji: '🥺', color: '#EC4899' },
  { id: 'chuunibyou', name: '厨二病風', description: '中二病的でカッコイイ', emoji: '⚡', color: '#6366F1' },
  { id: 'keigo', name: '敬語風', description: '丁寧で上品な表現', emoji: '🙏', color: '#059669' },
  { id: 'kansai', name: '関西弁風', description: '親しみやすい関西弁', emoji: '😄', color: '#F59E0B' },
  { id: 'poet', name: '詩人風', description: '美しく詩的な表現', emoji: '🌸', color: '#DB2777' },
  { id: 'business', name: 'ビジネス風', description: 'プロフェッショナルな表現', emoji: '💼', color: '#1F2937' },
  { id: 'gyaru', name: 'ギャル風', description: '元気で可愛い表現', emoji: '💅', color: '#F472B6' },
];

const { width: screenWidth } = Dimensions.get('window');
const CARD_WIDTH = screenWidth * 0.7;
const CARD_SPACING = 20;

export default function RephraseScreen() {
  const { apiKey, isPro, rephraseCount, setRephraseCount } = useSettings();
  const router = useRouter();
  const [inputText, setInputText] = useState('');
  const [selectedStyle, setSelectedStyle] = useState(REPHRASE_STYLES[0]);
  const [rephraseResult, setRephraseResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const handleRephrase = async () => {
    // APIキーの確認
    if (!apiKey || apiKey.trim() === '') {
      Alert.alert('APIキー未設定', 'Settings画面でOpenAI APIキーを設定してください。');
      return;
    }

    // 無料ユーザーの制限チェック
    if (!isPro && rephraseCount >= 5) {
      Alert.alert(
        '制限に達しました',
        '5回までの無料利用が完了しました。有料版にアップグレードして続けて利用できます。',
        [
          { text: 'キャンセル', style: 'cancel' },
          { 
            text: '有料版にアップグレード', 
            onPress: () => router.push('/settings')
          },
        ]
      );
      return;
    }

    if (!inputText.trim()) {
      Alert.alert('エラー', '文章を入力してください');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'user',
              content: `${selectedStyle.name}で以下の文章を言い換えてください：\n${inputText}`,
            },
          ],
          max_tokens: 500,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setRephraseResult(data.choices[0].message.content.trim());
        setRephraseCount(rephraseCount + 1);
      } else {
        if (response.status === 401) {
          Alert.alert('APIキーエラー', 'APIキーが無効です。Settings画面で正しいAPIキーを設定してください。');
        } else {
          Alert.alert('エラー', data.error?.message || '処理中にエラーが発生しました');
        }
      }
    } catch (e) {
      Alert.alert('エラー', 'ネットワークエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const navigateToSettings = () => {
    router.push('/settings');
  };

  const onStyleSelect = (style: any, index: number) => {
    setSelectedStyle(style);
    flatListRef.current?.scrollToIndex({ 
      index, 
      animated: true,
      viewPosition: 0.5 
    });
  };

  const renderStyleCard = ({ item, index }: { item: any; index: number }) => {
    const isSelected = selectedStyle.id === item.id;
    
    return (
      <TouchableOpacity
        style={[
          styles.styleCard,
          isSelected && styles.selectedStyleCard,
          { backgroundColor: isSelected ? item.color : '#ffffff' }
        ]}
        onPress={() => onStyleSelect(item, index)}
      >
        <View style={styles.styleCardContent}>
          <Text style={styles.styleEmoji}>{item.emoji}</Text>
          <Text style={[
            styles.styleCardTitle,
            { color: isSelected ? '#ffffff' : '#1f2937' }
          ]}>{item.name}</Text>
          <Text style={[
            styles.styleCardDescription,
            { color: isSelected ? 'rgba(255,255,255,0.9)' : '#6b7280' }
          ]}>{item.description}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const remainingCount = Math.max(0, 5 - rephraseCount);
  const showLimitWarning = !isPro && rephraseCount >= 4;

  return (
    <LinearGradient colors={['#8B5CF6', '#EC4899', '#F59E0B']} style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Rephrase Master</Text>
          <Text style={styles.subtitle}>AIが文章を様々なスタイルで言い換えます</Text>
          
          {/* プラン表示 */}
          <View style={styles.planIndicator}>
            {isPro ? (
              <View style={styles.proIndicator}>
                <Crown size={16} color="#F59E0B" />
                <Text style={styles.proText}>Pro版 - 無制限</Text>
              </View>
            ) : (
              <View style={styles.freeIndicator}>
                <Text style={styles.freeText}>
                  無料版: {remainingCount}回 残り
                </Text>
                {showLimitWarning && (
                  <Text style={styles.warningText}>もうすぐ制限に達します</Text>
                )}
              </View>
            )}
          </View>
        </View>

        {/* 制限警告カード */}
        {!isPro && rephraseCount >= 3 && (
          <View style={styles.warningCard}>
            <View style={styles.warningHeader}>
              <Crown size={20} color="#F59E0B" />
              <Text style={styles.warningTitle}>制限にご注意ください</Text>
            </View>
            <Text style={styles.warningDescription}>
              無料版は1日5回までご利用いただけます。
              {remainingCount > 0 
                ? `あと${remainingCount}回利用可能です。` 
                : '本日の制限に達しました。'
              }
            </Text>
            <TouchableOpacity style={styles.upgradePrompt} onPress={navigateToSettings}>
              <Text style={styles.upgradePromptText}>有料版で無制限利用 →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* メインカード */}
        <View style={styles.mainCard}>
          {/* 文章入力 */}
          <View style={styles.inputSection}>
            <Text style={styles.sectionTitle}>文章を入力</Text>
            <TextInput
              style={styles.textInput}
              placeholder="ここに文章を入力してください..."
              value={inputText}
              onChangeText={setInputText}
              multiline
              numberOfLines={4}
              placeholderTextColor="#9ca3af"
            />
          </View>

          {/* スタイル選択カルーセル */}
          <View style={styles.styleSection}>
            <Text style={styles.sectionTitle}>スタイルを選択</Text>
            <FlatList
              ref={flatListRef}
              data={REPHRASE_STYLES}
              renderItem={renderStyleCard}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={CARD_WIDTH + CARD_SPACING}
              decelerationRate="fast"
              contentContainerStyle={styles.styleCarousel}
              getItemLayout={(data, index) => ({
                length: CARD_WIDTH + CARD_SPACING,
                offset: (CARD_WIDTH + CARD_SPACING) * index,
                index,
              })}
            />
          </View>

          {/* 言い換えボタン */}
          <TouchableOpacity
            style={[styles.rephraseButton, isLoading && styles.disabledButton]}
            onPress={handleRephrase}
            disabled={isLoading}
          >
            <LinearGradient colors={['#8B5CF6', '#EC4899']} style={styles.buttonGradient}>
              {isLoading
                ? <ActivityIndicator color="#fff" size="small" />
                : <Send size={20} color="#fff" />
              }
              <Text style={styles.rephraseButtonText}>
                {isLoading ? '処理中...' : '言い換える'}
              </Text>
              {!isPro && (
                <Text style={styles.countText}>
                  ({rephraseCount}/5)
                </Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* 言い換え結果 */}
          {rephraseResult ? (
            <View style={styles.resultSection}>
              <View style={styles.resultHeader}>
                <Sparkles size={20} color="#8B5CF6" />
                <Text style={styles.sectionTitle}>言い換え結果</Text>
              </View>
              <View style={styles.resultContainer}>
                <Text style={styles.resultText}>{rephraseResult}</Text>
                <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
                  <Share2 size={16} color="#EC4899" />
                  <Text style={styles.shareButtonText}>SNSでシェア</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : null}
        </View>
      </ScrollView>

      <ShareModal
        visible={showShareModal}
        onClose={() => setShowShareModal(false)}
        rephraseText={rephraseResult}
        style={selectedStyle.id}
        onUpgradePress={() => {
          setShowShareModal(false);
          navigateToSettings();
        }}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  scrollView: { 
    flex: 1, 
    paddingTop: Platform.OS === 'ios' ? 60 : 40 
  },
  header: { 
    alignItems: 'center', 
    marginBottom: 32, 
    paddingHorizontal: 20 
  },
  title: { 
    fontSize: 32, 
    fontFamily: 'Inter-Bold', 
    color: '#fff', 
    textAlign: 'center', 
    marginBottom: 8 
  },
  subtitle: { 
    fontSize: 16, 
    fontFamily: 'Inter-Regular', 
    color: '#fff', 
    textAlign: 'center', 
    opacity: 0.9, 
    marginBottom: 16 
  },
  planIndicator: {
    alignItems: 'center',
  },
  proIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  proText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  freeIndicator: {
    alignItems: 'center',
  },
  freeText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#ffffff',
    opacity: 0.9,
  },
  warningText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#FCD34D',
    marginTop: 2,
  },
  warningCard: {
    backgroundColor: '#FEF3C7',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  warningTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#92400E',
  },
  warningDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#92400E',
    lineHeight: 20,
    marginBottom: 12,
  },
  upgradePrompt: {
    alignSelf: 'flex-start',
  },
  upgradePromptText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#F59E0B',
    textDecorationLine: 'underline',
  },
  mainCard: { 
    backgroundColor: '#fff', 
    marginHorizontal: 20, 
    marginBottom: 20, 
    borderRadius: 20, 
    padding: 24, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 6 }, 
    shadowOpacity: 0.15, 
    shadowRadius: 12, 
    elevation: 8 
  },
  inputSection: {
    marginBottom: 32,
  },
  sectionTitle: { 
    fontSize: 18, 
    fontFamily: 'Inter-SemiBold', 
    color: '#1f2937', 
    marginBottom: 16 
  },
  textInput: { 
    borderWidth: 1, 
    borderColor: '#e5e7eb', 
    borderRadius: 12, 
    padding: 16, 
    fontSize: 16, 
    fontFamily: 'Inter-Regular', 
    color: '#1f2937', 
    backgroundColor: '#f9fafb', 
    minHeight: 100, 
    textAlignVertical: 'top' 
  },
  styleSection: {
    marginBottom: 32,
  },
  styleCarousel: {
    paddingHorizontal: 10,
  },
  styleCard: {
    width: CARD_WIDTH,
    marginHorizontal: CARD_SPACING / 2,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  selectedStyleCard: {
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
    borderColor: 'transparent',
  },
  styleCardContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  styleEmoji: {
    fontSize: 32,
    marginBottom: 12,
  },
  styleCardTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  styleCardDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 20,
  },
  rephraseButton: { 
    marginBottom: 24, 
    borderRadius: 16, 
    overflow: 'hidden', 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.2, 
    shadowRadius: 8, 
    elevation: 5 
  },
  disabledButton: { 
    opacity: 0.7 
  },
  buttonGradient: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingVertical: 18, 
    paddingHorizontal: 24, 
    gap: 8 
  },
  rephraseButtonText: { 
    fontSize: 18, 
    fontFamily: 'Inter-SemiBold', 
    color: '#fff' 
  },
  countText: { 
    fontSize: 14, 
    fontFamily: 'Inter-Regular', 
    color: '#fff', 
    opacity: 0.8 
  },
  resultSection: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 24,
  },
  resultHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8, 
    marginBottom: 16 
  },
  resultContainer: { 
    position: 'relative' 
  },
  resultText: { 
    fontSize: 16, 
    fontFamily: 'Inter-Regular', 
    color: '#1f2937', 
    lineHeight: 24, 
    marginBottom: 20, 
    padding: 16, 
    backgroundColor: '#f9fafb', 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: '#e5e7eb' 
  },
  shareButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 8, 
    padding: 16, 
    backgroundColor: '#fdf2f8', 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: '#EC4899' 
  },
  shareButtonText: { 
    fontSize: 16, 
    fontFamily: 'Inter-SemiBold', 
    color: '#EC4899' 
  },
});
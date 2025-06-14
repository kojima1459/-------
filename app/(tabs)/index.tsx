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
import { REPHRASE_STYLES, getActiveStyles, getStyleById } from '@/config/styles';

const { width: screenWidth } = Dimensions.get('window');
const CARD_WIDTH = screenWidth * 0.8;
const CARD_SPACING = 20;

export default function RephraseScreen() {
  const { apiKey, isPro, rephraseCount, setRephraseCount } = useSettings();
  const router = useRouter();
  const [inputText, setInputText] = useState('');
  const [selectedStyleIndex, setSelectedStyleIndex] = useState(0);
  const [rephraseResult, setRephraseResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const activeStyles = getActiveStyles();
  const selectedStyle = activeStyles[selectedStyleIndex];

  // デバッグ用コンソールログ
  console.log('=== コトバクラフト デバッグ情報 ===');
  console.log('API Key 設定状況:', apiKey ? 'あり' : 'なし');
  console.log('選択中のスタイル:', selectedStyle);
  console.log('アクティブスタイル数:', activeStyles.length);

  const handleRephrase = async () => {
    console.log('=== 言語生成開始 ===');
    
    // APIキーの確認
    if (!apiKey || apiKey.trim() === '') {
      console.error('APIキーが未設定');
      Alert.alert('APIキー未設定', 'Settings画面でOpenAI APIキーを設定してください。');
      return;
    }

    // 無料ユーザーの制限チェック
    if (!isPro && rephraseCount >= 5) {
      console.log('無料版の制限に達しました');
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
      console.error('入力文章が空');
      Alert.alert('エラー', '文章を入力してください');
      return;
    }

    if (!selectedStyle) {
      console.error('スタイルが選択されていません');
      Alert.alert('エラー', 'スタイルを選択してください');
      return;
    }

    console.log('入力文章:', inputText);
    console.log('選択スタイル:', selectedStyle.name);
    console.log('使用プロンプト:', selectedStyle.prompt);

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
              role: 'system',
              content: 'あなたは文章を様々なスタイルで言い換える専門家です。指定されたスタイルに従って、自然で魅力的な日本語の文章に言い換えてください。元の意味を保ちながら、指定されたスタイルの特徴を明確に表現してください。'
            },
            {
              role: 'user',
              content: `${selectedStyle.prompt}\n\n文章: ${inputText}`,
            },
          ],
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      console.log('API Response Status:', response.status);
      const data = await response.json();
      console.log('API Response Data:', data);

      if (response.ok) {
        const result = data.choices[0].message.content.trim();
        console.log('生成結果:', result);
        setRephraseResult(result);
        setRephraseCount(rephraseCount + 1);
        console.log('=== 言語生成成功 ===');
      } else {
        console.error('API Error:', data);
        if (response.status === 401) {
          Alert.alert('APIキーエラー', 'APIキーが無効です。Settings画面で正しいAPIキーを設定してください。');
        } else {
          Alert.alert('エラー', data.error?.message || '処理中にエラーが発生しました');
        }
      }
    } catch (error) {
      console.error('Network Error:', error);
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

  const onStyleSelect = (index: number) => {
    console.log('スタイル選択:', activeStyles[index].name);
    setSelectedStyleIndex(index);
    flatListRef.current?.scrollToIndex({ 
      index, 
      animated: true,
      viewPosition: 0.5 
    });
  };

  const renderStyleCard = ({ item, index }: { item: any; index: number }) => {
    const isSelected = selectedStyleIndex === index;
    
    return (
      <TouchableOpacity
        style={[
          styles.styleCard,
          isSelected && styles.selectedStyleCard,
          { backgroundColor: isSelected ? item.color : '#ffffff' }
        ]}
        onPress={() => onStyleSelect(index)}
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
          
          {/* カテゴリーバッジ */}
          {item.category && (
            <View style={[
              styles.categoryBadge,
              { backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : '#f3f4f6' }
            ]}>
              <Text style={[
                styles.categoryText,
                { color: isSelected ? '#ffffff' : '#6b7280' }
              ]}>
                {item.category === 'popular' ? '人気' : 
                 item.category === 'creative' ? 'クリエイティブ' :
                 item.category === 'business' ? 'ビジネス' : '楽しい'}
              </Text>
            </View>
          )}
          
          {/* 期間限定バッジ */}
          {item.isLimited && (
            <View style={styles.limitedBadge}>
              <Text style={styles.limitedText}>期間限定</Text>
            </View>
          )}
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
          <Text style={styles.title}>コトバクラフト</Text>
          <Text style={styles.subtitle}>AIが文章を様々なスタイルで変換します</Text>
          
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
              placeholder="例: 今日はいい天気ですね"
              value={inputText}
              onChangeText={setInputText}
              multiline
              numberOfLines={4}
              placeholderTextColor="#9ca3af"
            />
          </View>

          {/* 横スワイプ リールUI スタイル選択 */}
          <View style={styles.styleSection}>
            <Text style={styles.sectionTitle}>スタイルを選択</Text>
            <Text style={styles.styleSectionSubtitle}>
              スワイプで文化的スタイルを探索しよう！
            </Text>
            
            {/* リール風の横スワイプUI */}
            <View style={styles.reelContainer}>
              <FlatList
                ref={flatListRef}
                data={activeStyles}
                renderItem={renderStyleCard}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                snapToInterval={CARD_WIDTH + CARD_SPACING}
                decelerationRate="fast"
                contentContainerStyle={styles.styleCarousel}
                onMomentumScrollEnd={(event) => {
                  const index = Math.round(event.nativeEvent.contentOffset.x / (CARD_WIDTH + CARD_SPACING));
                  if (index !== selectedStyleIndex) {
                    setSelectedStyleIndex(index);
                  }
                }}
                getItemLayout={(data, index) => ({
                  length: CARD_WIDTH + CARD_SPACING,
                  offset: (CARD_WIDTH + CARD_SPACING) * index,
                  index,
                })}
              />
              
              {/* スワイプヒント */}
              <View style={styles.swipeHint}>
                <Text style={styles.swipeHintText}>← スワイプで探索 →</Text>
              </View>
              
              {/* スタイルインジケーター */}
              <View style={styles.styleIndicator}>
                {activeStyles.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.indicatorDot,
                      { backgroundColor: index === selectedStyleIndex ? '#8B5CF6' : '#e5e7eb' }
                    ]}
                  />
                ))}
              </View>
            </View>
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
                {isLoading ? '変換中...' : '✨ 変換する'}
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
                <Text style={styles.sectionTitle}>変換結果</Text>
                <View style={styles.resultStyleTag}>
                  <Text style={styles.resultStyleText}>{selectedStyle.name}</Text>
                </View>
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
        style={selectedStyle?.id || 'meigen'}
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
    fontSize: 36, 
    fontFamily: 'Inter-Bold', 
    color: '#fff', 
    textAlign: 'center', 
    marginBottom: 8,
    letterSpacing: 1,
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
  styleSectionSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
    marginBottom: 16,
    textAlign: 'center',
  },
  reelContainer: {
    position: 'relative',
  },
  styleCarousel: {
    paddingHorizontal: 10,
  },
  styleCard: {
    width: CARD_WIDTH,
    marginHorizontal: CARD_SPACING / 2,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    minHeight: 200,
  },
  selectedStyleCard: {
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
    borderColor: 'transparent',
    transform: [{ scale: 1.02 }],
  },
  styleCardContent: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    position: 'relative',
  },
  styleEmoji: {
    fontSize: 40,
    marginBottom: 16,
  },
  styleCardTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  styleCardDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 12,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  limitedBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#EF4444',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  limitedText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
  },
  swipeHint: {
    alignItems: 'center',
    marginTop: 12,
  },
  swipeHintText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  styleIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    gap: 8,
  },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
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
  resultStyleTag: {
    marginLeft: 'auto',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#8B5CF6',
  },
  resultStyleText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#8B5CF6',
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
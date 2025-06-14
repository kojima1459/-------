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
  KeyboardAvoidingView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Send, Sparkles, Crown, Share2 } from 'lucide-react-native';
import { useSettings } from '@/hooks/SettingsContext';
import { useRouter } from 'expo-router';
import { ShareModal } from '@/components/ShareModal';
import { REPHRASE_STYLES, getActiveStyles, getStyleById } from '@/config/styles';

const { width: screenWidth } = Dimensions.get('window');
const CARD_WIDTH = screenWidth * 0.62; // 62%に縮小（左右に見切れるUX）
const CARD_SPACING = 16;

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

  // 詳細デバッグログ
  console.log('=== コトバクラフト デバッグ情報 ===');
  console.log('API Key 設定状況:', apiKey ? `設定済み (${apiKey.substring(0, 7)}...)` : '未設定');
  console.log('選択中のスタイル:', selectedStyle);
  console.log('選択中のスタイルインデックス:', selectedStyleIndex);
  console.log('アクティブスタイル数:', activeStyles.length);
  console.log('全スタイル数:', REPHRASE_STYLES.length);

  const handleRephrase = async () => {
    console.log('=== 言語生成開始 ===');
    console.log('入力チェック開始...');
    
    // APIキーの詳細確認
    if (!apiKey || apiKey.trim() === '') {
      console.error('❌ APIキーが未設定');
      Alert.alert('APIキー未設定', 'Settings画面でOpenAI APIキーを設定してください。');
      return;
    }
    console.log('✅ APIキー確認済み');

    // 無料ユーザーの制限チェック
    if (!isPro && rephraseCount >= 5) {
      console.log('❌ 無料版の制限に達しました');
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
    console.log(`✅ 利用制限チェック済み (${rephraseCount}/5)`);

    // 入力文章チェック
    if (!inputText.trim()) {
      console.error('❌ 入力文章が空');
      Alert.alert('エラー', '文章を入力してください');
      return;
    }
    console.log('✅ 入力文章確認済み:', inputText);

    // スタイル選択チェック
    if (!selectedStyle) {
      console.error('❌ スタイルが選択されていません');
      console.error('selectedStyleIndex:', selectedStyleIndex);
      console.error('activeStyles:', activeStyles);
      Alert.alert('エラー', 'スタイルを選択してください');
      return;
    }
    console.log('✅ スタイル確認済み:', selectedStyle.name);

    // プロンプト確認
    if (!selectedStyle.prompt || selectedStyle.prompt.trim() === '') {
      console.error('❌ スタイルのプロンプトが空です');
      console.error('selectedStyle.prompt:', selectedStyle.prompt);
      Alert.alert('エラー', 'スタイル設定にエラーがあります');
      return;
    }
    console.log('✅ プロンプト確認済み:', selectedStyle.prompt);

    // APIリクエスト準備
    const systemMessage = 'あなたは文章を様々なスタイルで言い換える専門家です。指定されたスタイルに従って、自然で魅力的な日本語の文章に言い換えてください。元の意味を保ちながら、指定されたスタイルの特徴を明確に表現してください。';
    const userMessage = `${selectedStyle.prompt}\n\n文章: ${inputText}`;
    
    const requestPayload = {
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: systemMessage
        },
        {
          role: 'user',
          content: userMessage,
        },
      ],
      max_tokens: 500,
      temperature: 0.7,
    };

    console.log('📤 API Request Payload:');
    console.log('Model:', requestPayload.model);
    console.log('System Message:', systemMessage);
    console.log('User Message:', userMessage);
    console.log('Full Payload:', JSON.stringify(requestPayload, null, 2));

    setIsLoading(true);
    try {
      console.log('🌐 API呼び出し開始...');
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify(requestPayload),
      });

      console.log('📥 API Response Status:', response.status);
      console.log('📥 API Response Headers:', response.headers);

      const data = await response.json();
      console.log('📥 API Response Data:', JSON.stringify(data, null, 2));

      if (response.ok) {
        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
          console.error('❌ API Response構造が不正です');
          console.error('choices:', data.choices);
          Alert.alert('エラー', 'AIからの応答形式が不正です');
          return;
        }

        const result = data.choices[0].message.content?.trim();
        if (!result) {
          console.error('❌ API Response内容が空です');
          console.error('message.content:', data.choices[0].message.content);
          Alert.alert('エラー', 'AIからの応答が空です');
          return;
        }

        console.log('✅ 生成結果:', result);
        setRephraseResult(result);
        setRephraseCount(rephraseCount + 1);
        console.log('🎉 言語生成成功！');
      } else {
        console.error('❌ API Error Response:', data);
        if (response.status === 401) {
          console.error('❌ 認証エラー: APIキーが無効');
          Alert.alert('APIキーエラー', 'APIキーが無効です。Settings画面で正しいAPIキーを設定してください。');
        } else if (response.status === 429) {
          console.error('❌ レート制限エラー');
          Alert.alert('エラー', 'APIの利用制限に達しました。しばらく時間をおいてから再試行してください。');
        } else if (response.status === 500) {
          console.error('❌ サーバーエラー');
          Alert.alert('エラー', 'OpenAIサーバーでエラーが発生しました。しばらく時間をおいてから再試行してください。');
        } else {
          console.error('❌ その他のAPIエラー');
          Alert.alert('エラー', data.error?.message || `処理中にエラーが発生しました (${response.status})`);
        }
      }
    } catch (error) {
      console.error('❌ Network Error:', error);
      console.error('Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace'
      });
      Alert.alert('エラー', 'ネットワークエラーが発生しました。インターネット接続を確認してください。');
    } finally {
      setIsLoading(false);
      console.log('=== 言語生成処理完了 ===');
    }
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const navigateToSettings = () => {
    router.push('/settings');
  };

  const onStyleSelect = (index: number) => {
    console.log('スタイル選択:', activeStyles[index]?.name || 'undefined');
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
        activeOpacity={0.8}
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
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient colors={['#8B5CF6', '#EC4899', '#F59E0B']} style={styles.container}>
        {/* ヘッダー */}
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

        {/* メインコンテンツエリア */}
        <View style={styles.contentContainer}>
          {/* 上部スクロールエリア */}
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
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
                      if (index !== selectedStyleIndex && index >= 0 && index < activeStyles.length) {
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

              {/* 変換結果 */}
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

          {/* 固定変換ボタン */}
          <View style={styles.fixedButtonContainer}>
            <TouchableOpacity
              style={[styles.rephraseButton, isLoading && styles.disabledButton]}
              onPress={handleRephrase}
              disabled={isLoading}
              activeOpacity={0.8}
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
          </View>
        </View>

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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  header: { 
    alignItems: 'center', 
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 24, 
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
  contentContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  scrollView: { 
    flex: 1,
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
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    minHeight: 180,
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
    fontSize: 36,
    marginBottom: 12,
  },
  styleCardTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    marginBottom: 6,
    textAlign: 'center',
  },
  styleCardDescription: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 10,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 11,
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
  fixedButtonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'transparent',
  },
  rephraseButton: { 
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
});
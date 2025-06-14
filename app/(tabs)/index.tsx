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
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Send, Sparkles, Crown, Share2, Lock, AlertCircle } from 'lucide-react-native';
import { useSettings } from '@/hooks/SettingsContext';
import { useRouter } from 'expo-router';
import { ShareModal } from '@/components/ShareModal';
import { getActiveStyles, getStyleById } from '@/config/styles';

const { width: screenWidth } = Dimensions.get('window');
const CARD_WIDTH = screenWidth * 0.4; // カードサイズ調整：3つ見えるように
const CARD_SPACING = 12;

// 文字数制限定数
const MAX_INPUT_LENGTH = 300;
const MAX_OUTPUT_LENGTH = 400;

export default function RephraseScreen() {
  const { apiKey, isPro, rephraseCount, setRephraseCount } = useSettings();
  const router = useRouter();
  const [inputText, setInputText] = useState('');
  const [selectedStyleIndex, setSelectedStyleIndex] = useState(0);
  const [rephraseResult, setRephraseResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const activeStyles = getActiveStyles(isPro);
  const selectedStyle = activeStyles[selectedStyleIndex];

  // 文字数カウント関数
  const getInputCharCount = () => inputText.length;
  const isInputOverLimit = () => getInputCharCount() > MAX_INPUT_LENGTH;

  console.log('\n=== コトバクラフト デバッグ情報 ===');
  console.log('🔑 API Key 設定状況:', apiKey ? `設定済み (${apiKey.substring(0, 10)}...)` : '❌ 未設定');
  console.log('📊 全スタイル総数:', activeStyles.length);
  console.log('📊 選択中インデックス:', selectedStyleIndex);
  console.log('📊 選択中スタイル:', selectedStyle?.name || 'undefined');
  console.log('📊 文字数制限:', `入力: ${getInputCharCount()}/${MAX_INPUT_LENGTH}文字`);

  const handleRephrase = async () => {
    console.log('\n🚀 === 言語生成プロセス開始 ===');
    
    // 文字数制限チェック
    if (isInputOverLimit()) {
      Alert.alert('文字数制限', `入力文章は${MAX_INPUT_LENGTH}文字以内にしてください。現在: ${getInputCharCount()}文字`);
      return;
    }

    // APIキーチェック
    if (!apiKey || apiKey.trim() === '') {
      console.error('❌ エラー: APIキーが未設定');
      Alert.alert('APIキー未設定', 'Settings画面でOpenAI APIキーを設定してください。');
      return;
    }

    // 制限チェック
    if (!isPro && rephraseCount >= 5) {
      console.error('❌ エラー: 無料版制限に達しました');
      Alert.alert(
        '制限に達しました',
        '5回までの無料利用が完了しました。Pro版（月額99円）にアップグレードして続けて利用できます。',
        [
          { text: 'キャンセル', style: 'cancel' },
          { text: 'Pro版にアップグレード', onPress: () => router.push('/settings') },
        ]
      );
      return;
    }

    // 入力文章チェック
    if (!inputText.trim()) {
      console.error('❌ エラー: 入力文章が空');
      Alert.alert('エラー', '文章を入力してください');
      return;
    }

    // スタイル検証
    if (!selectedStyle) {
      console.error('❌ 致命的エラー: selectedStyle が null/undefined');
      Alert.alert('エラー', 'スタイル選択にエラーがあります。アプリを再起動してください。');
      return;
    }

    if (!selectedStyle.prompt) {
      console.error('❌ 致命的エラー: selectedStyle.prompt が存在しません');
      Alert.alert('エラー', 'スタイル設定にプロンプトが設定されていません。');
      return;
    }

    console.log('✅ スタイル:', selectedStyle.name);
    console.log('✅ プロンプト長:', selectedStyle.prompt.length);

    // メッセージ構築
    const systemMessage = 'あなたは文章を様々なスタイルで言い換える専門家です。指定されたスタイルに従って、自然で魅力的な日本語の文章に言い換えてください。元の意味を保ちながら、指定されたスタイルの特徴を明確に表現してください。出力は400文字以内にまとめてください。';
    const userMessage = `${selectedStyle.prompt}\n\n文章: ${inputText}`;
    
    const messages = [
      {
        role: 'system' as const,
        content: systemMessage
      },
      {
        role: 'user' as const,
        content: userMessage,
      },
    ];

    const requestPayload = {
      model: 'gpt-4o',
      messages: messages,
      max_tokens: Math.min(500, MAX_OUTPUT_LENGTH * 2), // 余裕を持って設定
      temperature: 0.7,
    };

    console.log('🔍 完全なペイロード確認:');
    console.log('  - Model:', requestPayload.model);
    console.log('  - Max tokens:', requestPayload.max_tokens);
    console.log('  - Messages count:', requestPayload.messages.length);
    console.log('  - System message:', messages[0].content);
    console.log('  - User message:', messages[1].content);

    setIsLoading(true);

    // ボタンアニメーション開始
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // パルスアニメーション開始
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();
    
    try {
      console.log('🌐 API Request 送信中...');
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify(requestPayload),
      });

      console.log('📥 API Response Status:', response.status);

      const data = await response.json();
      console.log('📥 API Response Data:', JSON.stringify(data, null, 2));

      if (response.ok) {
        if (!data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
          console.error('❌ API Response エラー: choices が存在しないか空です');
          Alert.alert('エラー', 'AIからの応答形式が不正です（choices不正）');
          return;
        }
        
        if (!data.choices[0] || !data.choices[0].message) {
          console.error('❌ API Response エラー: message が存在しません');
          Alert.alert('エラー', 'AIからの応答形式が不正です（message不正）');
          return;
        }
        
        const messageContent = data.choices[0].message.content;
        if (!messageContent) {
          console.error('❌ API Response エラー: message.content が存在しません');
          Alert.alert('エラー', 'AIからの応答内容が空です');
          return;
        }

        let result = messageContent.trim();
        
        // 文字数制限チェック（出力）
        if (result.length > MAX_OUTPUT_LENGTH) {
          result = result.substring(0, MAX_OUTPUT_LENGTH) + '...';
          console.log(`⚠️ 出力文字数制限により切り詰め: ${result.length}文字`);
        }

        if (!result) {
          console.error('❌ API Response エラー: trimmed content が空です');
          Alert.alert('エラー', 'AIからの応答内容が空です（trim後）');
          return;
        }

        console.log('🎉 === 生成成功！ ===');
        console.log('  - 生成結果:', result);
        console.log('  - 生成結果長:', result.length);
        
        setRephraseResult(result);
        setRephraseCount(rephraseCount + 1);
        
        console.log('✅ 状態更新完了');
        console.log('  - 新しい利用回数:', rephraseCount + 1);
        
      } else {
        console.error('\n❌ === API エラーレスポンス詳細解析 ===');
        console.error('  - Status:', response.status);
        console.error('  - Error Data:', data);
        
        if (response.status === 401) {
          Alert.alert('APIキーエラー', 'APIキーが無効です。Settings画面で正しいAPIキーを設定してください。');
        } else if (response.status === 429) {
          Alert.alert('エラー', 'APIの利用制限に達しました。しばらく時間をおいてから再試行してください。');
        } else if (response.status === 500) {
          Alert.alert('エラー', 'OpenAIサーバーでエラーが発生しました。しばらく時間をおいてから再試行してください。');
        } else {
          Alert.alert('エラー', data.error?.message || `処理中にエラーが発生しました (${response.status})`);
        }
      }
    } catch (error) {
      console.error('\n❌ === ネットワークエラー詳細解析 ===');
      console.error('  - エラー:', error);
      Alert.alert('エラー', 'ネットワークエラーが発生しました。インターネット接続を確認してください。');
    } finally {
      setIsLoading(false);
      
      // アニメーション停止
      pulseAnimation.stop();
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
      
      console.log('\n🏁 === 言語生成プロセス完了 ===\n');
    }
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const navigateToSettings = () => {
    router.push('/settings');
  };

  const onStyleSelect = (index: number) => {
    console.log('🎯 スタイル選択:', activeStyles[index]?.name || 'undefined');
    setSelectedStyleIndex(index);
    flatListRef.current?.scrollToIndex({ 
      index, 
      animated: true,
      viewPosition: 0.5 
    });

    // スタイル選択時のマイクロアニメーション
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.98,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1.02,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleProStylePress = () => {
    Alert.alert(
      'Pro版限定スタイル',
      'このスタイルはPro版（月額99円）でご利用いただけます。\n\nネタ投稿用の投資として、ぜひご検討ください！',
      [
        { text: 'キャンセル', style: 'cancel' },
        { text: 'Pro版にアップグレード', onPress: navigateToSettings },
      ]
    );
  };

  const renderStyleCard = ({ item, index }: { item: any; index: number }) => {
    const isSelected = selectedStyleIndex === index;
    const isProStyle = item.isPro && !isPro;
    
    return (
      <Animated.View
        style={{
          transform: [{ scale: isSelected ? scaleAnim : 1 }]
        }}
      >
        <TouchableOpacity
          style={[
            styles.styleCard,
            isSelected && styles.selectedStyleCard,
            { backgroundColor: isSelected ? item.color : '#ffffff' },
            isProStyle && styles.proStyleCard
          ]}
          onPress={() => isProStyle ? handleProStylePress() : onStyleSelect(index)}
          activeOpacity={0.8}
        >
          <View style={styles.styleCardContent}>
            {isProStyle && (
              <View style={styles.proLockOverlay}>
                <Crown size={16} color="#F59E0B" />
              </View>
            )}
            <Text style={styles.styleEmoji}>{item.emoji}</Text>
            <Text style={[
              styles.styleCardTitle,
              { color: isSelected ? '#ffffff' : '#1f2937' },
              isProStyle && styles.proStyleText
            ]}>{item.name}</Text>
            <Text style={[
              styles.styleCardDescription,
              { color: isSelected ? 'rgba(255,255,255,0.9)' : '#6b7280' },
              isProStyle && styles.proStyleText
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
                   item.category === 'business' ? 'ビジネス' : 
                   item.category === 'political' ? '政治' :
                   item.category === 'literary' ? '文学' :
                   item.category === 'social' ? 'SNS' :
                   item.category === 'tech' ? '技術' :
                   item.category === 'pro' ? 'Pro版' : '楽しい'}
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
      </Animated.View>
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
          <Text style={styles.subtitle}>16種の文化記号で言語遊び体験</Text>
          
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
              <Text style={styles.upgradePromptText}>Pro版（月額99円）で無制限利用 →</Text>
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
                <View style={styles.inputHeader}>
                  <Text style={styles.sectionTitle}>文章を入力</Text>
                  <View style={styles.charCountContainer}>
                    <Text style={[
                      styles.charCount,
                      isInputOverLimit() && styles.charCountOver
                    ]}>
                      {getInputCharCount()}/{MAX_INPUT_LENGTH}
                    </Text>
                    {isInputOverLimit() && (
                      <AlertCircle size={16} color="#ef4444" />
                    )}
                  </View>
                </View>
                <TextInput
                  style={[
                    styles.textInput,
                    isInputOverLimit() && styles.textInputOver
                  ]}
                  placeholder="例: 今日はいい天気ですね"
                  value={inputText}
                  onChangeText={setInputText}
                  multiline
                  numberOfLines={4}
                  placeholderTextColor="#9ca3af"
                  maxLength={MAX_INPUT_LENGTH + 50} // ソフト制限
                />
                {isInputOverLimit() && (
                  <Text style={styles.charLimitWarning}>
                    文字数制限を超えています。{MAX_INPUT_LENGTH}文字以内にしてください。
                  </Text>
                )}
              </View>

              {/* 選択中スタイルの説明表示 */}
              {selectedStyle && (
                <View style={styles.selectedStyleInfo}>
                  <View style={styles.selectedStyleHeader}>
                    <Text style={styles.selectedStyleEmoji}>{selectedStyle.emoji}</Text>
                    <Text style={styles.selectedStyleName}>{selectedStyle.name}</Text>
                    {selectedStyle.isPro && !isPro && (
                      <Crown size={16} color="#F59E0B" />
                    )}
                  </View>
                  <Text style={styles.selectedStyleDescription}>
                    {selectedStyle.description}
                  </Text>
                </View>
              )}

              {/* 16種スタイル選択リール */}
              <View style={styles.styleSection}>
                <Text style={styles.sectionTitle}>16種の文化記号スタイル</Text>
                <Text style={styles.styleSectionSubtitle}>
                  スワイプで言語の多様性を探索しよう！
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
                    <Text style={styles.swipeHintText}>← 16種類をスワイプで探索 →</Text>
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
                    )).slice(0, 16)} {/* 最初の16個表示 */}
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
                    <View style={styles.resultStats}>
                      <Text style={styles.resultStatsText}>
                        出力: {rephraseResult.length}/{MAX_OUTPUT_LENGTH}文字
                      </Text>
                    </View>
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
            <Animated.View style={{ transform: [{ scale: isLoading ? pulseAnim : 1 }] }}>
              <TouchableOpacity
                style={[
                  styles.rephraseButton, 
                  (isLoading || isInputOverLimit()) && styles.disabledButton
                ]}
                onPress={handleRephrase}
                disabled={isLoading || isInputOverLimit()}
                activeOpacity={0.8}
              >
                <LinearGradient colors={['#8B5CF6', '#EC4899']} style={styles.buttonGradient}>
                  {isLoading
                    ? <ActivityIndicator color="#fff" size="small" />
                    : <Send size={20} color="#fff" />
                  }
                  <Text style={styles.rephraseButtonText}>
                    {isLoading ? '変換中...' : '✨ 文化記号変換'}
                  </Text>
                  {!isPro && (
                    <Text style={styles.countText}>
                      ({rephraseCount}/5)
                    </Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>

        <ShareModal
          visible={showShareModal}
          onClose={() => setShowShareModal(false)}
          rephraseText={rephraseResult}
          style={selectedStyle?.id || 'meigen-empty'}
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
    marginBottom: 24,
  },
  inputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: { 
    fontSize: 18, 
    fontFamily: 'Inter-SemiBold', 
    color: '#1f2937'
  },
  charCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  charCount: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6b7280',
  },
  charCountOver: {
    color: '#ef4444',
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
  textInputOver: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  charLimitWarning: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#ef4444',
    marginTop: 8,
  },
  selectedStyleInfo: {
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  selectedStyleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  selectedStyleEmoji: {
    fontSize: 20,
  },
  selectedStyleName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1e40af',
    flex: 1,
  },
  selectedStyleDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#1e40af',
    opacity: 0.8,
    lineHeight: 20,
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
    borderRadius: 16,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    minHeight: 140,
  },
  selectedStyleCard: {
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
    borderColor: 'transparent',
    transform: [{ scale: 1.05 }],
  },
  proStyleCard: {
    opacity: 0.7,
    position: 'relative',
  },
  proLockOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 12,
    padding: 4,
    zIndex: 1,
  },
  proStyleText: {
    opacity: 0.7,
  },
  styleCardContent: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    position: 'relative',
  },
  styleEmoji: {
    fontSize: 28,
    marginBottom: 6,
  },
  styleCardTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  styleCardDescription: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 14,
    marginBottom: 6,
  },
  categoryBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 9,
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
    gap: 4,
    flexWrap: 'wrap',
  },
  indicatorDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
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
    marginBottom: 12, 
    padding: 16, 
    backgroundColor: '#f9fafb', 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: '#e5e7eb' 
  },
  resultStats: {
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  resultStatsText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6b7280',
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
    opacity: 0.5 
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
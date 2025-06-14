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
  Dimensions,
  KeyboardAvoidingView,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Send, Sparkles, Crown, Share2, CircleAlert as AlertCircle } from 'lucide-react-native';
import { useSettings } from '@/hooks/SettingsContext';
import { useRouter } from 'expo-router';
import { ShareModal } from '@/components/ShareModal';
import { getActiveStyles, getStyleById } from '@/config/styles';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const GRID_COLUMNS = 4;
const CARD_MARGIN = 8;
const CARD_WIDTH = (screenWidth - 40 - (CARD_MARGIN * 2 * GRID_COLUMNS)) / GRID_COLUMNS;

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
  
  // アニメーション用
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const cardAnimations = useRef(Array(16).fill(0).map(() => new Animated.Value(1))).current;

  const activeStyles = getActiveStyles(isPro);
  const selectedStyle = activeStyles[selectedStyleIndex];

  // 文字数カウント関数
  const getInputCharCount = () => inputText.length;
  const isInputOverLimit = () => getInputCharCount() > MAX_INPUT_LENGTH;

  const handleRephrase = async () => {
    console.log('\n🚀 === 文化記号変換プロセス開始 ===');
    
    // 文字数制限チェック
    if (isInputOverLimit()) {
      Alert.alert('文字数制限', `入力文章は${MAX_INPUT_LENGTH}文字以内にしてください。現在: ${getInputCharCount()}文字`);
      return;
    }

    // APIキーチェック
    if (!apiKey || apiKey.trim() === '') {
      Alert.alert('APIキー未設定', 'Settings画面でOpenAI APIキーを設定してください。');
      return;
    }

    // 制限チェック
    if (!isPro && rephraseCount >= 5) {
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
      Alert.alert('エラー', '文章を入力してください');
      return;
    }

    // スタイル検証
    if (!selectedStyle) {
      Alert.alert('エラー', 'スタイル選択にエラーがあります。アプリを再起動してください。');
      return;
    }

    if (!selectedStyle.prompt) {
      Alert.alert('エラー', 'スタイル設定にプロンプトが設定されていません。');
      return;
    }

    console.log('✅ スタイル:', selectedStyle.name);

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
      max_tokens: Math.min(500, MAX_OUTPUT_LENGTH * 2),
      temperature: 0.7,
    };

    setIsLoading(true);

    // ボタンアニメーション
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
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify(requestPayload),
      });

      const data = await response.json();

      if (response.ok) {
        if (!data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
          Alert.alert('エラー', 'AIからの応答形式が不正です');
          return;
        }
        
        if (!data.choices[0] || !data.choices[0].message) {
          Alert.alert('エラー', 'AIからの応答形式が不正です');
          return;
        }
        
        const messageContent = data.choices[0].message.content;
        if (!messageContent) {
          Alert.alert('エラー', 'AIからの応答内容が空です');
          return;
        }

        let result = messageContent.trim();
        
        // 文字数制限チェック（出力）
        if (result.length > MAX_OUTPUT_LENGTH) {
          result = result.substring(0, MAX_OUTPUT_LENGTH) + '...';
        }

        if (!result) {
          Alert.alert('エラー', 'AIからの応答内容が空です');
          return;
        }

        console.log('🎉 文化記号変換成功:', result);
        
        setRephraseResult(result);
        setRephraseCount(rephraseCount + 1);
        
      } else {
        console.error('API エラー:', response.status, data);
        
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
      console.error('ネットワークエラー:', error);
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
    }
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const navigateToSettings = () => {
    router.push('/settings');
  };

  const onStyleSelect = (index: number) => {
    if (index === selectedStyleIndex) return;
    
    const style = activeStyles[index];
    if (style?.isPro && !isPro) {
      handleProStylePress();
      return;
    }

    console.log('🎯 スタイル選択:', style?.name || 'undefined');
    setSelectedStyleIndex(index);

    // カード選択アニメーション
    Animated.parallel([
      // 前の選択を元に戻す
      Animated.timing(cardAnimations[selectedStyleIndex], {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      // 新しい選択をスケールアップ
      Animated.timing(cardAnimations[index], {
        toValue: 1.08,
        duration: 200,
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

  const renderStyleGrid = () => {
    const rows = [];
    for (let i = 0; i < Math.ceil(activeStyles.length / GRID_COLUMNS); i++) {
      const rowStyles = activeStyles.slice(i * GRID_COLUMNS, (i + 1) * GRID_COLUMNS);
      rows.push(
        <View key={i} style={styles.gridRow}>
          {rowStyles.map((style, colIndex) => {
            const index = i * GRID_COLUMNS + colIndex;
            const isSelected = selectedStyleIndex === index;
            const isProStyle = style.isPro && !isPro;
            
            return (
              <Animated.View
                key={style.id}
                style={[
                  styles.gridCard,
                  { transform: [{ scale: cardAnimations[index] }] }
                ]}
              >
                <TouchableOpacity
                  style={[
                    styles.styleGridCard,
                    isSelected && styles.selectedGridCard,
                    { backgroundColor: isSelected ? style.color : '#ffffff' },
                    isProStyle && styles.proGridCard
                  ]}
                  onPress={() => onStyleSelect(index)}
                  activeOpacity={0.8}
                >
                  {isProStyle && (
                    <View style={styles.proLockBadge}>
                      <Crown size={12} color="#F59E0B" />
                    </View>
                  )}
                  <Text style={styles.gridEmoji}>{style.emoji}</Text>
                  <Text style={[
                    styles.gridTitle,
                    { color: isSelected ? '#ffffff' : '#1f2937' },
                    isProStyle && styles.proStyleText
                  ]}>{style.name}</Text>
                  
                  {/* カテゴリーバッジ */}
                  <View style={[
                    styles.gridCategoryBadge,
                    { backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : '#f3f4f6' }
                  ]}>
                    <Text style={[
                      styles.gridCategoryText,
                      { color: isSelected ? '#ffffff' : '#6b7280' }
                    ]}>
                      {style.category === 'political' ? '政治' :
                       style.category === 'literary' ? '文学' :
                       style.category === 'social' ? 'SNS' :
                       style.category === 'tech' ? '技術' :
                       style.category === 'creative' ? 'クリエイティブ' :
                       style.category === 'business' ? 'ビジネス' :
                       style.category === 'pro' ? 'Pro版' : '楽しい'}
                    </Text>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>
      );
    }
    return rows;
  };

  const remainingCount = Math.max(0, 5 - rephraseCount);
  const showLimitWarning = !isPro && rephraseCount >= 4;

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#667eea', '#764ba2', '#f093fb']} style={styles.container}>
        {/* ヘッダー - コンパクト */}
        <View style={styles.header}>
          <Text style={styles.title}>コトバクラフト</Text>
          <Text style={styles.subtitle}>16種の文化記号で言語遊び</Text>
          
          {/* プラン表示 - ミニマル */}
          <View style={styles.planIndicator}>
            {isPro ? (
              <View style={styles.proIndicator}>
                <Crown size={14} color="#F59E0B" />
                <Text style={styles.proText}>Pro版</Text>
              </View>
            ) : (
              <Text style={styles.freeText}>無料版: {remainingCount}回残り</Text>
            )}
          </View>
        </View>

        {/* 制限警告カード - コンパクト */}
        {!isPro && rephraseCount >= 3 && (
          <View style={styles.warningCard}>
            <View style={styles.warningContent}>
              <Crown size={16} color="#F59E0B" />
              <Text style={styles.warningText}>
                あと{remainingCount}回 - Pro版(99円/月)で無制限
              </Text>
              <TouchableOpacity onPress={navigateToSettings} style={styles.quickUpgrade}>
                <Text style={styles.quickUpgradeText}>99円</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* メインスクロールエリア */}
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.contentCard}>
            {/* コンパクト入力エリア */}
            <View style={styles.inputSection}>
              <View style={styles.inputHeader}>
                <Text style={styles.inputTitle}>文章を入力</Text>
                <View style={styles.charCountContainer}>
                  <Text style={[
                    styles.charCount,
                    isInputOverLimit() && styles.charCountOver
                  ]}>
                    {getInputCharCount()}/{MAX_INPUT_LENGTH}
                  </Text>
                  {isInputOverLimit() && (
                    <AlertCircle size={14} color="#ef4444" />
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
                numberOfLines={3}
                placeholderTextColor="#9ca3af"
                maxLength={MAX_INPUT_LENGTH + 50}
              />
              {isInputOverLimit() && (
                <Text style={styles.charLimitWarning}>
                  文字数制限を超えています
                </Text>
              )}
            </View>

            {/* 選択中スタイル表示 */}
            {selectedStyle && (
              <View style={styles.selectedStyleDisplay}>
                <View style={styles.selectedStyleHeader}>
                  <Text style={styles.selectedStyleEmoji}>{selectedStyle.emoji}</Text>
                  <Text style={styles.selectedStyleName}>{selectedStyle.name}</Text>
                  {selectedStyle.isPro && !isPro && (
                    <Crown size={14} color="#F59E0B" />
                  )}
                </View>
                <Text style={styles.selectedStyleDescription}>
                  {selectedStyle.description}
                </Text>
              </View>
            )}

            {/* 16種スタイルグリッド */}
            <View style={styles.styleGridSection}>
              <Text style={styles.gridSectionTitle}>16種の文化記号スタイル</Text>
              <Text style={styles.gridSectionSubtitle}>タップして言語の多様性を探索</Text>
              
              <View style={styles.styleGrid}>
                {renderStyleGrid()}
              </View>
            </View>

            {/* 変換結果表示 */}
            {rephraseResult ? (
              <View style={styles.resultSection}>
                <View style={styles.resultHeader}>
                  <Sparkles size={18} color="#667eea" />
                  <Text style={styles.resultTitle}>変換結果</Text>
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
                    <Share2 size={16} color="#764ba2" />
                    <Text style={styles.shareButtonText}>Xでシェア</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : null}
          </View>
        </ScrollView>

        {/* 固定変換ボタン - Z世代フレンドリー */}
        <View style={styles.fixedButtonContainer}>
          <Animated.View style={{ transform: [{ scale: isLoading ? pulseAnim : scaleAnim }] }}>
            <TouchableOpacity
              style={[
                styles.rephraseButton,
                (isLoading || isInputOverLimit()) && styles.disabledButton
              ]}
              onPress={handleRephrase}
              disabled={isLoading || isInputOverLimit()}
              activeOpacity={0.8}
            >
              <LinearGradient colors={['#667eea', '#764ba2']} style={styles.buttonGradient}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  header: { 
    alignItems: 'center', 
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20, 
    paddingHorizontal: 20 
  },
  title: { 
    fontSize: 32, 
    fontFamily: 'Inter-Bold', 
    color: '#fff', 
    textAlign: 'center', 
    marginBottom: 6,
    letterSpacing: 1,
  },
  subtitle: { 
    fontSize: 15, 
    fontFamily: 'Inter-Medium', 
    color: '#fff', 
    textAlign: 'center', 
    opacity: 0.9, 
    marginBottom: 12 
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
    borderRadius: 20,
    gap: 6,
  },
  proText: {
    fontSize: 13,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  freeText: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: '#ffffff',
    opacity: 0.9,
  },
  warningCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  warningContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  warningText: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: '#92400E',
    flex: 1,
  },
  quickUpgrade: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  quickUpgradeText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
  },
  scrollView: { 
    flex: 1,
  },
  contentCard: { 
    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
    marginHorizontal: 20, 
    marginBottom: 20, 
    borderRadius: 24, 
    padding: 20, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 8 }, 
    shadowOpacity: 0.15, 
    shadowRadius: 16, 
    elevation: 10 
  },
  inputSection: {
    marginBottom: 20,
  },
  inputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  inputTitle: { 
    fontSize: 16, 
    fontFamily: 'Inter-SemiBold', 
    color: '#1f2937'
  },
  charCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  charCount: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: '#6b7280',
  },
  charCountOver: {
    color: '#ef4444',
  },
  textInput: { 
    borderWidth: 2, 
    borderColor: '#e5e7eb', 
    borderRadius: 16, 
    padding: 16, 
    fontSize: 15, 
    fontFamily: 'Inter-Regular', 
    color: '#1f2937', 
    backgroundColor: '#f9fafb', 
    minHeight: 80, 
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
    marginTop: 6,
  },
  selectedStyleDisplay: {
    backgroundColor: '#f0f9ff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#bfdbfe',
  },
  selectedStyleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  selectedStyleEmoji: {
    fontSize: 18,
  },
  selectedStyleName: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#1e40af',
    flex: 1,
  },
  selectedStyleDescription: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#1e40af',
    opacity: 0.8,
    lineHeight: 18,
  },
  styleGridSection: {
    marginBottom: 24,
  },
  gridSectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 6,
  },
  gridSectionSubtitle: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  styleGrid: {
    gap: CARD_MARGIN,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: CARD_MARGIN,
  },
  gridCard: {
    width: CARD_WIDTH,
  },
  styleGridCard: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 16,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  selectedGridCard: {
    borderColor: 'transparent',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  proGridCard: {
    opacity: 0.7,
  },
  proLockBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 8,
    padding: 3,
  },
  proStyleText: {
    opacity: 0.7,
  },
  gridEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  gridTitle: {
    fontSize: 11,
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
    marginBottom: 4,
    lineHeight: 13,
  },
  gridCategoryBadge: {
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 6,
  },
  gridCategoryText: {
    fontSize: 8,
    fontFamily: 'Inter-Medium',
  },
  resultSection: {
    borderTopWidth: 2,
    borderTopColor: '#e5e7eb',
    paddingTop: 20,
  },
  resultHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8, 
    marginBottom: 16 
  },
  resultTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1f2937',
  },
  resultStyleTag: {
    marginLeft: 'auto',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#667eea',
  },
  resultStyleText: {
    fontSize: 11,
    fontFamily: 'Inter-SemiBold',
    color: '#667eea',
  },
  resultContainer: { 
    position: 'relative' 
  },
  resultText: { 
    fontSize: 15, 
    fontFamily: 'Inter-Regular', 
    color: '#1f2937', 
    lineHeight: 22, 
    marginBottom: 12, 
    padding: 16, 
    backgroundColor: '#f9fafb', 
    borderRadius: 16, 
    borderWidth: 2, 
    borderColor: '#e5e7eb' 
  },
  resultStats: {
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  resultStatsText: {
    fontSize: 11,
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
    borderRadius: 16, 
    borderWidth: 2, 
    borderColor: '#764ba2' 
  },
  shareButtonText: { 
    fontSize: 15, 
    fontFamily: 'Inter-SemiBold', 
    color: '#764ba2' 
  },
  fixedButtonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'transparent',
  },
  rephraseButton: { 
    borderRadius: 24, 
    overflow: 'hidden', 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 6 }, 
    shadowOpacity: 0.3, 
    shadowRadius: 12, 
    elevation: 8 
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
    fontFamily: 'Inter-Bold', 
    color: '#fff' 
  },
  countText: { 
    fontSize: 13, 
    fontFamily: 'Inter-Regular', 
    color: '#fff', 
    opacity: 0.8 
  },
});
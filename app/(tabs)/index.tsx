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
import { Send, Sparkles, Crown, Share2, Lock } from 'lucide-react-native';
import { useSettings } from '@/hooks/SettingsContext';
import { useRouter } from 'expo-router';
import { ShareModal } from '@/components/ShareModal';
import { getActiveStyles, getStyleById } from '@/config/styles';

const { width: screenWidth } = Dimensions.get('window');
const CARD_WIDTH = screenWidth * 0.45; // 3つ見えるように45%に調整
const CARD_SPACING = 12;

export default function RephraseScreen() {
  const { apiKey, isPro, rephraseCount, setRephraseCount } = useSettings();
  const router = useRouter();
  const [inputText, setInputText] = useState('');
  const [selectedStyleIndex, setSelectedStyleIndex] = useState(0);
  const [rephraseResult, setRephraseResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const activeStyles = getActiveStyles(isPro);
  const selectedStyle = activeStyles[selectedStyleIndex];

  // === 🔍 STEP 1: 基本情報デバッグ ===
  console.log('\n=== コトバクラフト デバッグ情報 ===');
  console.log('🔑 API Key 設定状況:', apiKey ? `設定済み (${apiKey.substring(0, 10)}...)` : '❌ 未設定');
  console.log('📊 全スタイル総数:', activeStyles.length);
  console.log('📊 アクティブスタイル配列:', activeStyles);
  console.log('📊 選択中インデックス:', selectedStyleIndex);
  console.log('📊 選択中スタイル Raw:', selectedStyle);
  
  // === 🔍 STEP 2: 選択スタイルの詳細検証 ===
  if (selectedStyle) {
    console.log('✅ 選択スタイル詳細:');
    console.log('  - ID:', selectedStyle.id);
    console.log('  - 名前:', selectedStyle.name);
    console.log('  - 説明:', selectedStyle.description);
    console.log('  - プロンプト存在:', !!selectedStyle.prompt);
    console.log('  - プロンプト長:', selectedStyle.prompt ? selectedStyle.prompt.length : 0);
    console.log('  - プロンプト内容:', selectedStyle.prompt || '❌ EMPTY');
  } else {
    console.error('❌ selectedStyle が undefined です！');
    console.error('  - selectedStyleIndex:', selectedStyleIndex);
    console.error('  - activeStyles.length:', activeStyles.length);
    console.error('  - activeStyles[0]:', activeStyles[0]);
  }

  const handleRephrase = async () => {
    console.log('\n🚀 === 言語生成プロセス開始 ===');
    
    // === 🔍 STEP 3: 入力検証（詳細） ===
    console.log('📋 Step 1: 入力データ検証');
    console.log('  - APIキー:', apiKey ? `✅ 設定済み (${apiKey.length}文字)` : '❌ 未設定');
    console.log('  - Pro状態:', isPro ? '✅ Pro版' : '📱 無料版');
    console.log('  - 利用回数:', `${rephraseCount}/5`);
    console.log('  - 入力文章:', inputText ? `✅ "${inputText}"` : '❌ 空');
    console.log('  - 選択スタイル:', selectedStyle ? `✅ ${selectedStyle.name}` : '❌ 未選択');

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
        '5回までの無料利用が完了しました。有料版にアップグレードして続けて利用できます。',
        [
          { text: 'キャンセル', style: 'cancel' },
          { text: '有料版にアップグレード', onPress: () => router.push('/settings') },
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

    // === 🔍 STEP 4: スタイル選択の詳細検証 ===
    console.log('\n📋 Step 2: スタイル選択詳細検証');
    
    if (!selectedStyle) {
      console.error('❌ 致命的エラー: selectedStyle が null/undefined');
      console.error('  デバッグ情報:');
      console.error('  - selectedStyleIndex:', selectedStyleIndex);
      console.error('  - activeStyles:', activeStyles);
      console.error('  - activeStyles.length:', activeStyles.length);
      Alert.alert('エラー', 'スタイル選択にエラーがあります。アプリを再起動してください。');
      return;
    }

    console.log('✅ スタイル選択検証完了:');
    console.log('  - スタイルID:', selectedStyle.id);
    console.log('  - スタイル名:', selectedStyle.name);

    // === 🔍 STEP 5: プロンプト詳細検証 ===
    console.log('\n📋 Step 3: プロンプト詳細検証');
    
    if (!selectedStyle.prompt) {
      console.error('❌ 致命的エラー: selectedStyle.prompt が存在しません');
      console.error('  - selectedStyle:', selectedStyle);
      console.error('  - prompt プロパティ:', selectedStyle.prompt);
      Alert.alert('エラー', 'スタイル設定にプロンプトが設定されていません。');
      return;
    }

    if (selectedStyle.prompt.trim() === '') {
      console.error('❌ 致命的エラー: selectedStyle.prompt が空文字');
      console.error('  - prompt 内容:', `"${selectedStyle.prompt}"`);
      Alert.alert('エラー', 'スタイルのプロンプトが空です。');
      return;
    }

    console.log('✅ プロンプト検証完了:');
    console.log('  - プロンプト長:', selectedStyle.prompt.length);
    console.log('  - プロンプト内容:', selectedStyle.prompt);

    // === 🔍 STEP 6: メッセージ構築詳細検証 ===
    console.log('\n📋 Step 4: APIメッセージ構築');
    
    const systemMessage = 'あなたは文章を様々なスタイルで言い換える専門家です。指定されたスタイルに従って、自然で魅力的な日本語の文章に言い換えてください。元の意味を保ちながら、指定されたスタイルの特徴を明確に表現してください。';
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
      max_tokens: 500,
      temperature: 0.7,
    };

    console.log('✅ メッセージ構築完了:');
    console.log('  - システムメッセージ長:', systemMessage.length);
    console.log('  - ユーザーメッセージ長:', userMessage.length);
    console.log('  - システムメッセージ:', systemMessage);
    console.log('  - ユーザーメッセージ:', userMessage);
    
    // === 🔍 ⭐️ ここが一番重要：messages配列の詳細確認 ⭐️ ===
    console.log('\n🔍 === MESSAGES配列詳細確認 ===');
    console.log('  - messages配列型:', Array.isArray(messages) ? 'Array' : typeof messages);
    console.log('  - messages配列長:', messages.length);
    console.log('  - messages[0] 存在:', !!messages[0]);
    console.log('  - messages[0] 詳細:', messages[0]);
    console.log('  - messages[0].role:', messages[0]?.role);
    console.log('  - messages[0].content 存在:', !!messages[0]?.content);
    console.log('  - messages[0].content 長:', messages[0]?.content?.length || 0);
    console.log('  - messages[0].content 内容:', messages[0]?.content);
    console.log('  - messages[1] 存在:', !!messages[1]);
    console.log('  - messages[1] 詳細:', messages[1]);
    console.log('  - messages[1].role:', messages[1]?.role);
    console.log('  - messages[1].content 存在:', !!messages[1]?.content);
    console.log('  - messages[1].content 長:', messages[1]?.content?.length || 0);
    console.log('  - messages[1].content 内容:', messages[1]?.content);
    
    // === 🔍 完全なペイロード確認 ===
    console.log('\n🔍 === 完全なペイロード確認 ===');
    console.log('  - requestPayload型:', typeof requestPayload);
    console.log('  - requestPayload.model:', requestPayload.model);
    console.log('  - requestPayload.messages 存在:', !!requestPayload.messages);
    console.log('  - requestPayload.messages 型:', Array.isArray(requestPayload.messages) ? 'Array' : typeof requestPayload.messages);
    console.log('  - requestPayload.messages 長:', requestPayload.messages.length);
    console.log('  - requestPayload.max_tokens:', requestPayload.max_tokens);
    console.log('  - requestPayload.temperature:', requestPayload.temperature);
    console.log('  - 完全なペイロード JSON:');
    console.log(JSON.stringify(requestPayload, null, 2));

    // === 🔍 STEP 7: API呼び出し実行 ===
    console.log('\n📋 Step 5: API呼び出し実行');
    
    setIsLoading(true);
    
    try {
      console.log('🌐 API Request 送信中...');
      console.log('  - URL: https://api.openai.com/v1/chat/completions');
      console.log('  - Method: POST');
      console.log('  - Headers: Content-Type: application/json, Authorization: Bearer [HIDDEN]');
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify(requestPayload),
      });

      console.log('📥 API Response 受信:');
      console.log('  - Status:', response.status);
      console.log('  - StatusText:', response.statusText);
      console.log('  - Headers:', Object.fromEntries(response.headers.entries()));

      const data = await response.json();
      console.log('📥 API Response Data:');
      console.log(JSON.stringify(data, null, 2));

      if (response.ok) {
        // === 🔍 STEP 8: レスポンス構造詳細検証 ===
        console.log('\n📋 Step 6: レスポンス構造検証');
        
        console.log('  - data.choices 存在:', !!data.choices);
        console.log('  - data.choices 型:', Array.isArray(data.choices) ? 'Array' : typeof data.choices);
        console.log('  - data.choices 長:', data.choices ? data.choices.length : 0);
        
        if (!data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
          console.error('❌ API Response エラー: choices が存在しないか空です');
          console.error('  - data.choices:', data.choices);
          Alert.alert('エラー', 'AIからの応答形式が不正です（choices不正）');
          return;
        }
        
        console.log('  - data.choices[0] 存在:', !!data.choices[0]);
        console.log('  - data.choices[0] 型:', typeof data.choices[0]);
        console.log('  - data.choices[0]:', data.choices[0]);
        
        if (!data.choices[0]) {
          console.error('❌ API Response エラー: choices[0] が存在しません');
          Alert.alert('エラー', 'AIからの応答形式が不正です（choices[0]不正）');
          return;
        }
        
        console.log('  - data.choices[0].message 存在:', !!data.choices[0].message);
        console.log('  - data.choices[0].message 型:', typeof data.choices[0].message);
        console.log('  - data.choices[0].message:', data.choices[0].message);
        
        if (!data.choices[0].message) {
          console.error('❌ API Response エラー: message が存在しません');
          Alert.alert('エラー', 'AIからの応答形式が不正です（message不正）');
          return;
        }
        
        const messageContent = data.choices[0].message.content;
        console.log('  - message.content 存在:', !!messageContent);
        console.log('  - message.content 型:', typeof messageContent);
        console.log('  - message.content 長:', messageContent ? messageContent.length : 0);
        console.log('  - message.content 内容:', messageContent);
        
        if (!messageContent) {
          console.error('❌ API Response エラー: message.content が存在しません');
          console.error('  - content value:', messageContent);
          Alert.alert('エラー', 'AIからの応答内容が空です');
          return;
        }

        const result = messageContent.trim();
        if (!result) {
          console.error('❌ API Response エラー: trimmed content が空です');
          console.error('  - trimmed content:', `"${result}"`);
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
        // === 🔍 エラーレスポンス詳細解析 ===
        console.error('\n❌ === API エラーレスポンス詳細解析 ===');
        console.error('  - Status:', response.status);
        console.error('  - StatusText:', response.statusText);
        console.error('  - Error Data:', data);
        
        if (response.status === 401) {
          console.error('❌ 認証エラー: APIキーが無効');
          console.error('  - 使用中のAPIキー長:', apiKey.length);
          console.error('  - APIキー開始:', apiKey.substring(0, 10));
          Alert.alert('APIキーエラー', 'APIキーが無効です。Settings画面で正しいAPIキーを設定してください。');
        } else if (response.status === 429) {
          console.error('❌ レート制限エラー');
          Alert.alert('エラー', 'APIの利用制限に達しました。しばらく時間をおいてから再試行してください。');
        } else if (response.status === 500) {
          console.error('❌ サーバーエラー');
          Alert.alert('エラー', 'OpenAIサーバーでエラーが発生しました。しばらく時間をおいてから再試行してください。');
        } else {
          console.error('❌ その他のAPIエラー');
          console.error('  - Error Message:', data.error?.message);
          console.error('  - Error Type:', data.error?.type);
          console.error('  - Error Code:', data.error?.code);
          Alert.alert('エラー', data.error?.message || `処理中にエラーが発生しました (${response.status})`);
        }
      }
    } catch (error) {
      // === 🔍 ネットワークエラー詳細解析 ===
      console.error('\n❌ === ネットワークエラー詳細解析 ===');
      console.error('  - エラータイプ:', error instanceof Error ? error.constructor.name : typeof error);
      console.error('  - エラーメッセージ:', error instanceof Error ? error.message : String(error));
      console.error('  - エラースタック:', error instanceof Error ? error.stack : 'No stack trace');
      console.error('  - エラーオブジェクト全体:', error);
      
      Alert.alert('エラー', 'ネットワークエラーが発生しました。インターネット接続を確認してください。');
    } finally {
      setIsLoading(false);
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
  };

  const handleProStylePress = () => {
    Alert.alert(
      'Pro版限定スタイル',
      'このスタイルはPro版でご利用いただけます。',
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
              <Crown size={20} color="#F59E0B" />
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
              <Text style={styles.upgradePromptText}>Pro版で無制限利用 →</Text>
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
                    )).slice(0, 10)} {/* 最初の10個だけ表示 */}
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
    marginBottom: 24,
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
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    minHeight: 160,
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
    fontSize: 32,
    marginBottom: 8,
  },
  styleCardTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  styleCardDescription: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 8,
  },
  categoryBadge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 10,
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
    gap: 6,
  },
  indicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
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
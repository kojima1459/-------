import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Clock, Copy, Trash2, Crown, Sparkles } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import { useSettings } from '@/hooks/SettingsContext';
import { useRouter } from 'expo-router';

interface HistoryItem {
  id: string;
  originalText: string;
  rephraseText: string;
  style: string;
  timestamp: Date;
}

export default function HistoryScreen() {
  const { isPro } = useSettings();
  const router = useRouter();
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    // サンプルデータ（実際のアプリでは AsyncStorage から読み込み）
    setHistory([
      {
        id: '1',
        originalText: 'こんにちは、今日はいい天気ですね。',
        rephraseText: '「今日という日は、まさに天の恵みを感じる美しい一日である」',
        style: '名言風',
        timestamp: new Date('2024-01-15T10:30:00'),
      },
      {
        id: '2',
        originalText: 'お疲れ様でした。',
        rephraseText: '心温まる優しい言葉をお届けします。今日も一日、本当にお疲れ様でした。',
        style: '柔らかい文章',
        timestamp: new Date('2024-01-15T09:15:00'),
      },
      {
        id: '3',
        originalText: '新商品が発売されました！',
        rephraseText: '革新的な新商品、ついに登場！あなたの生活を変える一品。',
        style: 'キャッチコピー風',
        timestamp: new Date('2024-01-14T16:45:00'),
      },
      {
        id: '4',
        originalText: 'みんなで頑張ろう！',
        rephraseText: 'みんなで一緒に頑張ろう！💪 きっと素敵な未来が待ってる✨ #一緒に頑張ろう',
        style: 'SNS投稿向け',
        timestamp: new Date('2024-01-14T14:20:00'),
      },
      {
        id: '5',
        originalText: 'ちょっと疲れた。',
        rephraseText: 'ちょっと疲れました。休息を取ることで、より良いパフォーマンスを発揮できます。',
        style: '文章校正',
        timestamp: new Date('2024-01-14T12:00:00'),
      },
      // 無料版では見えない履歴（ボカシ表示用）
      {
        id: '6',
        originalText: 'ありがとうございました。',
        rephraseText: '心の底から感謝を込めて...',
        style: 'メンヘラ風',
        timestamp: new Date('2024-01-13T18:30:00'),
      },
      {
        id: '7',
        originalText: 'がんばります。',
        rephraseText: '我が使命を果たすため、全力で立ち向かうのみ！',
        style: '厨二病風',
        timestamp: new Date('2024-01-13T15:20:00'),
      },
    ]);
  }, []);

  const copyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text);
    Alert.alert('コピー完了', 'クリップボードにコピーしました！');
  };

  const deleteItem = (id: string) => {
    Alert.alert(
      '削除確認',
      'この履歴を削除しますか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        { 
          text: '削除', 
          style: 'destructive',
          onPress: () => setHistory(prev => prev.filter(item => item.id !== id))
        },
      ]
    );
  };

  const formatDate = (date: Date) => {
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleUpgradePress = () => {
    router.push('/settings');
  };

  // 表示する履歴の計算
  const visibleHistory = isPro ? history : history.slice(0, 5);
  const hiddenHistory = isPro ? [] : history.slice(5);

  return (
    <LinearGradient
      colors={['#8B5CF6', '#EC4899', '#F59E0B']}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.title}>履歴</Text>
        <Text style={styles.subtitle}>過去の変換結果を確認できます</Text>
        
        {/* プラン表示 */}
        <View style={styles.planIndicator}>
          {isPro ? (
            <View style={styles.proIndicator}>
              <Crown size={16} color="#F59E0B" />
              <Text style={styles.proText}>Pro版 - 全履歴表示</Text>
            </View>
          ) : (
            <View style={styles.freeIndicator}>
              <Text style={styles.freeText}>無料版 - 最新5件まで表示</Text>
            </View>
          )}
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {visibleHistory.length === 0 ? (
          <View style={styles.emptyState}>
            <Clock size={48} color="#ffffff" style={{ opacity: 0.7 }} />
            <Text style={styles.emptyText}>まだ履歴がありません</Text>
            <Text style={styles.emptySubtext}>
              文章を変換すると、こちらに履歴が表示されます
            </Text>
          </View>
        ) : (
          <>
            {/* 表示可能な履歴 */}
            {visibleHistory.map((item) => (
              <View key={item.id} style={styles.historyCard}>
                <View style={styles.historyHeader}>
                  <View style={styles.styleTag}>
                    <Text style={styles.styleTagText}>{item.style}</Text>
                  </View>
                  <Text style={styles.timestamp}>{formatDate(item.timestamp)}</Text>
                </View>
                
                <View style={styles.textSection}>
                  <Text style={styles.label}>元の文章</Text>
                  <Text style={styles.originalText}>{item.originalText}</Text>
                </View>
                
                <View style={styles.textSection}>
                  <Text style={styles.label}>変換結果</Text>
                  <Text style={styles.rephraseText}>{item.rephraseText}</Text>
                </View>
                
                <View style={styles.actions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => copyToClipboard(item.rephraseText)}
                  >
                    <Copy size={16} color="#8B5CF6" />
                    <Text style={styles.actionButtonText}>コピー</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => deleteItem(item.id)}
                  >
                    <Trash2 size={16} color="#ef4444" />
                    <Text style={[styles.actionButtonText, styles.deleteButtonText]}>削除</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            {/* 無料版の制限表示 */}
            {!isPro && hiddenHistory.length > 0 && (
              <View style={styles.limitSection}>
                <View style={styles.limitHeader}>
                  <Crown size={24} color="#F59E0B" />
                  <Text style={styles.limitTitle}>Pro版で全履歴を表示</Text>
                </View>
                
                <Text style={styles.limitDescription}>
                  あと{hiddenHistory.length}件の履歴があります。
                  Pro版にアップグレードすると、すべての履歴を確認できます。
                </Text>
                
                {/* ボカシ表示の履歴プレビュー */}
                <View style={styles.blurredSection}>
                  {hiddenHistory.slice(0, 2).map((item) => (
                    <View key={item.id} style={[styles.historyCard, styles.blurredCard]}>
                      <View style={styles.blurredOverlay}>
                        <Crown size={32} color="#F59E0B" />
                        <Text style={styles.blurredText}>Pro版で表示</Text>
                      </View>
                      <View style={styles.historyHeader}>
                        <View style={styles.styleTag}>
                          <Text style={styles.styleTagText}>{item.style}</Text>
                        </View>
                        <Text style={styles.timestamp}>{formatDate(item.timestamp)}</Text>
                      </View>
                      <View style={styles.textSection}>
                        <Text style={styles.label}>元の文章</Text>
                        <Text style={styles.originalText}>{item.originalText}</Text>
                      </View>
                      <View style={styles.textSection}>
                        <Text style={styles.label}>変換結果</Text>
                        <Text style={styles.rephraseText}>{item.rephraseText}</Text>
                      </View>
                    </View>
                  ))}
                </View>
                
                <TouchableOpacity style={styles.upgradeButton} onPress={handleUpgradePress}>
                  <LinearGradient colors={['#8B5CF6', '#EC4899']} style={styles.upgradeButtonGradient}>
                    <Crown size={18} color="#ffffff" />
                    <Text style={styles.upgradeButtonText}>Pro版にアップグレード</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 32,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#ffffff',
    textAlign: 'center',
    opacity: 0.9,
    marginBottom: 16,
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
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#ffffff',
    textAlign: 'center',
    opacity: 0.8,
  },
  historyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  styleTag: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#8B5CF6',
  },
  styleTagText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#8B5CF6',
  },
  timestamp: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
  },
  textSection: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1f2937',
    marginBottom: 8,
  },
  originalText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#4b5563',
    lineHeight: 20,
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  rephraseText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#1f2937',
    lineHeight: 20,
    padding: 12,
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#8B5CF6',
  },
  deleteButton: {
    borderColor: '#ef4444',
  },
  actionButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#8B5CF6',
  },
  deleteButtonText: {
    color: '#ef4444',
  },
  limitSection: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  limitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  limitTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1f2937',
  },
  limitDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 20,
  },
  blurredSection: {
    position: 'relative',
    marginBottom: 20,
  },
  blurredCard: {
    position: 'relative',
    opacity: 0.6,
  },
  blurredOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    gap: 8,
  },
  blurredText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#F59E0B',
  },
  upgradeButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  upgradeButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 8,
  },
  upgradeButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
});
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Clock, Copy, Trash2 } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';

interface HistoryItem {
  id: string;
  originalText: string;
  rephraseText: string;
  style: string;
  timestamp: Date;
}

export default function HistoryScreen() {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    // In a real app, load history from AsyncStorage
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
        rephraseText: 'お疲れ様でございました。本日は誠にありがとうございました。',
        style: '敬語風',
        timestamp: new Date('2024-01-15T09:15:00'),
      },
    ]);
  }, []);

  const copyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text);
  };

  const deleteItem = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
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

  return (
    <LinearGradient
      colors={['#8B5CF6', '#EC4899', '#F59E0B']}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.title}>履歴</Text>
        <Text style={styles.subtitle}>過去の言い換え結果を確認できます</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {history.length === 0 ? (
          <View style={styles.emptyState}>
            <Clock size={48} color="#ffffff" style={{ opacity: 0.7 }} />
            <Text style={styles.emptyText}>まだ履歴がありません</Text>
            <Text style={styles.emptySubtext}>
              文章を言い換えると、こちらに履歴が表示されます
            </Text>
          </View>
        ) : (
          history.map((item) => (
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
                <Text style={styles.label}>言い換え結果</Text>
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
          ))
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
});
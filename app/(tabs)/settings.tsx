import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
  Platform,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Key, Globe, Palette, Info, Crown, X, Hash, Shield, FileText, Mail } from 'lucide-react-native';
import { useSettings } from '@/hooks/SettingsContext';

export default function SettingsScreen() {
  const { 
    apiKey: contextApiKey, 
    setApiKey: setContextApiKey,
    isPro,
    setIsPro,
    rephraseCount,
    resetDailyCount,
    shareTagsEnabled,
    setShareTagsEnabled,
    lpLinkEnabled,
    setLpLinkEnabled,
    darkModeEnabled,
    setDarkModeEnabled,
    saveHistoryEnabled,
    setSaveHistoryEnabled
  } = useSettings();
  const [localApiKey, setLocalApiKey] = useState('');

  useEffect(() => {
    setLocalApiKey(contextApiKey);
  }, [contextApiKey]);

  const handleSaveSettings = () => {
    if (localApiKey.trim()) {
      setContextApiKey(localApiKey.trim());
      Alert.alert('設定保存', 'APIキーが保存されました');
    } else {
      Alert.alert('エラー', 'APIキーを入力してください');
    }
  };

  const handleUpgradePress = () => {
    if (!isPro) {
      Alert.alert(
        '有料版にアップグレード',
        'Pro版では無制限に言い換え機能をご利用いただけます。\n\n※現在はデモ版のため、実際の課金は発生しません。',
        [
          { text: 'キャンセル', style: 'cancel' },
          { 
            text: 'アップグレード', 
            onPress: () => {
              setIsPro(true);
              resetDailyCount();
              Alert.alert('🎉 アップグレード完了', 'Pro版へのアップグレードが完了しました！\n無制限に言い換え機能をお使いいただけます。');
            }
          },
        ]
      );
    } else {
      Alert.alert(
        'Pro版をキャンセル',
        'Pro版を解約して無料版に戻りますか？\n\n※無料版では1日5回までの制限があります。',
        [
          { text: 'キャンセル', style: 'cancel' },
          { 
            text: '解約する', 
            style: 'destructive',
            onPress: () => {
              setIsPro(false);
              Alert.alert('解約完了', '無料版に戻りました。\n1日5回までの制限が適用されます。');
            }
          },
        ]
      );
    }
  };

  const handleClearHistory = () => {
    Alert.alert(
      '履歴削除',
      '全ての履歴を削除しますか？この操作は取り消せません。',
      [
        { text: 'キャンセル', style: 'cancel' },
        { text: '削除', style: 'destructive', onPress: () => {} },
      ]
    );
  };

  const handleContactPress = () => {
    const email = 'support@rephrase-master.app';
    const subject = 'お問い合わせ - Rephrase Master';
    const body = 'お問い合わせ内容をこちらにご記入ください。';
    
    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    Linking.openURL(mailtoUrl).catch(() => {
      Alert.alert('エラー', 'メールアプリを開けませんでした。\n\n直接こちらまでご連絡ください：\n' + email);
    });
  };

  const SettingSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  const SettingRow = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    rightComponent,
    disabled = false 
  }: { 
    icon: React.ReactNode; 
    title: string; 
    subtitle?: string; 
    onPress?: () => void;
    rightComponent?: React.ReactNode;
    disabled?: boolean;
  }) => (
    <TouchableOpacity 
      style={[styles.settingRow, disabled && styles.disabledRow]} 
      onPress={onPress}
      disabled={disabled}
    >
      <View style={styles.settingLeft}>
        <View style={[styles.iconContainer, disabled && styles.disabledIconContainer]}>
          {icon}
        </View>
        <View style={styles.settingContent}>
          <Text style={[styles.settingTitle, disabled && styles.disabledText]}>{title}</Text>
          {subtitle && <Text style={[styles.settingSubtitle, disabled && styles.disabledText]}>{subtitle}</Text>}
        </View>
      </View>
      {rightComponent}
    </TouchableOpacity>
  );

  return (
    <LinearGradient
      colors={['#8B5CF6', '#EC4899', '#F59E0B']}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.title}>設定</Text>
        <Text style={styles.subtitle}>アプリの設定をカスタマイズ</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <SettingSection title="プラン">
          <View style={styles.card}>
            <View style={styles.planContainer}>
              <View style={styles.planHeader}>
                <View style={styles.planInfo}>
                  <View style={styles.planIconContainer}>
                    <Crown size={24} color={isPro ? '#F59E0B' : '#6b7280'} />
                  </View>
                  <View>
                    <Text style={styles.planTitle}>
                      {isPro ? 'Pro版' : '無料版'}
                    </Text>
                    <Text style={styles.planSubtitle}>
                      {isPro 
                        ? '無制限に利用可能' 
                        : `${rephraseCount}/5回 利用済み`
                      }
                    </Text>
                  </View>
                </View>
                {isPro && (
                  <View style={styles.proBadge}>
                    <Text style={styles.proBadgeText}>PRO</Text>
                  </View>
                )}
              </View>
              
              <TouchableOpacity 
                style={[
                  styles.upgradeButton, 
                  isPro && styles.cancelButton
                ]} 
                onPress={handleUpgradePress}
              >
                <LinearGradient
                  colors={isPro ? ['#ef4444', '#dc2626'] : ['#8B5CF6', '#EC4899']}
                  style={styles.upgradeButtonGradient}
                >
                  {isPro ? (
                    <X size={18} color="#ffffff" />
                  ) : (
                    <Crown size={18} color="#ffffff" />
                  )}
                  <Text style={styles.upgradeButtonText}>
                    {isPro ? 'Pro版をキャンセル' : '有料版にアップグレード'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </SettingSection>

        <SettingSection title="API設定">
          <View style={styles.card}>
            <View style={styles.inputContainer}>
              <View style={styles.inputHeader}>
                <Key size={20} color="#8B5CF6" />
                <Text style={styles.inputLabel}>OpenAI API Key</Text>
              </View>
              <TextInput
                style={styles.textInput}
                placeholder="sk-..."
                value={localApiKey}
                onChangeText={setLocalApiKey}
                secureTextEntry
                placeholderTextColor="#9ca3af"
              />
              <Text style={styles.inputHelp}>
                OpenAI APIキーを設定してください。設定しない場合は制限があります。
              </Text>
              <TouchableOpacity style={styles.saveApiKeyButton} onPress={handleSaveSettings}>
                <Text style={styles.saveApiKeyButtonText}>APIキーを保存</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SettingSection>

        <SettingSection title="SNSシェア設定">
          <View style={styles.card}>
            <SettingRow
              icon={<Hash size={20} color="#8B5CF6" />}
              title="ハッシュタグ付与"
              subtitle={isPro 
                ? "Pro版特典: ハッシュタグの表示を制御可能" 
                : "無料版ではハッシュタグが自動で付与されます"
              }
              rightComponent={
                isPro ? (
                  <Switch
                    value={shareTagsEnabled}
                    onValueChange={setShareTagsEnabled}
                    trackColor={{ false: '#e5e7eb', true: '#8B5CF6' }}
                    thumbColor={shareTagsEnabled ? '#ffffff' : '#f4f3f4'}
                  />
                ) : (
                  <View style={styles.lockedIndicator}>
                    <Crown size={16} color="#F59E0B" />
                    <Text style={styles.lockedText}>Pro版</Text>
                  </View>
                )
              }
            />
            
            <View style={styles.separator} />
            
            <SettingRow
              icon={<Globe size={20} color="#8B5CF6" />}
              title="リンク付与"
              subtitle={isPro 
                ? "Pro版特典: Webサイトリンクの表示を制御可能" 
                : "無料版ではWebサイトリンクが自動で付与されます"
              }
              rightComponent={
                isPro ? (
                  <Switch
                    value={lpLinkEnabled}
                    onValueChange={setLpLinkEnabled}
                    trackColor={{ false: '#e5e7eb', true: '#8B5CF6' }}
                    thumbColor={lpLinkEnabled ? '#ffffff' : '#f4f3f4'}
                  />
                ) : (
                  <View style={styles.lockedIndicator}>
                    <Crown size={16} color="#F59E0B" />
                    <Text style={styles.lockedText}>Pro版</Text>
                  </View>
                )
              }
            />

            {!isPro && (
              <View style={styles.upgradeHint}>
                <Text style={styles.upgradeHintText}>
                  Pro版にアップグレードすると、SNSシェア時のハッシュタグとリンクの表示をカスタマイズできます。
                </Text>
                <TouchableOpacity style={styles.upgradeHintButton} onPress={handleUpgradePress}>
                  <Text style={styles.upgradeHintButtonText}>アップグレード</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </SettingSection>

        {/* Pro版専用設定 */}
        <SettingSection title="Pro版専用設定">
          <View style={styles.card}>
            <SettingRow
              icon={<Palette size={20} color={isPro ? "#8B5CF6" : "#9ca3af"} />}
              title="ダークモード"
              subtitle={isPro ? "外観を暗いテーマに変更" : "Pro版でご利用いただけます"}
              disabled={!isPro}
              rightComponent={
                isPro ? (
                  <Switch
                    value={darkModeEnabled}
                    onValueChange={setDarkModeEnabled}
                    trackColor={{ false: '#e5e7eb', true: '#8B5CF6' }}
                    thumbColor={darkModeEnabled ? '#ffffff' : '#f4f3f4'}
                  />
                ) : (
                  <View style={styles.lockedIndicator}>
                    <Crown size={16} color="#F59E0B" />
                    <Text style={styles.lockedText}>Pro版</Text>
                  </View>
                )
              }
            />
            
            <View style={styles.separator} />
            
            <SettingRow
              icon={<Info size={20} color={isPro ? "#8B5CF6" : "#9ca3af"} />}
              title="履歴を保存"
              subtitle={isPro ? "言い換え履歴をデバイスに保存" : "Pro版でご利用いただけます"}
              disabled={!isPro}
              rightComponent={
                isPro ? (
                  <Switch
                    value={saveHistoryEnabled}
                    onValueChange={setSaveHistoryEnabled}
                    trackColor={{ false: '#e5e7eb', true: '#8B5CF6' }}
                    thumbColor={saveHistoryEnabled ? '#ffffff' : '#f4f3f4'}
                  />
                ) : (
                  <View style={styles.lockedIndicator}>
                    <Crown size={16} color="#F59E0B" />
                    <Text style={styles.lockedText}>Pro版</Text>
                  </View>
                )
              }
            />

            {!isPro && (
              <View style={styles.upgradeHint}>
                <Text style={styles.upgradeHintText}>
                  Pro版では、ダークモードや履歴保存などの高度な設定をご利用いただけます。
                </Text>
                <TouchableOpacity style={styles.upgradeHintButton} onPress={handleUpgradePress}>
                  <Text style={styles.upgradeHintButtonText}>アップグレード</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </SettingSection>

        <SettingSection title="アクション">
          <View style={styles.card}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.dangerButton]} 
              onPress={handleClearHistory}
            >
              <Text style={[styles.actionButtonText, styles.dangerButtonText]}>
                履歴を全て削除
              </Text>
            </TouchableOpacity>
          </View>
        </SettingSection>

        <SettingSection title="サポート">
          <View style={styles.card}>
            <SettingRow
              icon={<FileText size={20} color="#8B5CF6" />}
              title="利用規約"
              subtitle="サービス利用に関する規約"
              rightComponent={<Text style={styles.chevron}>›</Text>}
              onPress={() => Alert.alert('利用規約', '利用規約の内容がここに表示されます。')}
            />
            
            <View style={styles.separator} />
            
            <SettingRow
              icon={<Shield size={20} color="#8B5CF6" />}
              title="プライバシーポリシー"
              subtitle="個人情報の取り扱いについて"
              rightComponent={<Text style={styles.chevron}>›</Text>}
              onPress={() => Alert.alert('プライバシーポリシー', 'プライバシーポリシーの内容がここに表示されます。')}
            />
            
            <View style={styles.separator} />
            
            <SettingRow
              icon={<Mail size={20} color="#8B5CF6" />}
              title="お問い合わせ"
              subtitle="サポートチームに連絡"
              rightComponent={<Text style={styles.chevron}>›</Text>}
              onPress={handleContactPress}
            />
          </View>
        </SettingSection>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Rephrase Master v1.0.0</Text>
          <Text style={styles.footerText}>Powered by OpenAI GPT-4</Text>
        </View>
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
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
    marginBottom: 12,
    opacity: 0.9,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  planContainer: {
    marginBottom: 4,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  planInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  planIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  planTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1f2937',
    marginBottom: 2,
  },
  planSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
  },
  proBadge: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  proBadgeText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
  },
  upgradeButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cancelButton: {
    // Additional styles for cancel button if needed
  },
  upgradeButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 8,
  },
  upgradeButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  inputContainer: {
    marginBottom: 4,
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1f2937',
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
    marginBottom: 8,
  },
  inputHelp: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
    lineHeight: 16,
    marginBottom: 16,
  },
  saveApiKeyButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveApiKeyButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  disabledRow: {
    opacity: 0.5,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  disabledIconContainer: {
    backgroundColor: '#f9fafb',
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#1f2937',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
  },
  disabledText: {
    color: '#9ca3af',
  },
  chevron: {
    fontSize: 18,
    color: '#9ca3af',
    fontFamily: 'Inter-Regular',
  },
  separator: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 4,
  },
  lockedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  lockedText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#92400E',
  },
  upgradeHint: {
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  upgradeHintText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#1e40af',
    lineHeight: 16,
    marginBottom: 8,
  },
  upgradeHintButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  upgradeHintButtonText: {
    fontSize: 11,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  actionButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  dangerButton: {
    backgroundColor: '#ef4444',
    marginBottom: 0,
  },
  actionButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  dangerButtonText: {
    color: '#ffffff',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#ffffff',
    opacity: 0.7,
    marginBottom: 4,
  },
});
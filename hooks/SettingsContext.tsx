import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SettingsContextType {
  apiKey: string;
  setApiKey: (key: string) => void;
  isPro: boolean;
  setIsPro: (isPro: boolean) => void;
  rephraseCount: number;
  setRephraseCount: (count: number) => void;
  resetDailyCount: () => void;
  shareTagsEnabled: boolean;
  setShareTagsEnabled: (enabled: boolean) => void;
  lpLinkEnabled: boolean;
  setLpLinkEnabled: (enabled: boolean) => void;
  darkModeEnabled: boolean;
  setDarkModeEnabled: (enabled: boolean) => void;
  saveHistoryEnabled: boolean;
  setSaveHistoryEnabled: (enabled: boolean) => void;
  // 新しい設定項目
  customHashtags: string[];
  setCustomHashtags: (hashtags: string[]) => void;
  customLink: string;
  setCustomLink: (link: string) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

interface SettingsProviderProps {
  children: ReactNode;
}

export function SettingsProvider({ children }: SettingsProviderProps) {
  const [apiKey, setApiKey] = useState<string>('');
  const [isPro, setIsPro] = useState<boolean>(false);
  const [rephraseCount, setRephraseCount] = useState<number>(0);
  const [shareTagsEnabled, setShareTagsEnabled] = useState<boolean>(true);
  const [lpLinkEnabled, setLpLinkEnabled] = useState<boolean>(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState<boolean>(false);
  const [saveHistoryEnabled, setSaveHistoryEnabled] = useState<boolean>(true);
  const [customHashtags, setCustomHashtags] = useState<string[]>([]);
  const [customLink, setCustomLink] = useState<string>('https://rephrase-master.com');

  const resetDailyCount = () => {
    setRephraseCount(0);
  };

  return (
    <SettingsContext.Provider value={{ 
      apiKey, 
      setApiKey, 
      isPro, 
      setIsPro, 
      rephraseCount, 
      setRephraseCount,
      resetDailyCount,
      shareTagsEnabled,
      setShareTagsEnabled,
      lpLinkEnabled,
      setLpLinkEnabled,
      darkModeEnabled,
      setDarkModeEnabled,
      saveHistoryEnabled,
      setSaveHistoryEnabled,
      customHashtags,
      setCustomHashtags,
      customLink,
      setCustomLink
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
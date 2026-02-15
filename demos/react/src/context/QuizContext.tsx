import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { sampleDataList, defaultSampleDataId, getSampleDataById } from '@quizerjs/sample-data';
import { dslToBlock } from '@quizerjs/core';
import type { QuizDSL } from '@quizerjs/dsl';
import { useTheme } from '../hooks/useTheme';
import type { QuizLocalization } from '@quizerjs/core';
import { zhCN, enUS, jaJP, koKR, esES, deDE, frFR } from '@quizerjs/i18n';

const availableLocales: Record<string, { label: string; data: QuizLocalization }> = {
  'zh-CN': { label: '🇨🇳 中文', data: zhCN },
  'en-US': { label: '🇺🇸 English', data: enUS },
  'ja-JP': { label: '🇯🇵 日本語', data: jaJP },
  'ko-KR': { label: '🇰🇷 한국어', data: koKR },
  'es-ES': { label: '🇪🇸 Español', data: esES },
  'de-DE': { label: '🇩🇪 Deutsch', data: deDE },
  'fr-FR': { label: '🇫🇷 Français', data: frFR },
};

interface QuizContextType {
  // Data
  initialDSL: QuizDSL;
  currentDSL: QuizDSL;
  blockDataPreview: string;
  dslPreview: string;
  selectedSampleId: string;

  // Actions
  setDSL: (dsl: QuizDSL) => void;
  updatePreviews: (dsl: QuizDSL, blockData?: any) => void;
  setSelectedSampleId: (id: string) => void;

  // Theme
  isDark: boolean;
  toggleTheme: () => void;

  // L10n
  localeKey: string;
  locale: QuizLocalization;
  setLocaleKey: (key: string) => void;
  availableLocales: Record<string, { label: string; data: QuizLocalization }>;
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

export function QuizProvider({ children }: { children: React.ReactNode }) {
  const [selectedSampleId, setSelectedSampleId] = useState<string>(defaultSampleDataId);
  const [dslPreview, setDslPreview] = useState<string>('');
  const [blockDataPreview, setBlockDataPreview] = useState<string>('');

  // initialDSL: The stable source loaded from sample data. Used to initialize the Editor.
  const [initialDSL, setInitialDSL] = useState<QuizDSL>(() => {
    return getSampleDataById(defaultSampleDataId) || sampleDataList[0].dsl;
  });

  // currentDSL: The live state, including unsaved edits. Used for Previews/Player.
  const [currentDSL, setCurrentDSL] = useState<QuizDSL>(() => {
    return getSampleDataById(defaultSampleDataId) || sampleDataList[0].dsl;
  });

  const [localeKey, setLocaleKey] = useState<string>('zh-CN');
  const locale = availableLocales[localeKey].data;

  const { isDark, toggleTheme } = useTheme();

  // Load initial sample data
  useEffect(() => {
    const dsl = getSampleDataById(selectedSampleId);
    if (dsl) {
      setInitialDSL(dsl);
      setCurrentDSL(dsl);
      setDslPreview(JSON.stringify(dsl, null, 2));
      const blockData = dslToBlock(dsl);
      setBlockDataPreview(JSON.stringify(blockData, null, 2));
    }
  }, [selectedSampleId]);

  const updatePreviews = useCallback((dsl: QuizDSL, blockData?: any) => {
    setCurrentDSL(dsl);
    setDslPreview(JSON.stringify(dsl, null, 2));
    if (blockData) {
      setBlockDataPreview(JSON.stringify(blockData, null, 2));
    }
  }, []);

  const value = useMemo(
    () => ({
      initialDSL,
      currentDSL,
      blockDataPreview,
      dslPreview,
      selectedSampleId,
      setDSL: setCurrentDSL,
      updatePreviews,
      setSelectedSampleId,
      isDark,
      toggleTheme,
      localeKey,
      locale,
      setLocaleKey,
      availableLocales,
    }),
    [
      initialDSL,
      currentDSL,
      blockDataPreview,
      dslPreview,
      selectedSampleId,
      updatePreviews,
      isDark,
      toggleTheme,
      localeKey,
    ]
  );

  return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>;
}

export function useQuiz() {
  const context = useContext(QuizContext);
  if (context === undefined) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
}

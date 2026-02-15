import type { QuizLocalization } from './types';

/**
 * L10nService - 全局本地化服务
 *
 * 服务模式：顶层配置一次，组件内部直接消费。
 * 避免通过 props/attributes 层层透传。
 *
 * 用法：
 *   // 顶层（QuizEditor/QuizPlayer 初始化时）
 *   L10nService.configure(zhCN);
 *
 *   // 任意组件内部
 *   const t = L10nService.t;
 *   t.player.submitButton; // => '提交答案'
 */

/** 空占位：所有字段返回空字符串 */
const EMPTY_LOCALIZATION: QuizLocalization = {
  quiz: { defaultTitle: '' },
  section: { defaultTitle: '' },
  player: {
    submitButton: '',
    submitting: '',
    submitted: '',
    resultTitle: '',
    loading: '',
    passed: '',
    failed: '',
    passingScoreTemplate: '',
    scoreTemplate: '',
    durationLabel: '',
    completedAtLabel: '',
    detailsTitle: '',
    questionNumberTemplate: '',
    correct: '',
    incorrect: '',
    yourAnswer: '',
    notAnswered: '',
    correctAnswer: '',
    explanation: '',
    minutes: '',
    seconds: '',
    completed: '',
    answered: '',
    unanswered: '',
    totalQuestions: '',
    incompleteWarningTemplate: '',
    quizIntroTemplate: '',
    pointsUnit: '',
  },
  editor: {
    addOption: '',
    noOptionsHint: '',
    deleteOption: '',
    optionPlaceholder: '',
    descriptionPlaceholder: '',
    titlePlaceholder: '',
    correctAnswerLabel: '',
    singleChoiceTitle: '',
    multipleChoiceTitle: '',
    textInputTitle: '',
    trueFalseTitle: '',
    boolTrue: '',
    boolFalse: '',
    singleChoiceSettings: '',
    multipleChoiceSettings: '',
    textInputSettings: '',
    trueFalseSettings: '',
    singleChoiceDescription: '',
    multipleChoiceDescription: '',
    textInputDescription: '',
    trueFalseDescription: '',
  },
};

class L10nServiceImpl {
  private _localization: QuizLocalization = EMPTY_LOCALIZATION;
  private _configured = false;

  /**
   * 配置本地化。在应用初始化时调一次。
   */
  configure(localization: QuizLocalization): void {
    this._localization = localization;
    this._configured = true;
  }

  /**
   * 获取当前本地化配置。
   * 如果未配置，返回空占位并输出警告（仅首次）。
   */
  get t(): QuizLocalization {
    if (!this._configured) {
      console.warn(
        '[L10nService] Not configured. Call L10nService.configure() at initialization. Using empty placeholders.'
      );
      this._configured = true; // 只警告一次
    }
    return this._localization;
  }

  /**
   * 模板替换工具函数。
   * L10nService.fmt(t.player.questionNumberTemplate, { n: 3 })
   * => "第 3 题" / "Q3"
   */
  fmt(template: string, vars: Record<string, string | number>): string {
    return template.replace(/\{(\w+)\}/g, (_, key) => String(vars[key] ?? `{${key}}`));
  }

  /**
   * 重置（仅用于测试）
   */
  reset(): void {
    this._localization = EMPTY_LOCALIZATION;
    this._configured = false;
  }
}

export const L10nService = new L10nServiceImpl();

<template>
  <Splitpanes horizontal class="default-theme">
    <Pane :size="60" :min-size="20">
      <div class="preview-section">
        <div class="section-header">
          <span class="section-title">Player</span>
        </div>
        <div class="section-content">
          <QuizPlayer
            v-if="currentDSL && isValidDSL"
            :key="dslKey"
            :quiz="currentDSL!"
            :show-results="true"
            @submit="handlePlayerSubmit"
            @answer-change="handleAnswerChange"
            @error="handlePlayerError"
          />
          <div v-else class="player-placeholder">
            <div
              v-if="!props.dslPreview || props.dslPreview.trim() === ''"
              class="placeholder-content"
            >
              <p>等待 DSL 数据...</p>
            </div>
            <div v-else class="error-content">
              <p class="error-title">❌ DSL 数据格式无效</p>
              <p class="error-detail" v-if="dslError">{{ dslError }}</p>
              <div class="debug-info">
                <p><strong>调试信息:</strong></p>
                <ul>
                  <li>currentDSL: {{ currentDSL ? '存在' : 'null' }}</li>
                  <li>isValidDSL: {{ isValidDSL }}</li>
                  <li v-if="currentDSL">quiz.id: {{ currentDSL.quiz?.id || '缺失' }}</li>
                  <li v-if="currentDSL">quiz.title: {{ currentDSL.quiz?.title || '缺失' }}</li>
                </ul>
              </div>
              <details class="error-details">
                <summary>查看详细信息</summary>
                <div class="error-debug">
                  <p><strong>DSL Preview 长度:</strong> {{ props.dslPreview.length }} 字符</p>
                  <p><strong>DSL Preview 预览:</strong></p>
                  <pre
                    >{{ props.dslPreview.substring(0, 500)
                    }}{{ props.dslPreview.length > 500 ? '...' : '' }}</pre
                  >
                </div>
              </details>
              <p class="error-hint">请检查浏览器控制台获取更多调试信息</p>
            </div>
          </div>
        </div>
      </div>
    </Pane>
    <Pane :size="40" :min-size="20">
      <Splitpanes horizontal class="default-theme">
        <Pane :size="50" :min-size="20">
          <div class="preview-section">
            <div class="section-header">
              <span class="section-title">Block Data</span>
            </div>
            <div class="section-content">
              <JsonViewer :code="blockDataPreview" />
            </div>
          </div>
        </Pane>
        <Pane :size="50" :min-size="20">
          <div class="preview-section">
            <div class="section-header">
              <span class="section-title">DSL Preview</span>
            </div>
            <div class="section-content">
              <JsonViewer :code="dslPreview" />
            </div>
          </div>
        </Pane>
      </Splitpanes>
    </Pane>
  </Splitpanes>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { Splitpanes, Pane } from 'splitpanes';
import { QuizPlayer } from '@quizerjs/vue';
import type { QuizDSL, ResultDSL, AnswerValue } from '@quizerjs/dsl';
import JsonViewer from './JsonViewer.vue';

interface Props {
  blockDataPreview: string;
  dslPreview: string;
}

const props = defineProps<Props>();

// 错误信息状态
const dslError = ref<string | null>(null);

// 从 dslPreview JSON 字符串解析为 QuizDSL
const currentDSL = computed<QuizDSL | null>(() => {
  dslError.value = null;

  if (!props.dslPreview || props.dslPreview.trim() === '') {
    dslError.value = 'DSL 数据为空';
    return null;
  }

  try {
    const parsed = JSON.parse(props.dslPreview) as QuizDSL;

    // 验证 DSL 结构是否完整
    if (!parsed || typeof parsed !== 'object') {
      const errorMsg = 'DSL 不是有效对象';
      dslError.value = errorMsg;
      console.error('❌ DSL 解析失败:', errorMsg, { parsed, raw: props.dslPreview });
      return null;
    }

    if (!parsed.quiz || typeof parsed.quiz !== 'object') {
      const errorMsg = 'DSL.quiz 属性缺失或无效';
      dslError.value = errorMsg;
      console.error('❌ DSL 解析失败:', errorMsg, {
        hasQuiz: !!parsed.quiz,
        quizType: typeof parsed.quiz,
        parsed,
      });
      return null;
    }

    if (!parsed.quiz.id || typeof parsed.quiz.id !== 'string') {
      const errorMsg = `DSL.quiz.id 缺失或无效 (当前值: ${JSON.stringify(parsed.quiz.id)})`;
      dslError.value = errorMsg;
      console.error('❌ DSL 解析失败:', errorMsg, {
        quizId: parsed.quiz.id,
        quizIdType: typeof parsed.quiz.id,
        quiz: parsed.quiz,
      });
      return null;
    }

    if (!parsed.quiz.title || typeof parsed.quiz.title !== 'string') {
      const errorMsg = `DSL.quiz.title 缺失或无效 (当前值: ${JSON.stringify(parsed.quiz.title)})`;
      dslError.value = errorMsg;
      console.error('❌ DSL 解析失败:', errorMsg, {
        quizTitle: parsed.quiz.title,
        quizTitleType: typeof parsed.quiz.title,
        quiz: parsed.quiz,
      });
      return null;
    }

    // 验证成功
    console.log('✅ DSL 验证通过:', {
      id: parsed.quiz.id,
      title: parsed.quiz.title,
      hasQuestions: !!(parsed.quiz.questions || parsed.quiz.sections),
    });
    return parsed;
  } catch (error) {
    const errorMsg = `JSON 解析失败: ${error instanceof Error ? error.message : String(error)}`;
    dslError.value = errorMsg;
    console.error('❌ DSL JSON 解析失败:', error, {
      previewLength: props.dslPreview.length,
      previewPreview: props.dslPreview.substring(0, 200) + '...',
    });
    return null;
  }
});

// 验证 DSL 是否有效
const isValidDSL = computed(() => {
  const dsl = currentDSL.value;
  if (!dsl) {
    console.log('🔍 isValidDSL: false (dsl is null)');
    return false;
  }
  // 确保有基本结构
  const valid = !!(dsl.quiz && dsl.quiz.id && dsl.quiz.title);
  console.log('🔍 isValidDSL 检查:', {
    valid,
    hasQuiz: !!dsl.quiz,
    hasId: !!dsl.quiz?.id,
    hasTitle: !!dsl.quiz?.title,
    quizId: dsl.quiz?.id,
    quizTitle: dsl.quiz?.title,
  });
  if (!valid && !dslError.value) {
    dslError.value = 'DSL 结构不完整';
  }
  return valid;
});

// 使用 key 强制重新渲染播放器当 DSL 变化时
const dslKey = ref(0);
watch(
  () => props.dslPreview,
  newPreview => {
    console.log('📝 DSL Preview 变化:', {
      length: newPreview?.length || 0,
      preview: newPreview?.substring(0, 100) || '',
    });
    if (isValidDSL.value && currentDSL.value) {
      console.log('🔄 更新播放器 key, DSL:', {
        id: currentDSL.value.quiz?.id,
        title: currentDSL.value.quiz?.title,
      });
      dslKey.value += 1;
    }
  },
  { immediate: false }
);

// 监听 currentDSL 变化
watch(
  currentDSL,
  newDSL => {
    if (newDSL) {
      console.log('✅ currentDSL 已更新:', {
        id: newDSL.quiz?.id,
        title: newDSL.quiz?.title,
        hasSections: !!newDSL.quiz?.sections,
        hasQuestions: !!newDSL.quiz?.questions,
      });
    } else {
      console.log('⚠️ currentDSL 为 null');
    }
  },
  { immediate: true }
);

// 处理播放器提交
const handlePlayerSubmit = (result: ResultDSL) => {
  console.log('测验提交:', result);
};

// 处理答案变更
const handleAnswerChange = (questionId: string, answer: AnswerValue) => {
  console.log('答案变更:', questionId, answer);
};

// 处理播放器错误
const handlePlayerError = (error: Error) => {
  console.error('播放器错误:', error);
};
</script>

<style scoped>
.preview-section {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--bg-primary);
  height: 100%;
  width: 100%;
  transition: background-color 0.3s ease;
}

.section-header {
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-color);
  padding: 6px 12px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  height: 32px;
  transition:
    background-color 0.3s ease,
    border-color 0.3s ease;
}

.section-title {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: color 0.3s ease;
}

.section-content {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.player-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 2rem;
  color: var(--text-tertiary);
  font-size: 14px;
}

.placeholder-content {
  text-align: center;
}

.error-content {
  max-width: 600px;
  text-align: left;
}

.error-title {
  font-size: 16px;
  font-weight: bold;
  color: var(--error-color, #dc2626);
  margin-bottom: 0.5rem;
}

.error-detail {
  color: var(--text-primary);
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: var(--bg-secondary);
  border-left: 3px solid var(--error-color, #dc2626);
  border-radius: 4px;
}

.error-details {
  margin-top: 1rem;
  padding: 0.75rem;
  background: var(--bg-secondary);
  border-radius: 4px;
}

.error-details summary {
  cursor: pointer;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: var(--text-secondary);
}

.error-details summary:hover {
  color: var(--text-primary);
}

.error-debug {
  margin-top: 0.5rem;
  font-size: 12px;
  color: var(--text-secondary);
}

.error-debug pre {
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: var(--bg-primary);
  border-radius: 4px;
  overflow-x: auto;
  font-size: 11px;
  max-height: 200px;
  overflow-y: auto;
}

.error-hint {
  margin-top: 1rem;
  font-size: 12px;
  color: var(--text-tertiary);
  font-style: italic;
}

.debug-info {
  margin-top: 1rem;
  padding: 0.75rem;
  background: var(--bg-secondary);
  border-radius: 4px;
  font-size: 12px;
}

.debug-info ul {
  margin: 0.5rem 0 0 1.5rem;
  padding: 0;
  list-style: disc;
}

.debug-info li {
  margin: 0.25rem 0;
  color: var(--text-secondary);
}

.section-content :deep(.quiz-player-wrapper) {
  height: 100%;
  width: 100%;
  overflow: hidden;
}
</style>

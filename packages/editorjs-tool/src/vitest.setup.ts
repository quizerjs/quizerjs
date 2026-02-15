/**
 * Vitest 全局 setup：配置 L10nService，使 toolbox.title 与 renderSettings 等返回预期中文文案
 */
import { L10nService } from '@quizerjs/core';
import { zhCN } from '@quizerjs/i18n';

L10nService.configure(zhCN);

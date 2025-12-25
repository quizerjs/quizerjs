#!/usr/bin/env node

/**
 * 交互式开发服务器启动脚本
 * 使用 ora 显示加载动画，inquirer 提供选择菜单
 */

import { spawn } from 'child_process';
import inquirer from 'inquirer';
import ora from 'ora';

// Demo 选项配置
const DEMO_OPTIONS = [
  {
    name: 'Vue',
    value: 'vue',
    description: 'Vue 3 演示项目',
    package: '@quizerjs/demo-vue',
  },
  {
    name: 'React',
    value: 'react',
    description: 'React 18 演示项目',
    package: '@quizerjs/demo-react',
  },
  {
    name: 'Svelte',
    value: 'svelte',
    description: 'Svelte 4 演示项目',
    package: '@quizerjs/demo-svelte',
  },
  {
    name: 'Vanilla',
    value: 'vanilla',
    description: 'Vanilla JS 演示项目',
    package: '@quizerjs/demo-vanilla',
  },
  {
    name: 'Theme',
    value: 'theme',
    description: '主题系统预览页面',
    package: '@quizerjs/theme',
  },
  {
    name: 'Site',
    value: 'site',
    description: 'QuizerJS 开源网站',
    package: '@quizerjs/site',
  },
] as const;

/**
 * 获取命令行参数
 */
function getCommandLineArgs(): string[] {
  return process.argv.slice(2);
}

/**
 * 验证 demo 名称是否有效
 */
function isValidDemo(demo: string): boolean {
  return DEMO_OPTIONS.some(opt => opt.value === demo.toLowerCase());
}

/**
 * 显示帮助信息
 */
function showHelp(): void {
  console.log('\n📖 使用方法:');
  console.log('  pnpm dev              # 显示交互式菜单');
  console.log('  pnpm dev <demo>        # 直接启动指定的 demo\n');
  console.log('可用的 demo:');
  DEMO_OPTIONS.forEach(option => {
    console.log(`  ${option.value.padEnd(10)} - ${option.description}`);
  });
  console.log('\n示例:');
  console.log('  pnpm dev vue');
  console.log('  pnpm dev react');
  console.log('  pnpm dev svelte');
  console.log('  pnpm dev vanilla');
  console.log('  pnpm dev theme');
  console.log('  pnpm dev site\n');
}

/**
 * 显示欢迎信息
 */
function showWelcome(): void {
  console.log('\n🚀 quizerjs 开发服务器\n');
}

/**
 * 显示选择菜单并获取用户选择
 */
async function selectDemo(): Promise<string> {
  const { demo } = await inquirer.prompt([
    {
      type: 'list',
      name: 'demo',
      message: '请选择要启动的演示项目：',
      choices: DEMO_OPTIONS.map(option => ({
        name: `${option.name.padEnd(10)} - ${option.description}`,
        value: option.value,
      })),
    },
  ]);

  return demo;
}

/**
 * 启动开发服务器
 */
function startDevServer(demo: string): void {
  // 确保 demo 名称是小写的
  const demoLower = demo.toLowerCase();
  const option = DEMO_OPTIONS.find(opt => opt.value === demoLower);
  if (!option) {
    console.error(`❌ 未找到演示项目: ${demo}`);
    process.exit(1);
  }

  const spinner = ora({
    text: `正在启动 ${option.name} 开发服务器...`,
    color: 'cyan',
  }).start();

  // 执行 pnpm 命令启动开发服务器
  const command = `pnpm --filter ${option.package} dev`;
  spinner.succeed(`✅ 正在启动 ${option.name} 开发服务器`);
  console.log(`\n📦 包名: ${option.package}`);
  console.log(`🔧 命令: ${command}\n`);

  // 使用 spawn 启动开发服务器（非阻塞，支持长时间运行）
  const childProcess = spawn('pnpm', ['--filter', option.package, 'dev'], {
    stdio: 'inherit',
    cwd: process.cwd(),
    shell: process.platform === 'win32', // Windows 需要 shell
  });

  // 处理进程退出
  childProcess.on('exit', code => {
    if (code !== 0 && code !== null) {
      console.error(`\n❌ 开发服务器退出，代码: ${code}`);
      process.exit(code);
    }
  });

  // 处理错误
  childProcess.on('error', error => {
    spinner.fail(`❌ 启动 ${option.name} 开发服务器失败`);
    console.error(error);
    process.exit(1);
  });

  // 处理 Ctrl+C
  process.on('SIGINT', () => {
    console.log('\n\n👋 正在关闭开发服务器...');
    childProcess.kill('SIGINT');
    process.exit(0);
  });
}

/**
 * 主函数
 */
async function main(): Promise<void> {
  try {
    const args = getCommandLineArgs();

    // 检查是否需要显示帮助
    if (args.includes('--help') || args.includes('-h')) {
      showHelp();
      process.exit(0);
    }

    // 如果提供了参数，直接使用
    if (args.length > 0) {
      const demoArg = args[0].toLowerCase();
      if (isValidDemo(demoArg)) {
        // 直接启动指定的 demo
        startDevServer(demoArg);
        return;
      } else {
        // 参数无效，显示错误和帮助
        console.error(`\n❌ 无效的 demo 名称: ${args[0]}\n`);
        showHelp();
        process.exit(1);
      }
    }

    // 没有提供参数，显示交互式菜单
    showWelcome();
    const selectedDemo = await selectDemo();
    startDevServer(selectedDemo);
  } catch (error) {
    if (error instanceof Error && error.message.includes('User force closed')) {
      console.log('\n👋 已取消');
      process.exit(0);
    }
    console.error('❌ 发生错误:', error);
    process.exit(1);
  }
}

// 运行主函数
main().catch(error => {
  console.error('❌ 未处理的错误:', error);
  process.exit(1);
});

/**
 * 生成 sitemap.xml 文件
 * 用于 SEO 优化
 */

import { writeFileSync } from 'fs';
import { join } from 'path';

const BASE_URL = process.env.VITE_SITE_URL || 'https://quizerjs.com';

// 定义网站的所有路由
const routes = [
  '/',
  '/features',
  '/docs',
  '/docs/getting-started',
  '/docs/installation',
  '/docs/vue-integration',
  '/demos',
  '/examples',
  '/examples/basic-validation',
  '/examples/full-quiz',
  '/examples/interactive-demo',
  '/examples/real-world',
  '/community',
  '/community/contributing',
  '/community/code-of-conduct',
  '/community/changelog',
  '/about',
];

/**
 * 生成 sitemap.xml 内容
 */
function generateSitemap(): string {
  const urls = routes
    .map(
      (route) => `  <url>
    <loc>${BASE_URL}${route}</loc>
    <changefreq>weekly</changefreq>
    <priority>${route === '/' ? '1.0' : '0.8'}</priority>
  </url>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

/**
 * 主函数
 */
function main() {
  const sitemap = generateSitemap();
  const outputPath = join(process.cwd(), 'public', 'sitemap.xml');
  writeFileSync(outputPath, sitemap, 'utf-8');
  console.log(`✅ Sitemap generated: ${outputPath}`);
}

main();


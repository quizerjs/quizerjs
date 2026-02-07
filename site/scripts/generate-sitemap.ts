/**
 * 生成 sitemap.xml 文件
 * 用于 SEO 优化
 */

import { writeFileSync } from 'fs';
import { join } from 'path';

const BASE_URL = process.env.VITE_SITE_URL || 'https://quizerjs.io';

// 定义网站的所有路由
const routes = [
  '/',
  '/features',
  '/docs',
  '/docs/guide/getting-started',
  '/docs/installation',
  '/docs/vue-integration',
  '/docs/guide/dsl',
  '/docs/guide/dsl/structure',
  '/docs/guide/dsl/question-types',
  '/docs/guide/dsl/validation',
  '/docs/guide/dsl/examples',
  '/docs/guide/dsl/error-codes',
  '/docs/guide/api',
  '/docs/guide/api/parser',
  '/docs/guide/api/serializer',
  '/docs/guide/api/validator',
  '/docs/guide/api/types',
  '/docs/guide/examples',
  '/docs/guide/examples/basic-validation',
  '/docs/guide/examples/full-quiz',
  '/docs/guide/examples/real-world',
  '/demos',
];

/**
 * 生成 sitemap.xml 内容
 */
function generateSitemap(): string {
  const urls = routes
    .map(
      route => `  <url>
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

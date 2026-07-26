/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 纯静态导出：方案C 是纯客户端 SPA（无 API routes / 无服务端数据获取），
  // 可导出为静态文件，由 launcher 内嵌的轻量静态服务器 serve，无需 Node 运行时。
  output: 'export',
  // 未使用 next/image，但加 unoptimized 作为保险，避免日后引入图片优化导致导出失败。
  images: { unoptimized: true },
}

module.exports = nextConfig
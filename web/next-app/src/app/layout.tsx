import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Barista 咖啡顾问',
  description: '专业咖啡顾问 — 顾问主导穿透思问，找到影响口感的关键变量',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='zh-CN' suppressHydrationWarning>
      <body className='antialiased'>
        {children}
      </body>
    </html>
  )
}

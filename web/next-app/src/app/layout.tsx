import type { Metadata } from 'next'
import { Noto_Serif_SC, Inter } from 'next/font/google'
import './globals.css'

const notoSerif = Noto_Serif_SC({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-cn-serif',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-inter',
  display: 'swap',
})

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
    <html lang='zh-CN' className={`${notoSerif.variable} ${inter.variable}`} suppressHydrationWarning>
      <body className='antialiased'>
        {children}
      </body>
    </html>
  )
}

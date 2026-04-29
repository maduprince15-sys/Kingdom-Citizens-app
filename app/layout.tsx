import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import PWARegister from './components/PWARegister'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'The Kingdom Citizens',
  description:
    'The Kingdom Citizens platform for teachings, meetings, prayer, books, posts, calendar, giving, and member community.',
  manifest: '/manifest.json',
  icons: {
    icon: '/kingdom-citizens-logo.png',
    apple: '/kingdom-citizens-logo.png',
  },
  appleWebApp: {
    capable: true,
    title: 'Kingdom Citizens',
    statusBarStyle: 'black-translucent',
  },
}

export const viewport: Viewport = {
  themeColor: '#120505',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang='en'
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className='min-h-full flex flex-col'>
        <PWARegister />
        {children}
      </body>
    </html>
  )
}
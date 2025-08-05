import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'

export const metadata: Metadata = {
  title: "MemoRush", 
  description:"Flip. Match. Win  before your memory fades. MemoRush is a fast-paced memory matching game that challenges your focus and recall. Flip cards, find pairs, and race against time across levels of increasing difficulty. With a sleek interface and a cosmic backdrop, MemoRush keeps your brain sharp and your reflexes sharper.",
  icons: {
    icon: '/logo.png',}
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  )
}

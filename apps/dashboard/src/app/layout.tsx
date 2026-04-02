import type { Metadata } from 'next';
import type { ThemeProviderProps } from 'next-themes';
import { Geist, Geist_Mono } from 'next/font/google';
import { ThemeProvider as NextThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';

// next-themes@0.4.6 types were built against @types/react@18.
// React 19 changed JSX.Element types, causing a children mismatch.
// This cast resolves the type conflict without changing runtime behavior.
const ThemeProvider = NextThemeProvider as React.ComponentType<ThemeProviderProps>;

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'GitHub Embed UI',
  description: 'Showcase your open-source contributions with embeddable widgets',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}

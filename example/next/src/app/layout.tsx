import { SimpleFormJotaiBound } from '@/lib/simple-form';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '@mm1995tk/simple-form',
  description: 'examples of @mm1995tk/simple-form',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <body className={inter.className}>
        <SimpleFormJotaiBound>
          <main style={{padding: 8}}>{children}</main>
        </SimpleFormJotaiBound>
      </body>
    </html>
  );
}

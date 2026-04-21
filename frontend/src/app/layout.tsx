import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/Sidebar';
import LoadingScreen from '@/components/LoadingScreen';

export const metadata: Metadata = {
  title: 'Altairis Backoffice',
  description: 'Backoffice operativo para Viajes Altairis',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="font-sans">
        <LoadingScreen />
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 min-w-0 p-4 lg:p-8 pt-16 lg:pt-8 overflow-hidden">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}

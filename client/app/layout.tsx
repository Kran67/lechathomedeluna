import '@/app/globals.css';

import type { Metadata } from 'next';
import { CookiesProvider } from 'next-client-cookies/server';
import { NextFontWithVariable } from 'next/dist/compiled/@next/font';
import { Roboto_Condensed } from 'next/font/google';
import { cookies } from 'next/headers';
import {
  Bounce,
  ToastContainer,
} from 'react-toastify';

import { getProfile } from '@/app/api/api';
import { UserProvider } from '@/app/contexts/userContext';
import { User } from '@/app/interfaces/user';

/**
 * Ajout de la police de caractère utilisée sur le site
 * 
 * @function Inter
 * @returns { NextFontWithVariable } - Les informations de la police
 */
const roboto: NextFontWithVariable = Roboto_Condensed({
  variable: "--font-roboto",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Le Chat'Home de Luna",
  description: "Association de protection des animaux",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const userId: string | undefined = cookieStore.get("userId")?.value;
  const user: User | null = await getProfile(userId ?? "");

  return (
    <html lang="fr">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"></link>
      </head>
      <body
        className={`${roboto.variable} antialiased`}
      >
        <UserProvider initialUser={user}>
          <CookiesProvider>
            {children}
          </CookiesProvider>
        </UserProvider>
        <ToastContainer
          position="bottom-right"
          autoClose={5000}
          hideProgressBar
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable={false}
          pauseOnHover
          theme="colored"
          transition={Bounce}
        />
      </body>
    </html>
  );
}

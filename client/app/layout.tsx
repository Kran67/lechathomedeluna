import type { Metadata } from "next";
import { Roboto_Condensed } from "next/font/google";
import "@/app/globals.css";
import { NextFontWithVariable } from "next/dist/compiled/@next/font";
import { UserProvider } from "@/app/contexts/userContext";
import { cookies } from "next/headers";
import { User } from "@/app/interfaces/user";
import { CookiesProvider } from "next-client-cookies/server";
import { getProfile } from "@/app/api/api";

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
      <body
        className={`${roboto.variable} antialiased`}
      >
        <UserProvider initialUser={user}>
          <CookiesProvider>
            {children}
          </CookiesProvider>
        </UserProvider>
      </body>
    </html>
  );
}

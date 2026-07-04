import type { Metadata } from "next";
import {
  Archivo,
  Cormorant_Garamond,
  Fraunces,
  IBM_Plex_Mono,
  Instrument_Sans,
  JetBrains_Mono,
} from "next/font/google";
import { AuthProvider } from "@/lib/auth";
import { MotionProvider } from "@/components/motion/motion-provider";
import { ToastProvider } from "@/components/motion/toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SplashScreen } from "@/components/splash-screen";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import "./globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  weight: ["400", "500", "600"],
  subsets: ["latin"],
});

// Réserve concierge type system (imported from the Claude Design import).
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
});

const instrument = Instrument_Sans({
  variable: "--font-instrument",
  weight: ["400", "500", "600"],
  subsets: ["latin"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  weight: ["400", "500"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "ReserveFlow — Book with confidence",
    template: "ReserveFlow — %s",
  },
  description:
    "Hold a seat for fifteen minutes, pay when you're sure. No seat is ever sold twice.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${fraunces.variable} ${plexMono.variable} ${cormorant.variable} ${instrument.variable} ${jetbrains.variable} h-full antialiased`}
    >
      <head>
        {/* Icon font loaded globally in the app-router root layout. */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,300..400,0..1,0&display=swap"
        />
      </head>
      <body className="flex min-h-full flex-col">
        <SplashScreen />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-ink focus:px-4 focus:py-2 focus:text-paper"
        >
          Skip to content
        </a>
        <AuthProvider>
          <MotionProvider>
            <ToastProvider>
              <TooltipProvider delayDuration={250}>
                <SiteHeader />
                <main id="main" className="flex-1 pt-[68px]">
                  {children}
                </main>
                <SiteFooter />
              </TooltipProvider>
            </ToastProvider>
          </MotionProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

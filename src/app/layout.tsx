import type { Metadata } from "next";
import { Geist } from "next/font/google";
import localFont from "next/font/local";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { OpenScreen } from "@/components/open-screen";
import { site } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const comico = localFont({
  src: "../../public/Comico-Regular.woff",
  variable: "--font-comico",
  display: "swap",
});

const heal = localFont({
  src: "../../public/HealTheWebA-Regular.otf",
  variable: "--font-heal",
  display: "swap",
  preload: false,
});

const boron = localFont({
  src: "../../public/bboron.ttf",
  variable: "--font-boron",
  display: "swap",
  preload: false,
});

const gabriele = localFont({
  src: "../../public/gabriele-bad.ttf",
  variable: "--font-gabriele",
  display: "swap",
  preload: false,
});

const chops = localFont({
  src: "../../public/misterlickychops.ttf",
  variable: "--font-chops",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: "Carter Community",
  description: site.description,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${comico.variable} ${heal.variable} ${boron.variable} ${gabriele.variable} ${chops.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <a
          href="#feed"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:bg-background focus:px-3 focus:py-2"
        >
          Skip to feed
        </a>
        <Header />
        {children}
        <Footer />
        <OpenScreen />
      </body>
    </html>
  );
}

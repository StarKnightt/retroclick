import type { Metadata } from "next";
import { 
  Inter, 
  Playfair_Display, 
  Libre_Baskerville, 
  EB_Garamond, 
  DM_Serif_Display,
  Caveat,
  Dancing_Script,
  Pacifico,
  Shadows_Into_Light,
  Indie_Flower,
  Comic_Neue
} from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const libreBaskerville = Libre_Baskerville({
  variable: "--font-libre",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const ebGaramond = EB_Garamond({
  variable: "--font-garamond",
  subsets: ["latin"],
  display: "swap",
});

const dmSerif = DM_Serif_Display({
  variable: "--font-dm-serif",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  display: "swap",
});

const dancingScript = Dancing_Script({
  variable: "--font-dancing",
  subsets: ["latin"],
  display: "swap",
});

const pacifico = Pacifico({
  variable: "--font-pacifico",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const shadowsIntoLight = Shadows_Into_Light({
  variable: "--font-shadows",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const indieFlower = Indie_Flower({
  variable: "--font-indie",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const comicNeue = Comic_Neue({
  variable: "--font-comic",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "RetroClick - Vintage Photo Editor",
  description: "Transform your photos with beautiful retro film filters. Free online photo editor with vintage effects.",
  keywords: ["photo editor", "retro", "vintage", "filters", "free"],
  authors: [{ name: "Prasenjit", url: "https://prasen.dev" }],
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/favicon.svg",
  },
  openGraph: {
    title: "RetroClick - Vintage Photo Editor",
    description: "Transform your photos with beautiful retro film filters",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} ${libreBaskerville.variable} ${ebGaramond.variable} ${dmSerif.variable} ${caveat.variable} ${dancingScript.variable} ${pacifico.variable} ${shadowsIntoLight.variable} ${indieFlower.variable} ${comicNeue.variable} antialiased font-sans`}>
        {children}
      </body>
    </html>
  );
}

import "../styles/globals.css";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Human Intelligence Interview Engine",
  openGraph: {
    title: "Human Intelligence Interview Engine",
    description:
      "Human Intelligence's Conversational Architect allows users to engage in guided, interactive AI interviews designed to extract detailed and structured data from subjects.",
    images: [
      {
        url: "https://demo.useliftoff.com/opengraph-image",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Human Intelligence - Conversational Architect",
    description:
      "Human Intelligence's Conversational Architect allows users to engage in guided, interactive AI interviews designed to extract detailed and structured data from subjects.",
    images: ["https://demo.useliftoff.com/opengraph-image"],
    creator: "@tmeyer_me",
  },
  metadataBase: new URL("https://demo.useliftoff.com"),
  themeColor: "#FFF",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="scroll-smooth antialiased [font-feature-settings:'ss01']">
        {children}
      </body>
    </html>
  );
}

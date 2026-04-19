import type { Metadata } from "next";
import { Open_Sans, Poppins } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers/Providers";

const openSans = Open_Sans({ subsets: ["latin"], variable: "--font-sans" });
const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-heading" });

export const metadata: Metadata = {
  title: "FlowForge — HR Workflow Designer",
  description: "Visual workflow designer for HR process automation. Drag-and-drop nodes, configure forms, and simulate workflows.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${openSans.variable} ${poppins.variable} h-full antialiased`}
    >
      <body className="h-full flex flex-col font-sans bg-[var(--canvas-bg)] text-[var(--text-primary)]">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

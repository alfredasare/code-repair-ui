import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { QueryClientProvider } from "./providers";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Code Repair",
  description: "Code Repair AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} antialiased h-full`}>
        <QueryClientProvider>{children}</QueryClientProvider>
        <Toaster
          style={{
            backgroundColor: "white",
            color: "black",
          }}
          toastOptions={{
            descriptionClassName: "text-black",
          }}
        />
      </body>
    </html>
  );
}

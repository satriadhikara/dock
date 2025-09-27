import type { Metadata } from "next";
import { Nunito_Sans } from "next/font/google";
import "./globals.css";
import { ConditionalLayout } from "@/components/conditional-layout";
import { Toaster } from "@/components/ui/sonner";
import QueryClientLayout from "@/components/QuertClientLayout";

const nunitoSans = Nunito_Sans({
  variable: "--font-nunito-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dock",
  description: "Digital & Operation Contract Knowledge system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${nunitoSans.variable} antialiased`}>
        <QueryClientLayout>
          <ConditionalLayout>{children}</ConditionalLayout>
          <Toaster richColors />
        </QueryClientLayout>
      </body>
    </html>
  );
}

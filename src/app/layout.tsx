import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "Disnode — El Bayo Distribuciones",
  description: "Prototipo de pedidos operativos para El Bayo Distribuciones.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-AR">
      <body className={inter.className}>{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";
import Container from "./container";
import Provider from "./provider";

export const metadata: Metadata = {
  title: "Stingray Labs",
  description: "Stingray Labs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark">
      <body className={`antialiased`}>
        <Provider>
          <Container>{children}</Container>
        </Provider>
      </body>
    </html>
  );
}

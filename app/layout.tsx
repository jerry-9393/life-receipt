import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "사주+MBTI 분석 | 내 성격 완벽 해부",
  description: "사주와 MBTI로 보는 소름 돋는 성격 분석 리포트",
  openGraph: {
    title: "사주+MBTI 분석 | 내 성격 완벽 해부",
    description: "사주와 MBTI로 보는 소름 돋는 성격 분석 리포트",
    siteName: "사주+MBTI 분석",
    type: "website",
    locale: "ko_KR",
    // images: [
    //   {
    //     url: "/og-image.png", // 나중에 교체할 이미지 경로
    //     width: 1200,
    //     height: 630,
    //     alt: "사주+MBTI 분석",
    //   },
    // ],
  },
  twitter: {
    card: "summary_large_image",
    title: "사주+MBTI 분석 | 내 성격 완벽 해부",
    description: "사주와 MBTI로 보는 소름 돋는 성격 분석 리포트",
    // images: ["/og-image.png"], // 나중에 교체할 이미지 경로
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

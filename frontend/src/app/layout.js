import "./globals.css";

export const metadata = {
  title: "IEDC Selection Drive - Gamified Innovation Platform",
  description: "Gamified student candidate selection & team drive portal",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased dark">
      <body className="min-h-full flex flex-col font-sans bg-[#090d16] text-slate-100">{children}</body>
    </html>
  );
}

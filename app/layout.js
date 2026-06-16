import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/ui/header";
import { ClerkProvider } from "@clerk/nextjs";
import { AppContextProvider } from "@/components/AppContext";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Vehiql | Find your dream Car",
  description: "VEHIQL is a premium car discovery, rental, and booking platform.",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`${inter.className} bg-background text-foreground transition-colors duration-300`}>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
            <AppContextProvider>
              <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-grow min-h-screen bg-slate-50/50 dark:bg-slate-950/20">{children}</main>
                <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
                  <div className="container mx-auto px-4 text-center">
                    <p className="text-sm font-semibold tracking-wider uppercase text-slate-500 mb-2">VEHIQL</p>
                    <p className="text-xs">&copy; {new Date().getFullYear()} VEHIQL. Made with &hearts; by MOHD ZAID KHAN.</p>
                  </div>
                </footer>
              </div>
              <Toaster position="top-right" richColors />
            </AppContextProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}

import "primereact/resources/themes/lara-light-blue/theme.css"; //theme
import "primereact/resources/primereact.min.css"; //core css
import "primeicons/primeicons.css"; //icons
import "@/styles/globals.css";

// Font
import { Inter } from "@next/font/google";
const inter = Inter({ subsets: ["latin"] });

export default function App({ Component, pageProps }) {
  return (
    <main className={inter.className}>
      <Component {...pageProps} />
    </main>
  );
}

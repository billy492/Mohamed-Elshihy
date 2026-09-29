import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import Cursor from "@/components/site/Cursor";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="site">
      <Header />
      <main id="main">{children}</main>
      <Footer />
      <Cursor />
    </div>
  );
}

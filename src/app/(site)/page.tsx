import Loader from "@/components/site/Loader";
import Hero from "@/components/hero/Hero";
import Ticker from "@/components/site/Ticker";
import Levels from "@/components/coaching/Levels";
import Process from "@/components/coaching/Process";
import Coach from "@/components/home/Coach";
import ContactSheet from "@/components/home/ContactSheet";
import FilmRoom from "@/components/home/FilmRoom";
import FinalCta from "@/components/home/FinalCta";
import { credentials } from "@/content/coaching";

// One job per section: who he is, the coaching programs (from Shihy's
// brochure), his credentials, how it works, his work, and the way in.
export default function Home() {
  return (
    <>
      <Loader />
      <Hero />
      <Coach />
      <Levels />
      <Ticker items={credentials} className="ticker-red" />
      <Process />
      <ContactSheet />
      <FilmRoom />
      <FinalCta />
    </>
  );
}

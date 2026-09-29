import Loader from "@/components/site/Loader";
import Hero from "@/components/hero/Hero";
import Ticker from "@/components/site/Ticker";
import Trainings from "@/components/home/Trainings";
import Statement from "@/components/home/Statement";
import Coach from "@/components/home/Coach";
import Method from "@/components/home/Method";
import Pathways from "@/components/home/Pathways";
import ScrollMarquee from "@/components/home/ScrollMarquee";
import Mentorship from "@/components/home/Mentorship";
import Problems from "@/components/home/Problems";
import Programs from "@/components/home/Programs";
import FilmRoom from "@/components/home/FilmRoom";
import FinalCta from "@/components/home/FinalCta";
import { credentials } from "@/content/coaching";

export default function Home() {
  return (
    <>
      <Loader />
      <Hero />
      <Trainings />
      <Ticker items={credentials} className="ticker-red" />
      <Statement />
      <Coach />
      <Method />
      <Pathways />
      <Mentorship />
      <ScrollMarquee a="Find the problem" b="Fix the problem" />
      <Problems />
      <Programs />
      <FilmRoom />
      <FinalCta />
    </>
  );
}

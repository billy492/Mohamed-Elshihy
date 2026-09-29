import type { Metadata } from "next";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Privacy",
  description: "What happens to the information you send in an application or waitlist sign-up.",
};

// CONFIRM: have this reviewed before launch (Egypt's Personal Data Protection
// Law 151/2020 applies; GDPR applies to applicants in the EU).
export default function PrivacyPage() {
  return (
    <section className="section privacy">
      <h1 className="t-h1">Privacy</h1>
      <div className="prose plain">
        <p>
          This site belongs to {site.name}. It collects information only when you choose to send it: an application
          for coaching or mentorship, or an email address for a program waitlist.
        </p>
        <h2>What is collected</h2>
        <p>
          The answers you give in the application, including your contact details and anything you share about your
          training, health or injuries. For waitlists, only your email address and the program you chose.
        </p>
        <h2>Who sees it</h2>
        <p>
          Shihy reads applications himself in a private, password-protected review area. Your answers are not
          published, sold or shared with anyone else. They are stored with the site&apos;s hosting and database providers,
          who process them only to run the site.
        </p>
        <h2>How it is used</h2>
        <p>
          To review your application and contact you about it on WhatsApp or email, or to tell you when a program
          opens. Nothing else.
        </p>
        <h2>How long it is kept</h2>
        <p>
          Applications are kept while they are useful for coaching you, then deleted. You can ask for your data to be
          deleted at any time.
        </p>
        <h2>Your choices</h2>
        <p>
          To see, correct or delete what you sent, message {site.social.instagram.handle} on{" "}
          <a href={site.social.instagram.href} target="_blank" rel="noopener">
            Instagram
          </a>{" "}
          with your application reference.
        </p>
      </div>
    </section>
  );
}

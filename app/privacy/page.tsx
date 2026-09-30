import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";

export const metadata = {
  title: "Privacy policy: ReviewLabs",
  description: "How ReviewLabs collects, uses, and stores data.",
};

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 px-6 py-16">
        <div className="mx-auto max-w-[720px]">
          <h1 className="text-display-md text-wise-ink">Privacy policy</h1>
          <p className="mt-2 text-sm text-wise-mute">Last updated: October 1, 2026</p>
          <p className="mt-6 rounded-xl bg-wise-warning p-4 text-sm text-wise-warning-content">
            This is a draft written for ReviewLabs&apos;s current product. It has not yet been
            reviewed by a lawyer, and should get that review before the product handles real
            customer data at scale.
          </p>

          <div className="mt-8 flex flex-col gap-8 text-wise-body">
            <section>
              <h2 className="text-lg font-bold text-wise-ink">What this covers</h2>
              <p className="mt-2">
                This policy explains what ReviewLabs collects when a business owner uses the
                product to run their review collection and recovery program, and when a
                customer of that business rates a visit through a ReviewLabs page. It applies
                to reviewlabs.space and the ReviewLabs dashboard.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-wise-ink">Data from business owners</h2>
              <p className="mt-2">When you create a ReviewLabs account, we collect:</p>
              <ul className="mt-2 list-disc pl-5">
                <li>Your email address, used to sign you in and send account notices.</li>
                <li>Your business name, outlet name, and address.</li>
                <li>
                  Billing details, processed directly by Razorpay. ReviewLabs does not store
                  your card number.
                </li>
                <li>
                  If you connect Google Business Profile, the OAuth access and refresh tokens
                  Google issues so ReviewLabs can read your reviews and publish replies on your
                  behalf. You can disconnect this at any time from Settings.
                </li>
                <li>Your reply-drafting preferences, such as language and auto-reply rules.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-wise-ink">Data from your customers</h2>
              <p className="mt-2">
                When someone rates a visit through your ReviewLabs page, we collect the star
                rating, and, if they choose to add one, a public comment or a private note
                about what went wrong. Rating is anonymous by default: we don&apos;t require a
                name or email to submit one.
              </p>
              <p className="mt-2">
                If you send a request by email or WhatsApp, the contact details you enter for
                that customer (name, email, or phone number) are stored so the request can be
                sent and tracked.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-wise-ink">Who else sees this data</h2>
              <p className="mt-2">
                ReviewLabs runs on a small set of infrastructure and AI providers. Each only
                sees what it needs to do its job:
              </p>
              <ul className="mt-2 list-disc pl-5">
                <li>Supabase hosts the database and handles sign-in.</li>
                <li>Razorpay processes subscription payments.</li>
                <li>
                  Google Business Profile APIs, only if you connect your account, to read
                  reviews and publish replies.
                </li>
                <li>
                  Z.ai, Cerebras, or Groq, whichever is available when a reply is drafted,
                  receive the review text and your fix notes to generate a draft reply. They
                  don&apos;t receive your contact details or billing information.
                </li>
                <li>Brevo or Resend, if enabled, to send request and reminder emails.</li>
                <li>Cloudflare Turnstile, to tell human visitors apart from bots.</li>
                <li>Sentry and PostHog, for error tracking and product analytics.</li>
              </ul>
              <p className="mt-2">We don&apos;t sell data to anyone, for any reason.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-wise-ink">How long we keep it</h2>
              <p className="mt-2">
                We keep account and rating data for as long as your account is active. If you
                close your account, we delete your business data within 30 days, except where
                we&apos;re required to keep billing records longer for tax purposes.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-wise-ink">Your rights</h2>
              <p className="mt-2">
                You can ask us to show you what we hold about you, correct it, or delete it.
                Email the address below and we&apos;ll respond within 30 days.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-wise-ink">Changes to this policy</h2>
              <p className="mt-2">
                If this policy changes in a way that matters, we&apos;ll email account owners
                before the change takes effect.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-wise-ink">Contact</h2>
              <p className="mt-2">
                Questions about this policy: privacy@reviewlabs.space (placeholder, set this up
                once the domain is live).
              </p>
            </section>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

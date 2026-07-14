// app/rewards/page.tsx
import { Gift, Award, Info, HelpCircle, Shield } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "ReviewLabs Rewards Program",
  description: "Learn how the ReviewLabs monthly reward system works. Win t-shirts, stickers, and developer gear by solving challenges.",
};

export default function RewardsPage() {
  const faqs = [
    {
      q: "How are the winners selected?",
      a: "At the end of each calendar month, the user at the top of the monthly leaderboard is crowned champion. Ties are broken based on the average time taken per challenge first-attempt correct.",
    },
    {
      q: "Do I need to sign in to win?",
      a: "Yes. In order to record attempts on the leaderboard and qualify for prizes, you must sign in using your GitHub account. Anonymous progress is stored in local storage and does not contribute to the public leaderboard.",
    },
    {
      q: "Where do you ship the prizes?",
      a: "For the v1 launch, we ship physical prizes (T-shirts, stickers, and keycaps) within India only. Global participants can still compete for bragging rights and digital recognition badges.",
    },
    {
      q: "How do I claim my reward?",
      a: "At the beginning of each month, the winner will be contacted via the email associated with their GitHub account to collect shipping details.",
    },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto px-4 md:px-6 py-16 space-y-16 select-none">
      {/* 1. Header */}
      <div className="space-y-4 text-center sm:text-left">
        <h1 className="font-display text-4xl sm:text-5xl text-txt-primary">
          Monthly Rewards
        </h1>
        <p className="text-base text-txt-secondary leading-relaxed font-sans-humanist tracking-wide max-w-xl">
          Solve challenges, climb the leaderboard, and win high-quality developer gear. Free forever, sponsored by BugLens.
        </p>
      </div>

      {/* 2. Rewards Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Prize card */}
        <div className="p-8 border border-border-subt bg-surface-card rounded-lg flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="p-2.5 bg-black/[0.05] text-txt-primary border border-border-subt rounded-lg w-fit">
              <Gift className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-sans font-bold text-txt-primary tracking-tight">This Month&rsquo;s Reward</h3>
            <p className="text-xs text-txt-secondary leading-relaxed font-sans-humanist">
              We rotate our physical prizes monthly to keep things interesting. In July 2026, the top reviewer will win a **ReviewLabs Developer Pack**:
            </p>
            <ul className="text-xs text-txt-secondary space-y-1.5 list-disc list-inside pt-2 font-sans-humanist">
              <li>1x Custom embroidered ReviewLabs T-Shirt</li>
              <li>10x High-quality vinyl laptop stickers</li>
              <li>1x Monospace keycap keychain</li>
            </ul>
          </div>
          <Link
            href="/leaderboard"
            className="text-center bg-accent hover:bg-accent-hover text-txt-inverse text-xs font-sans font-semibold py-2.5 rounded-full transition-colors [box-shadow:var(--shadow-soft)] cursor-pointer block"
          >
            Check Current Standings
          </Link>
        </div>

        {/* Rules Card */}
        <div className="p-8 border border-border-subt bg-surface-card rounded-lg space-y-5">
          <div className="p-2.5 bg-black/[0.05] text-txt-primary border border-border-subt rounded-lg w-fit">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-sans font-bold text-txt-primary tracking-tight">Rules & Eligibility</h3>
          
          <div className="space-y-4 text-xs text-txt-secondary leading-relaxed font-sans-humanist">
            <div className="flex gap-3 items-start">
              <Shield className="w-4 h-4 text-txt-primary flex-shrink-0 mt-0.5" />
              <span>
                <strong>GitHub Verification</strong>: To protect standings from scripts or alt-accounts, we require signing in via GitHub.
              </span>
            </div>
            <div className="flex gap-3 items-start">
              <Info className="w-4 h-4 text-txt-primary flex-shrink-0 mt-0.5" />
              <span>
                <strong>India Shipping Only</strong>: Physical prize shipping is limited to addresses within India.
              </span>
            </div>
            <div className="flex gap-3 items-start">
              <Info className="w-4 h-4 text-txt-primary flex-shrink-0 mt-0.5" />
              <span>
                <strong>Fair Play</strong>: Attempts are tracked securely on our servers. Botting or farming will result in leaderboard disqualification.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. FAQ Section */}
      <div className="space-y-8">
        <h3 className="text-[10px] font-sans font-bold text-txt-primary border-b border-border-subt pb-3 uppercase tracking-widest flex items-center gap-2">
          <HelpCircle className="w-4.5 h-4.5 text-accent-text" />
          Frequently Asked Questions
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {faqs.map((faq, i) => (
            <div key={i} className="space-y-2">
              <h4 className="text-sm font-sans font-bold text-txt-primary tracking-tight">
                {faq.q}
              </h4>
              <p className="text-xs text-txt-secondary leading-relaxed font-sans-humanist">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

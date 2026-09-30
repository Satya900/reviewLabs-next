import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="bg-wise-ink px-6 py-12 text-wise-canvas-soft">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-8 md:flex-row md:justify-between">
        <div>
          <div className="text-lg font-extrabold text-white">ReviewLabs</div>
          <p className="mt-2 max-w-sm text-sm text-wise-canvas-soft/70">
            More Google reviews, faster fixes for unhappy customers, and nothing that gets your
            profile flagged.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-8 text-sm sm:grid-cols-3">
          <div className="flex flex-col gap-2">
            <span className="font-semibold text-white">Product</span>
            <Link href="/pricing" className="text-wise-canvas-soft/70 hover:text-white">
              Pricing
            </Link>
            <Link href="/#how-it-works" className="text-wise-canvas-soft/70 hover:text-white">
              How it works
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            <span className="font-semibold text-white">Company</span>
            <Link href="/dashboard" className="text-wise-canvas-soft/70 hover:text-white">
              Owner login
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            <span className="font-semibold text-white">Legal</span>
            <Link href="/privacy" className="text-wise-canvas-soft/70 hover:text-white">
              Privacy policy
            </Link>
            <Link href="/terms" className="text-wise-canvas-soft/70 hover:text-white">
              Terms of service
            </Link>
          </div>
        </div>
      </div>
      <div className="mx-auto mt-10 max-w-[1200px] border-t border-white/10 pt-6 text-xs text-wise-canvas-soft/50">
        © {new Date().getFullYear()} ReviewLabs. reviewlabs.space
      </div>
    </footer>
  );
}

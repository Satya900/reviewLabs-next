import QRCode from "qrcode";
import { Card } from "@/components/ui/card";
import { getOwnerOutlets } from "@/lib/outlets";

export default async function QrKitPage() {
  const outlets = await getOwnerOutlets();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const outletsWithQr = await Promise.all(
    outlets.map(async (outlet) => {
      const reviewUrl = `${appUrl}/r/${outlet.slug}`;
      const qrDataUrl = await QRCode.toDataURL(reviewUrl, {
        margin: 2,
        width: 480,
        color: { dark: "#0e0f0c", light: "#ffffff" },
      });
      return { outlet, reviewUrl, qrDataUrl };
    })
  );

  return (
    <div>
      <h1 className="text-display-md text-wise-ink">QR kit</h1>
      <p className="mt-2 max-w-xl text-wise-body">
        One QR code per outlet. Print it for the counter, a standee, or a table tent, scanning
        it sends the customer straight to the rating page.
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {outletsWithQr.map(({ outlet, reviewUrl, qrDataUrl }) => (
          <Card key={outlet.id} className="p-6">
            <p className="font-semibold text-wise-ink">{outlet.name}</p>
            <div className="mt-4 flex justify-center rounded-xl bg-wise-canvas-soft p-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrDataUrl} alt={`QR code linking to ${reviewUrl}`} className="size-48" />
            </div>
            <p className="mt-3 truncate text-center text-xs text-wise-mute">{reviewUrl}</p>
            <a
              href={qrDataUrl}
              download={`reviewlabs-qr-${outlet.slug}.png`}
              className="mt-4 block rounded-xl bg-primary px-4 py-3 text-center text-sm font-semibold text-primary-foreground hover:bg-[var(--wise-primary-active)]"
            >
              Download PNG
            </a>
          </Card>
        ))}
        {outletsWithQr.length === 0 && (
          <Card className="p-6 text-sm text-wise-mute">
            No outlets yet. Add one from onboarding to generate a QR code.
          </Card>
        )}
      </div>
    </div>
  );
}

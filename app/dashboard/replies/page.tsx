import { Card } from "@/components/ui/card";
import { getPendingReplyDrafts } from "@/lib/replies";
import { ReplyDraftCard } from "@/components/dashboard/reply-draft-card";

export default async function RepliesPage() {
  const { drafts, demo } = await getPendingReplyDrafts();

  return (
    <div>
      <h1 className="text-display-md text-wise-ink">Reply drafts</h1>
      <p className="mt-2 max-w-2xl text-wise-body">
        AI drafts a reply to every new Google review using the fix log from closed tickets.
        Five-star reviews with no text publish automatically if that setting is on; everything
        else waits here for a tap of approval.
      </p>

      <div className="mt-8 flex flex-col gap-4">
        {demo && (
          <Card className="bg-wise-canvas-soft p-6 text-sm text-wise-mute">
            Connect Supabase and Google to see real reply drafts here.
          </Card>
        )}
        {!demo && drafts.length === 0 && (
          <Card className="bg-wise-canvas-soft p-6 text-sm text-wise-mute">
            Nothing waiting on approval. Sync Google from Settings to pull in new reviews.
          </Card>
        )}
        {drafts.map((draft) => (
          <ReplyDraftCard key={draft.id} draft={draft} />
        ))}
      </div>
    </div>
  );
}

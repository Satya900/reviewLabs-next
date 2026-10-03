// Hand-written types mirroring supabase/migrations/0001_phase1_core.sql and
// 0002_phase2_google_reply.sql.
// Once a live Supabase project exists, regenerate with:
//   npx supabase gen types typescript --project-id <id> > lib/supabase/types.ts
// and delete this file's contents in favor of the generated Database type.
//
// NOTE: these must be `type` object literals, not `interface`. Postgrest-js's
// generics rely on TS inferring an implicit index signature to satisfy
// Record<string, unknown>, and TS only does that for type literals, not
// interfaces — an interface here makes every Insert/Update/select() call
// silently resolve to `never`.

export type PlanTier = "starter" | "growth" | "agency" | "global";
export type RequestChannel = "qr" | "email" | "whatsapp";
export type RequestStatus = "sent" | "reminded" | "opened" | "completed" | "expired";
export type RatingChannelChoice = "google" | "private" | "both" | "none";
export type TicketStatus = "open" | "in_progress" | "resolved";
export type SubscriptionStatus = "trialing" | "active" | "past_due" | "cancelled";
export type GoogleConnectionStatus = "connected" | "needs_reauth" | "disconnected";
export type ReplyLanguage = "en" | "hi" | "kn";
export type ReplyDraftStatus =
  | "pending_approval"
  | "approved"
  | "auto_approved"
  | "published"
  | "rejected";

export type Business = {
  id: string;
  owner_user_id: string;
  name: string;
  slug: string;
  plan: PlanTier;
  timezone: string;
  locale: string;
  created_at: string;
};

export type Outlet = {
  id: string;
  business_id: string;
  name: string;
  slug: string;
  address: string | null;
  google_maps_url: string | null;
  created_at: string;
};

export type ReviewRequest = {
  id: string;
  outlet_id: string;
  channel: RequestChannel;
  customer_name: string | null;
  customer_contact: string | null;
  status: RequestStatus;
  reminder_sent_at: string | null;
  created_at: string;
};

export type Rating = {
  id: string;
  outlet_id: string;
  request_id: string | null;
  stars: number;
  chose_channel: RatingChannelChoice;
  is_public: boolean;
  public_comment: string | null;
  created_at: string;
};

export type PrivateFeedback = {
  id: string;
  rating_id: string;
  outlet_id: string;
  answers: Record<string, string>;
  theme: string | null;
  created_at: string;
};

export type Ticket = {
  id: string;
  outlet_id: string;
  rating_id: string;
  private_feedback_id: string | null;
  status: TicketStatus;
  sla_due_at: string;
  fix_note: string | null;
  resolved_at: string | null;
  created_at: string;
};

export type Subscription = {
  id: string;
  business_id: string;
  razorpay_subscription_id: string | null;
  plan: PlanTier;
  outlet_count: number;
  status: SubscriptionStatus;
  trial_ends_at: string | null;
  current_period_end: string | null;
  created_at: string;
};

export type GoogleConnection = {
  id: string;
  outlet_id: string;
  google_location_id: string | null;
  google_account_email: string | null;
  access_token: string;
  refresh_token: string;
  token_expires_at: string;
  status: GoogleConnectionStatus;
  created_at: string;
};

export type ReplySettings = {
  outlet_id: string;
  default_language: ReplyLanguage;
  auto_reply_5star_no_text: boolean;
  auto_reply_min_stars_for_review: number;
  updated_at: string;
};

export type GoogleReview = {
  id: string;
  outlet_id: string;
  google_review_id: string;
  reviewer_name: string | null;
  stars: number;
  review_text: string | null;
  review_language: string | null;
  google_create_time: string;
  google_update_time: string;
  matched_request_id: string | null;
  matched_rating_id: string | null;
  has_owner_reply: boolean;
  synced_at: string;
};

export type ReplyDraft = {
  id: string;
  google_review_id: string;
  draft_text: string;
  language: ReplyLanguage;
  grounded_ticket_id: string | null;
  model_used: string;
  status: ReplyDraftStatus;
  published_text: string | null;
  published_at: string | null;
  created_at: string;
};

export type AuditLead = {
  id: string;
  business_name: string;
  email: string;
  rating: number;
  review_count: number;
  recency: string;
  score: number;
  created_at: string;
};

export type ReplySeoKeyword = {
  id: string;
  outlet_id: string;
  keyword: string;
  created_at: string;
};

type TableDef<Row> = {
  Row: Row;
  Insert: Partial<Row>;
  Update: Partial<Row>;
  Relationships: [];
};

type ViewDef<Row> = {
  Row: Row;
  Relationships: [];
};

// businesses_public (supabase/migrations/0004): id/name/slug/plan only,
// never owner_user_id — the public-safe read surface for the businesses
// table.
export type BusinessPublic = Pick<Business, "id" | "name" | "slug" | "plan">;

export type Database = {
  public: {
    Tables: {
      businesses: TableDef<Business>;
      outlets: TableDef<Outlet>;
      requests: TableDef<ReviewRequest>;
      ratings: TableDef<Rating>;
      private_feedback: TableDef<PrivateFeedback>;
      tickets: TableDef<Ticket>;
      subscriptions: TableDef<Subscription>;
      google_connections: TableDef<GoogleConnection>;
      reply_settings: TableDef<ReplySettings>;
      google_reviews: TableDef<GoogleReview>;
      reply_drafts: TableDef<ReplyDraft>;
      audit_leads: TableDef<AuditLead>;
      reply_seo_keywords: TableDef<ReplySeoKeyword>;
    };
    Views: {
      businesses_public: ViewDef<BusinessPublic>;
    };
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

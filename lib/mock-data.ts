// Local fallback data so `npm run dev` renders every Phase 1 page without a
// live Supabase project. Swap for real queries once NEXT_PUBLIC_SUPABASE_URL
// is set (see lib/supabase/env.ts + .env.example).
import type { Outlet, Rating, Ticket, ReviewRequest } from "./supabase/types";

export const mockBusiness = {
  id: "b_demo",
  name: "Smile Studio Dental",
  slug: "smile-studio-dental",
  plan: "starter" as const,
};

export const mockOutlet: Outlet = {
  id: "o_demo",
  business_id: "b_demo",
  name: "Smile Studio Dental, Indiranagar",
  slug: "smile-studio-indiranagar",
  address: "100 Feet Road, Indiranagar, Bengaluru",
  google_maps_url: "https://maps.google.com/?cid=demo",
  created_at: new Date().toISOString(),
};

export const mockPublicRatings: (Rating & { customer_initial?: string })[] = [
  { id: "r1", outlet_id: "o_demo", request_id: null, stars: 5, chose_channel: "google", is_public: true, public_comment: "Dr. Rao explained every step before starting. First time a dentist has made me feel calm.", created_at: "2026-09-28T10:00:00Z", customer_initial: "A." },
  { id: "r2", outlet_id: "o_demo", request_id: null, stars: 4, chose_channel: "google", is_public: true, public_comment: "Clean clinic, on-time appointment. Parking was a little tight.", created_at: "2026-09-25T15:30:00Z", customer_initial: "R." },
  { id: "r3", outlet_id: "o_demo", request_id: null, stars: 2, chose_channel: "both", is_public: true, public_comment: "Waited 40 minutes past my slot. Staff were polite about it but it threw off my afternoon.", created_at: "2026-09-20T09:15:00Z", customer_initial: "K." },
  { id: "r4", outlet_id: "o_demo", request_id: null, stars: 5, chose_channel: "google", is_public: true, public_comment: "Best cleaning I've had in years. Booked my next visit before I even left.", created_at: "2026-09-18T12:00:00Z", customer_initial: "S." },
];

export const mockTickets: (Ticket & { customerLabel: string; stars: number })[] = [
  {
    id: "t1",
    outlet_id: "o_demo",
    rating_id: "r3",
    private_feedback_id: "pf1",
    status: "open",
    sla_due_at: new Date(Date.now() + 1000 * 60 * 60 * 6).toISOString(),
    fix_note: null,
    resolved_at: null,
    created_at: "2026-09-20T09:16:00Z",
    customerLabel: "K. — 2★, waited 40 min past slot",
    stars: 2,
  },
  {
    id: "t2",
    outlet_id: "o_demo",
    rating_id: "r5",
    private_feedback_id: "pf2",
    status: "in_progress",
    sla_due_at: new Date(Date.now() + 1000 * 60 * 60 * 20).toISOString(),
    fix_note: null,
    resolved_at: null,
    created_at: "2026-09-29T08:00:00Z",
    customerLabel: "M. — 3★, billing desk gave the wrong estimate",
    stars: 3,
  },
  {
    id: "t3",
    outlet_id: "o_demo",
    rating_id: "r6",
    private_feedback_id: null,
    status: "resolved",
    sla_due_at: "2026-09-15T10:00:00Z",
    fix_note: "Moved afternoon bookings to staggered 20-minute slots so the front desk isn't double-stacked.",
    resolved_at: "2026-09-15T16:40:00Z",
    created_at: "2026-09-15T09:00:00Z",
    customerLabel: "P. — 2★, front desk felt rushed",
    stars: 2,
  },
];

export const mockRequests: ReviewRequest[] = [
  {
    id: "req1",
    outlet_id: "o_demo",
    channel: "whatsapp",
    customer_name: "Aditi",
    customer_contact: "9876543210",
    status: "sent",
    reminder_sent_at: null,
    created_at: "2026-09-29T11:00:00Z",
  },
  {
    id: "req2",
    outlet_id: "o_demo",
    channel: "email",
    customer_name: "Rohan",
    customer_contact: "rohan@example.com",
    status: "completed",
    reminder_sent_at: null,
    created_at: "2026-09-27T09:30:00Z",
  },
];

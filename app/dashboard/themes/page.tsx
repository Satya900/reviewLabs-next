import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getOwnerThemeFrequency, themeDisplayLabel } from "@/lib/themes";
import type { FeedbackTheme } from "@/lib/ai/theme-extract";

const complaintThemes = new Set<FeedbackTheme>([
  "long_wait",
  "rude_staff",
  "pricing_too_high",
  "cleanliness_issue",
  "poor_communication",
  "booking_difficulty",
  "quality_issue",
  "other_complaint",
]);

export default async function ThemesPage() {
  const themes = await getOwnerThemeFrequency();

  return (
    <div>
      <h1 className="text-display-md text-wise-ink">Themes</h1>
      <p className="mt-2 text-wise-body">
        What customers keep bringing up in private feedback, last 30 days. A daily job tags new
        feedback automatically — this fills in as it runs.
      </p>

      <div className="mt-8 overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Theme</TableHead>
              <TableHead>Mentions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {themes.map((t) => (
              <TableRow key={t.theme}>
                <TableCell>
                  <Badge variant={complaintThemes.has(t.theme) ? "negative" : "positive"}>
                    {themeDisplayLabel[t.theme]}
                  </Badge>
                </TableCell>
                <TableCell className="text-wise-body">{t.count}</TableCell>
              </TableRow>
            ))}
            {themes.length === 0 && (
              <TableRow>
                <TableCell colSpan={2} className="text-wise-mute">
                  No tagged feedback yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

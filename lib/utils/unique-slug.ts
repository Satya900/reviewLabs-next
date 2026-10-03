// Tries the plain slug first, then appends a short random suffix on
// collision. Three attempts is plenty for a slug space this small. Shared
// between app/api/onboarding and app/api/agency/add-client — both insert a
// business + outlet pair and need the same retry-on-collision behavior.
export async function insertWithUniqueSlug<T extends { id: string }>(
  insertOne: (slug: string) => PromiseLike<{ data: T | null; error: { code?: string } | null }>,
  baseSlug: string
): Promise<T> {
  for (let attempt = 0; attempt < 3; attempt++) {
    const slug = attempt === 0 ? baseSlug : `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`;
    const { data, error } = await insertOne(slug);
    if (data) return data;
    if (error?.code !== "23505") throw new Error("Could not create record");
  }
  throw new Error("Could not generate a unique slug");
}

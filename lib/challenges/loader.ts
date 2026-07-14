// lib/challenges/loader.ts
import fs from "fs";
import path from "path";
import { ChallengeSchema } from "./schema";
import { Challenge } from "./types";

const CHALLENGES_DIR = path.join(process.cwd(), "data", "challenges");

// Helper to recursively walk a directory and find all JSON files
function getJsonFiles(dir: string): string[] {
  let results: string[] = [];
  if (!fs.existsSync(dir)) {
    return results;
  }
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getJsonFiles(filePath));
    } else if (file.endsWith(".json")) {
      results.push(filePath);
    }
  });
  return results;
}

let cachedChallenges: Challenge[] | null = null;

export function loadChallenges(): Challenge[] {
  if (cachedChallenges) {
    return cachedChallenges;
  }

  const jsonFiles = getJsonFiles(CHALLENGES_DIR);
  const challenges: Challenge[] = [];

  for (const filePath of jsonFiles) {
    try {
      const fileContent = fs.readFileSync(filePath, "utf-8");
      const jsonData = JSON.parse(fileContent);
      
      // Validate using Zod schema
      const validated = ChallengeSchema.parse(jsonData) as Challenge;
      challenges.push(validated);
    } catch (error) {
      console.error(`Error loading or validating challenge at ${filePath}:`, error);
      throw error;
    }
  }

  // Sort challenges by publishedAt (descending) or by id/slug for consistency
  cachedChallenges = challenges.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  return cachedChallenges;
}

export function getChallengeBySlug(slug: string): Challenge | undefined {
  const all = loadChallenges();
  return all.find((c) => c.slug === slug);
}

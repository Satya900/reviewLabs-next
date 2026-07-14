// app/challenges/ChallengeBrowser.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Challenge, Category, Difficulty } from "@/lib/challenges/types";
import { useProgress } from "@/lib/progress/useProgress";
import { useAuth } from "@/lib/supabase/AuthProvider";
import DifficultyBadge from "@/components/challenge/DifficultyBadge";
import CategoryTag, { categoryLabels } from "@/components/challenge/CategoryTag";
import { GithubIcon } from "@/components/shared/SocialIcons";
import { Clock, CheckCircle2, Circle, Search, SlidersHorizontal, X } from "lucide-react";

interface ChallengeBrowserProps {
  challenges: Challenge[];
}

const BANNER_DISMISSED_KEY = "reviewlabs_signin_banner_dismissed";

export default function ChallengeBrowser({ challenges }: ChallengeBrowserProps) {
  const { user, signInWithGithub } = useAuth();
  const { progress } = useProgress();
  const completedSlugs = progress.map((p) => p.slug);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [selectedDifficulties, setSelectedDifficulties] = useState<Difficulty[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<"all" | "completed" | "uncompleted">("all");
  const [sortBy, setSortBy] = useState<"newest" | "difficulty-asc" | "difficulty-desc">("newest");
  const [bannerDismissed, setBannerDismissed] = useState(
    () => typeof window !== "undefined" && localStorage.getItem(BANNER_DISMISSED_KEY) === "true"
  );

  const dismissBanner = () => {
    setBannerDismissed(true);
    localStorage.setItem(BANNER_DISMISSED_KEY, "true");
  };

  // Filter handlers
  const toggleCategory = (cat: Category) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const toggleDifficulty = (diff: Difficulty) => {
    setSelectedDifficulties((prev) =>
      prev.includes(diff) ? prev.filter((d) => d !== diff) : [...prev, diff]
    );
  };

  // Filter logic
  const filteredChallenges = challenges.filter((c) => {
    // Search query
    if (searchQuery && !c.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    // Category
    if (selectedCategories.length > 0 && !selectedCategories.includes(c.category)) {
      return false;
    }
    // Difficulty
    if (selectedDifficulties.length > 0 && !selectedDifficulties.includes(c.difficulty)) {
      return false;
    }
    // Status
    const isCompleted = completedSlugs.includes(c.slug);
    if (selectedStatus === "completed" && !isCompleted) return false;
    if (selectedStatus === "uncompleted" && isCompleted) return false;

    return true;
  });

  // Sorting logic
  const sortedChallenges = [...filteredChallenges].sort((a, b) => {
    if (sortBy === "newest") {
      return b.publishedAt.localeCompare(a.publishedAt);
    }
    
    const difficultyWeight = { easy: 1, medium: 2, hard: 3 };
    if (sortBy === "difficulty-asc") {
      return difficultyWeight[a.difficulty] - difficultyWeight[b.difficulty];
    }
    if (sortBy === "difficulty-desc") {
      return difficultyWeight[b.difficulty] - difficultyWeight[a.difficulty];
    }
    return 0;
  });

  const categories: Category[] = [
    "hallucinated-apis",
    "logic-errors",
    "security",
    "race-conditions",
    "performance",
    "wrong-patterns",
    "dependencies",
  ];

  const difficulties: Difficulty[] = ["easy", "medium", "hard"];

  return (
    <div className="space-y-8 select-none">
      {/* 1. Header Progress Summary */}
      <div className="p-6 border border-border-subt rounded-lg bg-surface-card flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-success-subtle text-success-text border border-border-subt rounded-lg">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-sans font-bold text-txt-primary tracking-tight">Your Progress</h3>
            <p className="text-xs text-txt-secondary font-sans-humanist">
              You have completed {completedSlugs.length} of {challenges.length} challenges
            </p>
          </div>
        </div>
        <div className="w-full sm:w-64 h-2 bg-border-subt rounded-full overflow-hidden border border-border-subt">
          <div
            className="h-full bg-success transition-all duration-300"
            style={{ width: `${(completedSlugs.length / Math.max(1, challenges.length)) * 100}%` }}
          />
        </div>
      </div>

      {/* 1b. Sign-in banner — non-blocking, dismissible, only shown when signed out */}
      {!user && !bannerDismissed && (
        <div className="p-4 border border-border-subt rounded-lg bg-surface-card flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <GithubIcon className="w-4 h-4 text-txt-secondary flex-shrink-0" />
            <p className="text-xs text-txt-secondary font-sans-humanist">
              Sign in with GitHub to keep your progress across devices — practicing never requires it.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={signInWithGithub}
              className="text-[11px] font-sans font-bold text-txt-primary hover:underline cursor-pointer whitespace-nowrap"
            >
              Sign in
            </button>
            <button
              onClick={dismissBanner}
              className="text-txt-tertiary hover:text-txt-primary transition-colors cursor-pointer"
              aria-label="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 2. Filter Bar */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-txt-tertiary absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search challenges..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border-subt bg-surface-card text-txt-primary text-xs rounded-md focus:outline-none focus:border-accent transition-all font-sans-humanist"
            />
          </div>

          {/* Sort dropdown */}
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-sans font-bold text-txt-secondary uppercase tracking-widest whitespace-nowrap">Sort By</span>
            <select
              value={sortBy}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setSortBy(e.target.value as "newest" | "difficulty-asc" | "difficulty-desc")
              }
              className="px-3 py-2 border border-border-subt bg-surface-card text-txt-primary text-xs font-sans font-medium rounded-md focus:outline-none focus:border-accent transition-all cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="difficulty-asc">Difficulty (Easy first)</option>
              <option value="difficulty-desc">Difficulty (Hard first)</option>
            </select>
          </div>
        </div>

        {/* Filters Grid */}
        <div className="p-6 border border-border-subt rounded-lg bg-surface-card space-y-6">
          <div className="flex items-center gap-2 text-[10px] font-sans font-bold text-txt-primary uppercase tracking-widest">
            <SlidersHorizontal className="w-3.5 h-3.5 text-accent-text" />
            <span>Filter Challenges</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Category selection */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-sans font-bold text-txt-tertiary uppercase tracking-widest">Categories</h4>
              <div className="flex flex-wrap gap-1.5">
                {categories.map((cat) => {
                  const active = selectedCategories.includes(cat);
                  return (
                    <button
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      className={`text-[11px] px-2.5 py-1.5 rounded-md transition-all font-sans font-medium border ${
                        active
                          ? "bg-accent text-txt-inverse border-accent"
                          : "bg-surface-elevated text-txt-secondary border-border-subt hover:border-border-def"
                      }`}
                    >
                      {categoryLabels[cat]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Difficulty selection */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-sans font-bold text-txt-tertiary uppercase tracking-widest">Difficulty</h4>
              <div className="flex flex-wrap gap-1.5">
                {difficulties.map((diff) => {
                  const active = selectedDifficulties.includes(diff);
                  return (
                    <button
                      key={diff}
                      onClick={() => toggleDifficulty(diff)}
                      className={`text-[11px] px-3 py-1.5 rounded-md transition-all font-sans font-medium border lowercase ${
                        active
                          ? "bg-accent text-txt-inverse border-accent"
                          : "bg-surface-elevated text-txt-secondary border-border-subt hover:border-border-def"
                      }`}
                    >
                      {diff}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Status selection */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-sans font-bold text-txt-tertiary uppercase tracking-widest">Completion</h4>
              <div className="flex gap-2">
                {(["all", "completed", "uncompleted"] as const).map((status) => {
                  const active = selectedStatus === status;
                  return (
                    <button
                      key={status}
                      onClick={() => setSelectedStatus(status)}
                      className={`text-[11px] px-3 py-1.5 rounded-md transition-all font-sans font-medium border capitalize ${
                        active
                          ? "bg-accent text-txt-inverse border-accent"
                          : "bg-surface-elevated text-txt-secondary border-border-subt hover:border-border-def"
                      }`}
                    >
                      {status}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Challenge Grid */}
      {sortedChallenges.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedChallenges.map((challenge) => {
            const isCompleted = completedSlugs.includes(challenge.slug);
            return (
              <Link
                key={challenge.id}
                href={`/challenges/${challenge.slug}`}
                className="group flex flex-col justify-between p-6 border border-border-subt rounded-lg bg-surface-card hover:border-border-def hover:bg-surface-elevated transition-all duration-200"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <CategoryTag category={challenge.category} showIcon={false} />
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-txt-tertiary flex-shrink-0" />
                    )}
                  </div>
                  <h3 className="text-base font-sans font-bold text-txt-primary group-hover:text-txt-primary transition-colors leading-snug tracking-tight">
                    {challenge.title}
                  </h3>
                  <p className="text-xs text-txt-secondary line-clamp-2 leading-relaxed font-sans-humanist">
                    {challenge.context}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-border-subt mt-6 pt-4 text-[11px] text-txt-secondary font-medium font-sans">
                  <DifficultyBadge difficulty={challenge.difficulty} />
                  <span className="flex items-center gap-1 text-txt-tertiary font-sans-humanist">
                    <Clock className="w-3.5 h-3.5" />
                    {challenge.timeMinutes} mins
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 border border-border-subt rounded-lg bg-surface-card space-y-4">
          <p className="text-sm font-sans font-semibold text-txt-secondary">
            No challenges match your criteria
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategories([]);
              setSelectedDifficulties([]);
              setSelectedStatus("all");
            }}
            className="text-xs font-sans font-semibold text-txt-primary hover:underline cursor-pointer"
          >
            Reset all filters
          </button>
        </div>
      )}
    </div>
  );
}

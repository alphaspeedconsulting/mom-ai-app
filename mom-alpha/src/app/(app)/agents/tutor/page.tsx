"use client";

import { useState } from "react";
import Link from "next/link";
import { EmptyState } from "@/components/shared/EmptyState";

const SUBJECTS = ["All", "Math", "Science", "English", "Music", "Art", "Languages"] as const;

interface MockTutor {
  id: string;
  name: string;
  subject: string;
  rating: number;
  reviews: number;
  rate: number;
  availability: string;
  badge: string | null;
}

const MOCK_TUTORS: MockTutor[] = [
  { id: "t1", name: "Ms. Rivera", subject: "Math", rating: 4.9, reviews: 47, rate: 45, availability: "Mon-Wed", badge: "Top Rated" },
  { id: "t2", name: "Mr. Chen", subject: "Science", rating: 4.8, reviews: 32, rate: 50, availability: "Tue-Thu", badge: null },
  { id: "t3", name: "Sarah K.", subject: "English", rating: 4.7, reviews: 28, rate: 35, availability: "Flexible", badge: null },
  { id: "t4", name: "Dr. Patel", subject: "Math", rating: 5.0, reviews: 15, rate: 65, availability: "Weekends", badge: "New" },
  { id: "t5", name: "Anna L.", subject: "Music", rating: 4.6, reviews: 21, rate: 40, availability: "Mon-Fri", badge: null },
];

export default function TutorFinderPage() {
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState<string>("All");

  const filtered = MOCK_TUTORS.filter((t) => {
    const matchSearch =
      !search ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.subject.toLowerCase().includes(search.toLowerCase());
    const matchSubject = subject === "All" || t.subject === subject;
    return matchSearch && matchSubject;
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-40 bg-background border-b border-border-subtle/10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <Link
            href="/dashboard"
            className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[20px] text-foreground">arrow_back</span>
          </Link>
          <div className="flex-1">
            <h1 className="font-headline text-alphaai-xl font-bold text-foreground">
              Tutor Finder
            </h1>
          </div>
          <Link
            href="/chat/tutor_finder"
            className="w-9 h-9 rounded-full bg-brand-glow/30 flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[20px] text-brand">chat</span>
          </Link>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-20 pb-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[20px] text-muted-foreground">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tutors by name or subject..."
            className="mom-input pl-11"
          />
        </div>

        {/* Subject filters */}
        <div className="flex gap-2 overflow-x-auto mom-no-scrollbar">
          {SUBJECTS.map((s) => (
            <button
              key={s}
              onClick={() => setSubject(s)}
              className={`px-4 py-2 rounded-full text-alphaai-sm font-medium whitespace-nowrap transition-colors ${
                subject === s
                  ? "bg-brand text-on-primary"
                  : "bg-surface-container text-muted-foreground hover:bg-surface-active"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Tutor cards */}
        {filtered.length === 0 ? (
          <EmptyState
            icon="person_search"
            title="No tutors found"
            description="Try a different search or subject filter."
          />
        ) : (
          <div className="space-y-3">
            {filtered.map((tutor) => (
              <div key={tutor.id} className="mom-card p-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-tertiary-container rounded-full flex items-center justify-center">
                    <span className="font-headline font-bold text-alphaai-base text-tertiary">
                      {tutor.name.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-headline text-alphaai-base font-semibold text-foreground truncate">
                        {tutor.name}
                      </h4>
                      {tutor.badge && (
                        <span className="mom-chip text-alphaai-3xs py-0.5 px-2">
                          {tutor.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-alphaai-xs text-muted-foreground">
                      {tutor.subject} · {tutor.availability}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px] text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>
                          star
                        </span>
                        <span className="text-alphaai-xs font-semibold text-foreground">
                          {tutor.rating}
                        </span>
                        <span className="text-alphaai-3xs text-muted-foreground">
                          ({tutor.reviews})
                        </span>
                      </div>
                      <span className="text-alphaai-xs font-semibold text-foreground">
                        ${tutor.rate}/hr
                      </span>
                    </div>
                  </div>
                </div>
                <button className="w-full mom-btn-outline mt-3 py-2 text-alphaai-sm">
                  Book Intro Session
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

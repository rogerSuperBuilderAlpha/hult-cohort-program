import { describe, expect, it } from "vitest";
import { computeStreak, daysUntil, momentum, progressPercent } from "../src/lib/stats";

const day = (s: string) => new Date(`${s}T12:00:00Z`);

describe("computeStreak", () => {
  it("returns 0 with no completions", () => {
    expect(computeStreak([], day("2026-07-19"))).toBe(0);
  });

  it("counts consecutive days ending today", () => {
    const dates = [day("2026-07-17"), day("2026-07-18"), day("2026-07-19")];
    expect(computeStreak(dates, day("2026-07-19"))).toBe(3);
  });

  it("keeps the streak alive if the last completion was yesterday", () => {
    const dates = [day("2026-07-17"), day("2026-07-18")];
    expect(computeStreak(dates, day("2026-07-19"))).toBe(2);
  });

  it("resets when the last completion is 2+ days old", () => {
    const dates = [day("2026-07-15"), day("2026-07-16")];
    expect(computeStreak(dates, day("2026-07-19"))).toBe(0);
  });

  it("ignores gaps before the current run", () => {
    const dates = [day("2026-07-10"), day("2026-07-18"), day("2026-07-19")];
    expect(computeStreak(dates, day("2026-07-19"))).toBe(2);
  });

  it("counts multiple completions in one day once", () => {
    const dates = [day("2026-07-19"), new Date("2026-07-19T08:00:00Z")];
    expect(computeStreak(dates, day("2026-07-19"))).toBe(1);
  });
});

describe("progressPercent", () => {
  it("is 0 for an empty project", () => {
    expect(progressPercent(0, 0)).toBe(0);
  });
  it("rounds to nearest integer", () => {
    expect(progressPercent(1, 3)).toBe(33);
    expect(progressPercent(2, 3)).toBe(67);
  });
  it("is 100 when everything shipped", () => {
    expect(progressPercent(5, 5)).toBe(100);
  });
});

describe("momentum", () => {
  it("splits completions into this week and last week", () => {
    const now = day("2026-07-19");
    const dates = [
      day("2026-07-18"), // this week
      day("2026-07-14"), // this week
      day("2026-07-10"), // last week
    ];
    expect(momentum(dates, now)).toEqual({ thisWeek: 2, lastWeek: 1, delta: 1 });
  });

  it("ignores completions older than two weeks", () => {
    const now = day("2026-07-19");
    expect(momentum([day("2026-06-01")], now)).toEqual({ thisWeek: 0, lastWeek: 0, delta: 0 });
  });
});

describe("daysUntil", () => {
  it("is 0 for today", () => {
    expect(daysUntil(day("2026-07-19"), day("2026-07-19"))).toBe(0);
  });
  it("is positive for future dates", () => {
    expect(daysUntil(day("2026-07-21"), day("2026-07-19"))).toBe(2);
  });
  it("is negative when overdue", () => {
    expect(daysUntil(day("2026-07-15"), day("2026-07-19"))).toBe(-4);
  });
});

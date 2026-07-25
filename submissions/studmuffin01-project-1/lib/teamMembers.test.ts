import { describe, expect, it } from "vitest";
import { buildMemberDisplayName, parseTeamMembers } from "@/lib/teamMembers";

describe("parseTeamMembers", () => {
  it("returns empty array for invalid input", () => {
    expect(parseTeamMembers(undefined)).toEqual([]);
  });

  it("requires first name", () => {
    expect(parseTeamMembers([{ firstName: "", lastName: "Doe" }])).toEqual([]);
  });

  it("builds display name", () => {
    const members = parseTeamMembers([
      { firstName: "John", lastName: "Smith", email: "john@example.com" },
    ]);
    expect(members[0]?.name).toBe("John Smith");
  });
});

describe("buildMemberDisplayName", () => {
  it("joins first and last", () => {
    expect(buildMemberDisplayName("Jane", "Doe")).toBe("Jane Doe");
  });
});

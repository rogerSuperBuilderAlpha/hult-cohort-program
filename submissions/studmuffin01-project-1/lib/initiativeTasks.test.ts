import { describe, expect, it } from "vitest";
import { parseInitiativeTasks, sanitizeTaskField } from "@/lib/initiativeTasks";

describe("parseInitiativeTasks", () => {
  it("returns empty object for non-object input", () => {
    expect(parseInitiativeTasks(null)).toEqual({});
    expect(parseInitiativeTasks("bad")).toEqual({});
  });

  it("skips invalid slug keys", () => {
    expect(parseInitiativeTasks({ "Bad Slug!": [] })).toEqual({});
  });

  it("parses valid task rows and truncates long fields", () => {
    const result = parseInitiativeTasks({
      "power-upgrade": [
        {
          taskNumber: "1",
          description: "x".repeat(600),
          status: "To Do",
          responsibility: "John",
        },
      ],
    });

    expect(result["power-upgrade"]?.[0]?.description.length).toBeLessThanOrEqual(500);
    expect(result["power-upgrade"]?.[0]?.status).toBe("To Do");
  });
});

describe("sanitizeTaskField", () => {
  it("caps field length", () => {
    expect(sanitizeTaskField("description", "x".repeat(600)).length).toBe(500);
  });
});

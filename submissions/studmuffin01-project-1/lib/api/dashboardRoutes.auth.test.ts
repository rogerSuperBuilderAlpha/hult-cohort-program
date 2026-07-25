import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

vi.mock("@/lib/supabase/userDataRepository", () => ({
  fetchUserAppDataRecord: vi.fn(),
  upsertUserAppData: vi.fn(),
  USER_DATA_KEYS: {
    initiativeTasks: "initiative_tasks",
    teamMembers: "team_members",
  },
}));

import { createClient } from "@/lib/supabase/server";
import { GET as getTasks, PUT as putTasks } from "@/app/api/dashboard/tasks/route";
import { GET as getMembers, PUT as putMembers } from "@/app/api/dashboard/members/route";

function mockUnauthenticatedClient() {
  vi.mocked(createClient).mockResolvedValue({
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
    },
  } as never);
}

describe("dashboard API routes — unauthenticated", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUnauthenticatedClient();
  });

  it("GET /api/dashboard/tasks returns 401", async () => {
    const response = await getTasks();
    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "Not authenticated." });
  });

  it("PUT /api/dashboard/tasks returns 401", async () => {
    const response = await putTasks(
      new Request("http://localhost/api/dashboard/tasks", {
        method: "PUT",
        body: JSON.stringify({}),
      })
    );
    expect(response.status).toBe(401);
  });

  it("GET /api/dashboard/members returns 401", async () => {
    const response = await getMembers();
    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "Not authenticated." });
  });

  it("PUT /api/dashboard/members returns 401", async () => {
    const response = await putMembers(
      new Request("http://localhost/api/dashboard/members", {
        method: "PUT",
        body: JSON.stringify([]),
      })
    );
    expect(response.status).toBe(401);
  });
});

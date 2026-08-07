import { GET_metrics } from "@/lib/platform/handlers";

type Ctx = { params: Promise<{ app_id: string }> };

export async function GET(req: Request, ctx: Ctx) {
  const { app_id } = await ctx.params;
  return GET_metrics(req, app_id);
}

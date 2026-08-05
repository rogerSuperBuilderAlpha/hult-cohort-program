import { cookies } from "next/headers";
import { CoachChat } from "@/components/CoachChat";
import { SessionHeartbeat } from "@/components/SessionHeartbeat";

export default async function CoachPage() {
  const jar = await cookies();
  const hasSession = Boolean(jar.get("pf_session")?.value);

  return (
    <section className="section" style={{ borderTop: "none", paddingTop: "1.5rem" }}>
      {hasSession ? <SessionHeartbeat /> : null}
      <CoachChat canTrack={hasSession} />
    </section>
  );
}

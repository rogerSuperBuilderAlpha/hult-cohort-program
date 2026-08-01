import Link from "next/link";
import { prisma } from "@/lib/prisma/db";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Members — Cursor Boston × Hult Showcase",
  description: "Meet the builders of the Cursor Boston × Hult cohort.",
};

export default async function MembersPage() {
  const members = await prisma.member.findMany({
    orderBy: [{ status: "asc" }, { name: "asc" }],
    include: {
      _count: { select: { projectMembers: true } },
    },
  });

  const active = members.filter((m) => m.status === "active");
  const alumni = members.filter((m) => m.status === "alumni");

  function MemberCard({
    member,
  }: {
    member: (typeof members)[number];
  }) {
    return (
      <Link href={`/members/${member.slug}`}>
        <div className="rounded-[4px] border border-vibe-border bg-vibe-surface dark:border-vibe-border-dark dark:bg-vibe-surface-dark p-6 flex flex-col items-center text-center transition-colors duration-150 hover:border-vibe-accent cursor-pointer">
          <div className="w-[52px] h-[52px] rounded-full bg-vibe-border dark:bg-vibe-border-dark flex items-center justify-center text-lg font-semibold text-vibe-muted mb-3">
            {member.avatar ? (
              <img
                src={member.avatar}
                alt={member.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              member.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
            )}
          </div>
          <h4 className="text-sm font-semibold mb-1">{member.name}</h4>
          {member.status === "alumni" && (
            <span className="text-[0.625rem] px-1.5 py-0.5 rounded-full bg-vibe-alumni text-white font-medium mb-1">
              Alumni
            </span>
          )}
          <p className="text-xs text-vibe-muted">
            {member._count.projectMembers}{" "}
            {member._count.projectMembers === 1 ? "project" : "projects"}
          </p>
        </div>
      </Link>
    );
  }

  return (
    <div className="px-8 max-md:px-5 pt-12 pb-12">
      <div className="pb-3 border-b border-vibe-border dark:border-vibe-border-dark mb-6">
        <h1 className="text-[clamp(1.5rem,3vw,2.5rem)] font-bold tracking-tight">
          Members
        </h1>
      </div>

      {active.length > 0 && (
        <>
          <h2 className="text-sm font-semibold text-vibe-muted mb-4 uppercase tracking-wider">
            Active
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-10">
            {active.map((member) => (
              <MemberCard key={member.id} member={member} />
            ))}
          </div>
        </>
      )}

      {alumni.length > 0 && (
        <>
          <h2 className="text-sm font-semibold text-vibe-muted mb-4 uppercase tracking-wider">
            Alumni
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {alumni.map((member) => (
              <MemberCard key={member.id} member={member} />
            ))}
          </div>
        </>
      )}

      {members.length === 0 && (
        <div className="py-16 text-center">
          <p className="text-vibe-muted text-sm">No members yet.</p>
        </div>
      )}
    </div>
  );
}

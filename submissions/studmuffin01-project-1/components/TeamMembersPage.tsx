"use client";

import TeamMembersPanel from "@/components/TeamMembersPanel";
import SidebarPageFrame, { SidebarPanelCompact } from "@/components/sidebar/SidebarPageFrame";
import { useTeamMembers } from "@/hooks/useTeamMembers";

export default function TeamMembersPage() {
  return (
    <SidebarPageFrame
      title="Team Members"
      subtitle="Manage Your Roster for Task Assignees and Member Progress"
    >
      <TeamMembersContent />
    </SidebarPageFrame>
  );
}

function TeamMembersContent() {
  const { members, addMember, removeMember, isLoaded } = useTeamMembers();

  if (!isLoaded) {
    return null;
  }

  return (
    <SidebarPanelCompact>
      <TeamMembersPanel
        members={members}
        onAddMember={addMember}
        onRemoveMember={removeMember}
      />
    </SidebarPanelCompact>
  );
}

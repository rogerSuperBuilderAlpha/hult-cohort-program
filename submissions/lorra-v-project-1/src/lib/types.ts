export type PrStatus = "pending" | "merged";

export type ContributionType =
  | "doc"
  | "design"
  | "pm_task"
  | "issue_resolved"
  | "feedback_addressed";

export type Profile = {
  id: string;
  display_name: string;
  github_username: string | null;
  created_at: string;
};

export type PullRequest = {
  id: string;
  profile_id: string;
  github_url: string;
  title: string;
  status: PrStatus;
  reviewer_count: number;
  created_at: string;
};

export type Contribution = {
  id: string;
  profile_id: string;
  type: ContributionType;
  description: string;
  created_at: string;
};

export type Vote = {
  id: string;
  voter_id: string;
  recipient_id: string;
  created_at: string;
};

export type MvpStatus = {
  id: string;
  feature_completion_pct: number;
  critical_bugs_open: number;
  e2e_flow_implemented: boolean;
  updated_at: string;
  updated_by: string | null;
};

export type WeeklyActivity = {
  id: string;
  profile_id: string;
  week_start: string;
  active: boolean;
};

export type TaskStatus = "todo" | "in_progress" | "blocked" | "done";

export type ProjectStatus = "active" | "archived";

export type Project = {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
};

export type Task = {
  id: string;
  title: string;
  description: string | null;
  assignee_id: string | null;
  project_id: string | null;
  due_date: string | null;
  status: TaskStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type CohortLevel =
  | "pre_level_1"
  | "builder"
  | "stellar"
  | "galactic";

export type GateCheck = {
  key: string;
  label: string;
  met: boolean;
  current: string;
  target: string;
};

export type CohortMetrics = {
  totalMergedPrs: number;
  uniqueContributors: number;
  mvpFeaturePct: number;
  criticalBugsOpen: number;
  e2eFlowImplemented: boolean;
  weeklyActivePct: number;
  dailyActivePct: number;
  cohortSize: number;
  prsWithTwoPlusReviewers: number;
  contributorsWithFivePlus: number;
};

export type IndividualStats = {
  profile: Profile;
  mergedPrs: number;
  pendingPrs: number;
  contributions: number;
  issuesResolved: number;
  votesReceived: number;
  baseScore: number;
  voteMultiplier: number;
  individualScore: number;
};

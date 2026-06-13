import { getProject } from '@/content/program';
import { getAdminDb, isAdminConfigured } from '@/lib/firebase/admin';
import { cohortOrg } from '@/lib/cohort-config';
import type { CohortStats } from '@/lib/cohort-stats-types';
import { personalizeProgramText } from '@/lib/personalize-program';
import type { ProjectProgress } from './project-progress-types';
import { githubRepoUrl, orgReposSearchUrl } from './project-progress-format';
import { getVoterRatingsMap } from './ratings-server';
import { getWrittenReviewsMap } from './written-reviews-server';

export async function getProjectProgress(
  cohortId: string,
  githubHandle: string,
  projectSlug: string,
  cohortStats: CohortStats
): Promise<ProjectProgress | null> {
  if (!isAdminConfigured()) return null;

  const project = getProject(projectSlug);
  if (!project) return null;

  const db = getAdminDb();
  const org = cohortOrg();
  const repo = personalizeProgramText(project.submission.repoPattern, githubHandle, org, cohortStats);
  const repoUrl = githubRepoUrl(repo);

  const submissionDoc = await db
    .collection('submissions')
    .doc(cohortId)
    .collection('projects')
    .doc(projectSlug)
    .collection('entries')
    .doc(githubHandle)
    .get();

  const submissionData = submissionDoc.exists ? submissionDoc.data()! : null;

  let reviews: ProjectProgress['reviews'] = null;
  if (project.reviews) {
    const [myRatings, writtenReviews] = await Promise.all([
      getVoterRatingsMap(projectSlug, githubHandle),
      getWrittenReviewsMap(projectSlug, githubHandle),
    ]);

    const entriesSnap = await db
      .collection('submissions')
      .doc(cohortId)
      .collection('projects')
      .doc(projectSlug)
      .collection('entries')
      .where('merged', '==', true)
      .get();

    const peers = entriesSnap.docs
      .filter((doc) => doc.id !== githubHandle)
      .map((doc) => {
        const data = doc.data();
        const peerRepo = data.repo as string;
        const myRating = myRatings[doc.id] ?? null;
        const reviewIssueUrl = writtenReviews[doc.id] ?? null;
        return {
          handle: doc.id,
          repo: peerRepo,
          repoUrl: githubRepoUrl(peerRepo),
          prUrl: data.prUrl as string,
          deployUrl: (data.deployUrl as string | null) ?? null,
          reviewFiled: reviewIssueUrl !== null,
          reviewIssueUrl,
          rated: myRating !== null,
          myRating,
        };
      })
      .sort((a, b) => a.handle.localeCompare(b.handle));

    reviews = {
      required: cohortStats.peerReviewCount,
      writtenCompleted: peers.filter((p) => p.reviewFiled).length,
      ratingsCompleted: peers.filter((p) => p.reviewFiled && p.rated).length,
      dueNote: project.reviews.dueNote,
      peers,
      orgReposUrl: orgReposSearchUrl(org, projectSlug),
      voteWeek: project.voteWeek,
      githubVerification: Boolean(process.env.GITHUB_TOKEN?.trim()),
    };
  }

  return {
    projectSlug,
    submission: {
      merged: submissionData?.merged === true,
      prUrl: submissionData?.prUrl,
      deployUrl: submissionData?.deployUrl ?? null,
      repo,
      repoUrl,
    },
    reviews,
  };
}

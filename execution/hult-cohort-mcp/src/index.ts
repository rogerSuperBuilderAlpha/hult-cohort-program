#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { ApiError, HultApiClient } from './api-client.js';
import { newReviewIssueUrl } from './review-issue.js';

const DEFAULT_BASE_URL =
  process.env.HULT_API_BASE_URL?.trim() || 'https://site-nine-rouge-68.vercel.app';

const client = new HultApiClient({
  baseUrl: DEFAULT_BASE_URL,
  idToken: process.env.HULT_ID_TOKEN,
});

function text(data: unknown) {
  return {
    content: [
      {
        type: 'text' as const,
        text: typeof data === 'string' ? data : JSON.stringify(data, null, 2),
      },
    ],
  };
}

function toolError(err: unknown) {
  const message =
    err instanceof ApiError
      ? `[${err.status}] ${err.message}`
      : err instanceof Error
        ? err.message
        : String(err);
  return { isError: true as const, ...text(message) };
}

const campusEnum = z.enum([
  'boston',
  'london',
  'san-francisco',
  'dubai',
  'online',
]);

const server = new McpServer({
  name: 'hult-cohort',
  version: '1.0.0',
});

server.registerTool(
  'get_auth_instructions',
  {
    description:
      'How to authenticate MCP tools with GitHub (Firebase ID token). Required for apply, reviews, and votes.',
  },
  async () =>
    text(
      `Hult Cohort MCP uses the same GitHub sign-in as the website.

1. Open ${DEFAULT_BASE_URL}/apply and sign in with GitHub.
2. Open browser DevTools → Network. Submit a test action or reload while signed in.
3. Find a request to ${DEFAULT_BASE_URL}/api/me (or /api/applications).
4. Copy the Bearer token from the Authorization header (starts with eyJ…).
5. Set environment variable HULT_ID_TOKEN in your MCP config (tokens expire ~1 hour — refresh as needed).

Cursor MCP config example (merge into .cursor/mcp.json):
{
  "mcpServers": {
    "hult-cohort": {
      "command": "node",
      "args": ["ABSOLUTE_PATH/execution/hult-cohort-mcp/dist/index.js"],
      "env": {
        "HULT_ID_TOKEN": "paste-token-here",
        "HULT_API_BASE_URL": "${DEFAULT_BASE_URL}"
      }
    }
  }
}

Public tools (no token): list_program_projects, get_cohort_stats, get_auth_instructions.
Authenticated: get_me, get_project_progress, submit_application, prepare_review_issue, save_written_review, cast_peer_vote.`
    )
);

server.registerTool(
  'auth_status',
  {
    description: 'Check whether HULT_ID_TOKEN is set and valid (calls GET /api/me).',
  },
  async () => {
    if (!client.hasToken()) {
      return text({ ok: false, reason: 'HULT_ID_TOKEN not set. Call get_auth_instructions.' });
    }
    try {
      const me = await client.json<Record<string, unknown>>('/api/me', { auth: true });
      return text({ ok: true, githubHandle: me.githubHandle, admitted: Boolean(me.roster) });
    } catch (err) {
      return toolError(err);
    }
  }
);

server.registerTool(
  'get_cohort_stats',
  {
    description: 'Live enrolled count and peer-review denominator (public).',
  },
  async () => {
    try {
      const stats = await client.json('/api/cohort/stats');
      return text(stats);
    } catch (err) {
      return toolError(err);
    }
  }
);

server.registerTool(
  'list_program_projects',
  {
    description: 'All program projects with slugs, summaries, and whether peer review applies.',
  },
  async () => {
    try {
      const data = await client.json<{ projects: unknown[] }>('/api/program/projects');
      return text(data);
    } catch (err) {
      return toolError(err);
    }
  }
);

server.registerTool(
  'get_me',
  {
    description:
      'Your application status, roster membership, submissions, and cohort stats (requires auth).',
  },
  async () => {
    try {
      const me = await client.json('/api/me', { auth: true });
      return text(me);
    } catch (err) {
      return toolError(err);
    }
  }
);

server.registerTool(
  'get_project_progress',
  {
    description:
      'Submission status, peer list, written reviews, and private votes for a project (enrolled participants).',
    inputSchema: {
      projectSlug: z
        .string()
        .describe('Project slug, e.g. phase-1-project-1. Use list_program_projects.'),
    },
  },
  async ({ projectSlug }) => {
    try {
      const progress = await client.json(
        `/api/program/${encodeURIComponent(projectSlug)}/progress`,
        { auth: true }
      );
      return text(progress);
    } catch (err) {
      return toolError(err);
    }
  }
);

server.registerTool(
  'submit_application',
  {
    description:
      'Submit Fall 2026 cohort application (requires GitHub sign-in token matching your account).',
    inputSchema: {
      firstName: z.string(),
      lastName: z.string(),
      email: z.string().email(),
      motivation: z.string().describe('Why you want to join'),
      project1Idea: z.string().describe('Initial idea for Project 1 PM platform'),
      timezone: z.string().describe('e.g. America/New_York'),
      campus: campusEnum,
      referralSource: z.string().describe('How you heard about the program'),
      hultStudentId: z.string().optional(),
      confirmToolingAffordable: z
        .boolean()
        .describe('Confirm ~$400/mo tooling + Hult course registration'),
      confirmPublicWork: z
        .boolean()
        .describe('Confirm your work will be public on GitHub'),
    },
  },
  async (input) => {
    if (!input.confirmToolingAffordable || !input.confirmPublicWork) {
      return toolError(new Error('Both confirmations must be true to apply.'));
    }

    try {
      const body: Record<string, string> = {
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        motivation: input.motivation,
        project1Idea: input.project1Idea,
        timezone: input.timezone,
        campus: input.campus,
        referralSource: input.referralSource,
        confirmTooling: 'on',
        confirmPublicWork: 'on',
        confirmPolicies: 'on',
      };
      if (input.hultStudentId) body.hultStudentId = input.hultStudentId;

      const result = await client.json('/api/applications', {
        method: 'POST',
        auth: true,
        jsonBody: body,
      });
      return text(result);
    } catch (err) {
      return toolError(err);
    }
  }
);

server.registerTool(
  'prepare_review_issue',
  {
    description:
      'Get GitHub issue template URL and peer deploy/PR links before filing a written review.',
    inputSchema: {
      projectSlug: z.string(),
      revieweeHandle: z.string().describe('GitHub handle without @'),
    },
  },
  async ({ projectSlug, revieweeHandle }) => {
    try {
      const progress = await client.json<{
        reviews?: {
          peers: Array<{
            handle: string;
            repo: string;
            deployUrl: string | null;
            prUrl: string;
          }>;
        };
      }>(`/api/program/${encodeURIComponent(projectSlug)}/progress`, { auth: true });

      const peer = progress.reviews?.peers.find(
        (p) => p.handle === revieweeHandle.trim().toLowerCase()
      );
      if (!peer) {
        return toolError(new Error(`Peer @${revieweeHandle} not found in eligible list.`));
      }

      const me = await client.json<{ githubHandle: string }>('/api/me', { auth: true });

      return text({
        revieweeHandle: peer.handle,
        steps: [
          '1. Open deployUrl and test their app',
          '2. Read prUrl (submission PR)',
          '3. Open issueTemplateUrl, file issue titled Review by @{you}',
          '4. Call save_written_review with the issue URL',
          '5. Call cast_peer_vote with up or down',
        ],
        deployUrl: peer.deployUrl,
        prUrl: peer.prUrl,
        repo: peer.repo,
        issueTemplateUrl: newReviewIssueUrl(peer.repo, me.githubHandle),
        issueTitleRequired: `Review by @${me.githubHandle}`,
      });
    } catch (err) {
      return toolError(err);
    }
  }
);

server.registerTool(
  'save_written_review',
  {
    description:
      'Save GitHub issue URL after filing written review on peer repo (unlocks voting).',
    inputSchema: {
      projectSlug: z.string(),
      revieweeHandle: z.string(),
      issueUrl: z.string().url().describe('URL of the GitHub issue you filed on their repo'),
    },
  },
  async ({ projectSlug, revieweeHandle, issueUrl }) => {
    try {
      const result = await client.json(
        `/api/program/${encodeURIComponent(projectSlug)}/written-reviews`,
        {
          method: 'POST',
          auth: true,
          jsonBody: { revieweeHandle, issueUrl },
        }
      );
      return text(result);
    } catch (err) {
      return toolError(err);
    }
  }
);

server.registerTool(
  'cast_peer_vote',
  {
    description:
      'Cast private thumbs up or down on a peer build (requires save_written_review first).',
    inputSchema: {
      projectSlug: z.string(),
      revieweeHandle: z.string(),
      rating: z.enum(['up', 'down']).describe('up = thumbs up, down = thumbs down'),
    },
  },
  async ({ projectSlug, revieweeHandle, rating }) => {
    try {
      const result = await client.json(
        `/api/program/${encodeURIComponent(projectSlug)}/ratings`,
        {
          method: 'POST',
          auth: true,
          jsonBody: { revieweeHandle, rating },
        }
      );
      return text(result);
    } catch (err) {
      return toolError(err);
    }
  }
);

server.registerPrompt(
  'peer_review_workflow',
  {
    description: 'Step-by-step prompt for completing one peer review and vote via MCP',
    argsSchema: {
      projectSlug: z.string().default('phase-1-project-1'),
      revieweeHandle: z.string(),
    },
  },
  async ({ projectSlug, revieweeHandle }) => ({
    messages: [
      {
        role: 'user',
        content: {
          type: 'text',
          text: `Complete a peer review for @${revieweeHandle} on project ${projectSlug} using Hult Cohort MCP tools:

1. Call prepare_review_issue with projectSlug and revieweeHandle
2. Open deployUrl, test the app; read prUrl
3. Open issueTemplateUrl on GitHub and file the review issue
4. Call save_written_review with the issue URL
5. Call cast_peer_vote with rating "up" or "down"

Use get_project_progress to see remaining peers. Votes are private.`,
        },
      },
    ],
  })
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

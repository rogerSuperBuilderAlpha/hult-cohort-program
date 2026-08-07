# Week 4 Submission — @gge513

The Agent Company, Episode 1: The Launch. A learning application for the Ludwitt/Hult platform,
teaching how an executive launches a company staffed only by AI agents.

Repo: https://github.com/gge513/agent-company
Production URL: https://agent-company-ep1.vercel.app

Five modules, each ending in a scored drill rather than a comprehension quiz. The learner does
not leave knowing what I did, they leave holding what they built: their first agent charter,
their delegation risk ladder, the reporting rules for their own two-agent org, their launch
requirements tiered by evidence, and the evidence standard their next ship date has to clear.
Aimed at executives and board members, no code and no prerequisites anywhere in it.

The course is built from the real artifacts of the week that built it, and that week was run as
a six-seat agent company: a chief of staff, a market analyst, a learning designer, a platform
engineer, an adversarial QA seat chartered to refute the builder rather than confirm it, and a
read-only compliance seat that could check a submission but never file one. The modules teach
from that run's actual decisions, including the ones that went wrong. Module 3 is a scope-creep
incident from day one. Module 4 is a requirement that moved twice in twenty-four hours. Module 5
is the QA seat finding defects the builder missed, which it did, twice.

Next.js on Vercel. An HS256 JWT launch gate with a four-way validation matrix, server-side event
emission, and server-side grading where the answer keys never reach the browser. Three
adversarial QA passes against clean extractions of each committed tree; every defect found was
fixed rather than documented away, including one HIGH severity issue that was latent only
because the feature shipped behind a default-off flag.

Full write-up, integration evidence, and the honest list of what has not been verified are in
the pull request description.

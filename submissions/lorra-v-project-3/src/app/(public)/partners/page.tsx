import Link from "next/link";
import { PartnerEnquiryForm } from "@/components/partners/PartnerEnquiryForm";
import { NetworkBackdrop } from "@/components/showcase/NetworkBackdrop";
import { Button } from "@/components/ui/Button";
import {
  listPublishedBuilders,
  listPublishedProjects,
} from "@/lib/showcase";

type Props = {
  searchParams: Promise<{ participant?: string; project?: string }>;
};

export default async function PartnersPage({ searchParams }: Props) {
  const params = await searchParams;
  const participantId = params.participant?.trim() || null;
  const projectId = params.project?.trim() || null;

  const [projects, builders] = await Promise.all([
    listPublishedProjects({ limit: 100 }),
    listPublishedBuilders(100),
  ]);

  const projectOptions = projects.map((p) => ({
    value: p.id,
    label: p.name,
  }));
  const participantOptions = builders
    .filter((b) => b.visible_to_partners)
    .map((b) => ({
      value: b.id,
      label: b.name || "Builder",
    }));

  const selectedProject = projectId
    ? projects.find((p) => p.id === projectId)
    : null;
  const selectedBuilder = participantId
    ? builders.find((b) => b.id === participantId)
    : null;

  const prefillNote =
    selectedBuilder || selectedProject
      ? [
          selectedBuilder?.name
            ? `Builder: ${selectedBuilder.name}`
            : null,
          selectedProject?.name
            ? `Project: ${selectedProject.name}`
            : null,
        ]
          .filter(Boolean)
          .join(" · ")
      : null;

  return (
    <div className="relative overflow-hidden">
      <NetworkBackdrop
        tone="partners"
        className="opacity-60 [mask-image:linear-gradient(to_bottom,black_0%,transparent_70%)]"
      />
      <div className="relative mx-auto max-w-6xl px-6 py-16 md:py-20">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:items-start">
          <div className="max-w-2xl space-y-6">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-accent-partners">
                Partners
              </p>
              <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight md:text-5xl">
                Partner with the Hult Summer Cohort
              </h1>
              <p className="mt-4 text-lg leading-relaxed text-foreground-muted">
                Builders here ship in public — with project updates, approved
                campaign stories, and peer amplification. Partners can plug into
                pilots, mentorship, distribution, sponsorship, and early adoption
                grounded in real evidence.
              </p>
            </div>

            {prefillNote ? (
              <div className="rounded-xl border border-accent-partners/40 bg-accent-partners/10 px-4 py-3 text-sm text-accent-partners">
                Prefilling your enquiry for {prefillNote}.
              </div>
            ) : null}

            <div className="flex flex-wrap gap-2">
              <Link href="/projects" className="inline-flex">
                <Button variant="outline" accent="projects">
                  Browse projects
                </Button>
              </Link>
              <Link href="/builders" className="inline-flex">
                <Button variant="outline" accent="builders">
                  Meet builders
                </Button>
              </Link>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-background-elevated/90 p-6 backdrop-blur-sm">
            <h2 className="font-display text-xl font-semibold">
              Express interest
            </h2>
            <p className="mt-1 text-sm text-foreground-muted">
              Tell us who you are and what you’re looking for. No account
              required.
            </p>
            <div className="mt-6">
              <PartnerEnquiryForm
                projects={projectOptions}
                participants={participantOptions}
                defaultProjectId={
                  selectedProject ? selectedProject.id : null
                }
                defaultParticipantId={
                  selectedBuilder ? selectedBuilder.id : null
                }
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

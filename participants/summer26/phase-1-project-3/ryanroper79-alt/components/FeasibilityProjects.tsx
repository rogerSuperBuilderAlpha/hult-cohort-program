import { positioning } from '@/data/cohort';
import {
  feasibilityProjects,
  feasibilityReportContents,
  reportRequestMailto,
  type FeasibilityProject,
} from '@/data/feasibility-projects';

export function FeasibilityProjects() {
  return (
    <section aria-labelledby="feasibility-heading" className="mt-12">
      <h2 id="feasibility-heading" className="font-display text-2xl text-ceal-mangrove md:text-3xl">
        Feasibility studies — choose a project
      </h2>
      <p className="mt-4 max-w-prose text-ceal-muted">
        CEAL Green has conducted feasibility studies across three Caribbean infrastructure
        categories. Choose the project you want to invest in — we send a copy of the full report
        before you commit capital.
      </p>

      <ul className="mt-8 grid gap-4 md:grid-cols-3">
        {feasibilityProjects.map((project) => (
          <li key={project.id}>
            <ProjectCard project={project} />
          </li>
        ))}
      </ul>

      <div className="mt-10 rounded-lg border border-ceal-line bg-ceal-panel p-6 md:p-8">
        <h3 className="font-display text-xl text-ceal-mangrove">What the report includes</h3>
        <p className="mt-2 text-sm text-ceal-muted">
          Each feasibility report is project-specific — figures are not published on this site.
        </p>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {feasibilityReportContents.map((item) => (
            <li key={item} className="flex gap-2 text-sm text-ceal-ink">
              <span className="text-ceal-leaf" aria-hidden="true">
                ·
              </span>
              {item}
            </li>
          ))}
        </ul>
        <p className="mt-6 text-ceal-muted">
          We work with a cohort of investors on each project — structured so delivery, governance,
          and return on investment are aligned before construction starts.
        </p>
      </div>
    </section>
  );
}

function ProjectCard({ project }: { project: FeasibilityProject }) {
  const mailto = reportRequestMailto(project, positioning.contact);

  return (
    <article className="flex h-full flex-col rounded-lg border border-ceal-line bg-ceal-white p-5">
      <p className="font-mono text-xs uppercase tracking-wider text-ceal-leaf">{project.region}</p>
      <h3 className="mt-2 font-display text-xl text-ceal-mangrove">{project.title}</h3>
      <p className="mt-3 flex-1 text-sm text-ceal-muted">{project.summary}</p>
      <a
        href={mailto}
        className="mt-6 inline-block rounded-md bg-ceal-sun px-4 py-2.5 text-center text-sm font-semibold text-ceal-ink focus-ring hover:bg-ceal-sunGlow"
      >
        Request this report
      </a>
    </article>
  );
}

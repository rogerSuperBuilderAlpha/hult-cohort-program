import { execSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const submission = "submissions/studmuffin01-project-1";
const branch = "participants/summer26/phase-1-project-1/studmuffin01";
const forkUrl = "https://github.com/Studmuffin01/hult-cohort-program.git";
const commitMessage = "INITIARA: Phase B — initiative archive/edit, team roster, task filters";
const logPath = join(dirname(fileURLToPath(import.meta.url)), "push-phase-b.log");

function run(command) {
  return execSync(command, { cwd: repoRoot, encoding: "utf8", stdio: "pipe" });
}

const lines = [];

try {
  lines.push(`Repo: ${repoRoot}`);

  try {
    run("git remote get-url fork");
  } catch {
    run(`git remote add fork ${forkUrl}`);
  }
  run(`git remote set-url fork ${forkUrl}`);

  try {
    run(`git checkout ${branch}`);
  } catch {
    run(`git checkout -b ${branch}`);
  }

  run(`git add ${submission}`);

  const status = run("git status -sb");
  lines.push(status.trim());

  const diff = run("git diff --cached --stat");
  if (diff.trim()) {
    run(`git commit -m "${commitMessage.replace(/"/g, '\\"')}"`);
    lines.push(`Committed: ${commitMessage}`);
  } else {
    lines.push("Nothing new to commit.");
  }

  const pushOut = run(`git push -u fork ${branch}`);
  lines.push(pushOut.trim());
  lines.push("PUSH OK");
} catch (error) {
  lines.push("PUSH FAILED");
  lines.push(error instanceof Error ? error.message : String(error));
  if (error && typeof error === "object" && "stdout" in error) {
    lines.push(String(error.stdout ?? ""));
  }
  if (error && typeof error === "object" && "stderr" in error) {
    lines.push(String(error.stderr ?? ""));
  }
  writeFileSync(logPath, lines.join("\n"), "utf8");
  process.exit(1);
}

lines.push(run("git log -1 --oneline").trim());
lines.push(run("git status -sb").trim());
writeFileSync(logPath, lines.join("\n"), "utf8");
console.log(lines.join("\n"));

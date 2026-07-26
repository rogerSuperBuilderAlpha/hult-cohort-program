import { RegisterClient } from "@/components/RegisterClient";
import { isGithubOAuthConfigured } from "@/lib/github-oauth";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  return (
    <RegisterClient
      githubEnabled={isGithubOAuthConfigured()}
      githubError={params.error ?? null}
    />
  );
}

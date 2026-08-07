import { LoginClient } from "@/components/LoginClient";
import { isGithubOAuthConfigured } from "@/lib/github-oauth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  return (
    <LoginClient
      githubEnabled={isGithubOAuthConfigured()}
      githubError={params.error ?? null}
    />
  );
}

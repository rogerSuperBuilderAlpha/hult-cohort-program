import { LoginForm } from "@/components/auth/LoginForm";
import { authErrorFromSearchParam } from "@/lib/auth/errors";
import { safeRedirectPath } from "@/lib/auth/safe-redirect";

type Props = {
  searchParams: Promise<{ next?: string; error?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const params = await searchParams;
  const next = safeRedirectPath(params.next);
  const initialError = authErrorFromSearchParam(params.error);

  return <LoginForm next={next} initialError={initialError} />;
}

import { redirect } from "next/navigation";

type Props = { params: Promise<{ handle: string }> };

export default async function PeopleHandleRedirect({ params }: Props) {
  const { handle } = await params;
  redirect(`/developers/${handle}`);
}

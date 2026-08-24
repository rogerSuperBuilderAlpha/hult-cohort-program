import { redirect } from 'next/navigation';

/** Shorter URL for sharing at in-person events. */
export default function HackathonIndexPage() {
  redirect('/hackathon/trustabl');
}

import { Suspense } from "react";
import { LaunchGate } from "@/components/LaunchGate";

export default function LaunchPage() {
  return (
    <Suspense fallback={<section className="gate"><h1>Opening session…</h1></section>}>
      <LaunchGate />
    </Suspense>
  );
}

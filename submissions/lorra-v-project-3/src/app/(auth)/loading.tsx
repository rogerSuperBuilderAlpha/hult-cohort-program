import { Spinner } from "@/components/ui/Spinner";

export default function AuthLoading() {
  return (
    <div className="flex justify-center py-16">
      <Spinner label="Loading…" />
    </div>
  );
}

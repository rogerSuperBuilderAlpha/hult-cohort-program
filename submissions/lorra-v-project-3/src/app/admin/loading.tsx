import { Spinner } from "@/components/ui/Spinner";

export default function AdminLoading() {
  return (
    <div className="flex justify-center py-24">
      <Spinner label="Loading admin…" />
    </div>
  );
}

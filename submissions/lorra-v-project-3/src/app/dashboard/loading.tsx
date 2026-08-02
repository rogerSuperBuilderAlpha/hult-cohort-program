import { Spinner } from "@/components/ui/Spinner";

export default function DashboardLoading() {
  return (
    <div className="flex justify-center py-16">
      <Spinner label="Loading dashboard…" />
    </div>
  );
}

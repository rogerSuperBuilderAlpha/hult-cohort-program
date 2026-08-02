import { Spinner } from "@/components/ui/Spinner";

export default function PublicLoading() {
  return (
    <div className="flex justify-center py-24">
      <Spinner label="Loading showcase…" />
    </div>
  );
}

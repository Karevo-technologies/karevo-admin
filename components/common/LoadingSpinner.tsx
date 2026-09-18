import { Spinner } from "@/components/ui/spinner";

// A simple loading indicator used consistently while data loads
export function LoadingSpinner() {
  return (
    <div className="flex justify-center py-12">
      <Spinner className="size-9 text-primary" />
    </div>
  );
}

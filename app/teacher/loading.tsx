import { Card } from "@/components/shared/card";
import { LoadingState } from "@/components/shared/loading-state";

export default function Loading() {
  return (
    <Card className="p-6">
      <LoadingState label="Loading teacher view…" />
    </Card>
  );
}

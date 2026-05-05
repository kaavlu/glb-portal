"use client";

import { Card } from "@/components/shared/card";
import { ErrorState } from "@/components/shared/error-state";

export default function ParentError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <Card className="p-6">
      <ErrorState title="Parent page failed to load" message={error.message} onRetry={reset} />
    </Card>
  );
}

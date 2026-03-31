import { EmptyState } from "@/components/ds/empty-state";
import notFoundIllustration from "@/assets/illustrations/not-found.webp";
import { PageTransition } from "@/components/ui/animated";

export default function NotFound() {
  return (
    <PageTransition className="flex h-full w-full items-center justify-center">
      <EmptyState
        illustration={notFoundIllustration}
        title="Page Not Found"
        description="The page you're looking for doesn't exist or has been moved."
        actionLabel="Back to Dashboard"
        actionHref="/"
      />
    </PageTransition>
  );
}

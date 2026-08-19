export default function EventInvestigationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <PlaceholderPage
      title="Flood Event Investigation"
      description="Timeline reconstruction, rainfall/water-level graphs, root cause analysis, and event replay."
      params={params}
    />
  );
}

async function PlaceholderPage({
  title,
  description,
  params,
}: {
  title: string;
  description: string;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
      <p className="max-w-lg text-sm text-muted-foreground">{description}</p>
      <p className="font-mono text-xs text-primary">Event: {id}</p>
      <span className="rounded border border-border bg-secondary px-3 py-1 text-xs text-muted-foreground">
        Phase 4–5 implementation
      </span>
    </div>
  );
}

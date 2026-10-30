export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <section className="w-full max-w-xl rounded-xl border bg-card p-8 shadow-sm">
        <p className="text-sm font-medium text-muted-foreground">KisanPilot</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Farm decisions, grounded in live data.
        </h1>
        <p className="mt-4 text-muted-foreground">
          The advisory experience is being prepared. It will show sources and
          timestamps with every factual answer.
        </p>
      </section>
    </main>
  );
}


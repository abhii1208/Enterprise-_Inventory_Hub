type AppLoaderProps = {
  label?: string;
};

export function AppLoader({ label = "Loading" }: AppLoaderProps) {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="surface flex w-full max-w-md flex-col items-center gap-4 px-8 py-10 text-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-100 border-t-brand-500" />
        <div>
          <p className="font-display text-2xl text-ink">Inventory Hub</p>
          <p className="mt-2 text-sm text-muted">{label}</p>
        </div>
      </div>
    </div>
  );
}


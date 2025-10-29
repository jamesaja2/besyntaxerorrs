export function LoadingScreen() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="flex items-center space-x-3 text-school-text">
        <span className="inline-flex h-3 w-3 animate-ping rounded-full bg-school-accent" aria-hidden />
        <span className="text-sm font-semibold tracking-wide uppercase text-school-text-muted">
          Memuat konten…
        </span>
      </div>
    </div>
  );
}

export default LoadingScreen;

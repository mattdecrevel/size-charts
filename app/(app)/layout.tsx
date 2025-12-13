export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      {/* Subtle background glow */}
      <div className="fixed inset-0 hero-glow pointer-events-none" aria-hidden="true" />

      {/* Content rendered by child layouts */}
      <div className="relative">
        {children}
      </div>
    </div>
  );
}

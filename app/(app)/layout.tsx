export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Subtle background glow */}
      <div className="fixed inset-0 hero-glow pointer-events-none" aria-hidden="true" />
      {children}
    </>
  );
}

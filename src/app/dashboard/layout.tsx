export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="theme-dashboard flex flex-col flex-1 bg-background text-foreground transition-colors duration-300">
      {children}
    </div>
  );
}

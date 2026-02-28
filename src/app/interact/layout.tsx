export default function InteractLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="overflow-auto h-[100dvh]">{children}</div>;
}

export function Topbar({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle: string;
  right?: React.ReactNode;
}) {
  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">{subtitle}</p>
        <h1>{title}</h1>
      </div>
      {right}
    </header>
  );
}

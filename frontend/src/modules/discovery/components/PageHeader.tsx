export function PageHeader({ title, subtitle }: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h1 className="section-title" style={{ marginBottom: 4 }}>{title}</h1>
      {subtitle && (
        <span style={{ color: "var(--text-soft)", fontSize: 14 }}>
          {subtitle}
        </span>
      )}
    </div>
  );
}

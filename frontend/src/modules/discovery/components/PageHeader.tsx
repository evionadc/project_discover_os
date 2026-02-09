export function PageHeader({ title, subtitle }: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h1 style={{ fontSize: 36, marginBottom: 4 }}>{title}</h1>
      {subtitle && (
        <span style={{ color: "#94a3b8", fontSize: 14 }}>
          {subtitle}
        </span>
      )}
    </div>
  );
}

export function EmptyState({ title, description }: {
  title: string;
  description: string;
}) {
  return (
    <div style={{ marginTop: 48, color: "#94a3b8" }}>
      <h3 style={{ color: "#f8fafc" }}>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

import type { Story } from "../types";

interface StoryTableProps {
  stories: Story[];
}

export default function StoryTable({ stories }: StoryTableProps) {
  if (stories.length === 0) {
    return <p>No stories yet.</p>;
  }

  return (
    <table style={{ marginTop: 16, width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          <th style={{ textAlign: "left", borderBottom: "1px solid #e5e7eb", paddingBottom: 8 }}>Title</th>
          <th style={{ textAlign: "left", borderBottom: "1px solid #e5e7eb", paddingBottom: 8 }}>Status</th>
        </tr>
      </thead>
      <tbody>
        {stories.map((story) => (
          <tr key={story.id}>
            <td style={{ padding: "8px 0" }}>{story.title}</td>
            <td style={{ padding: "8px 0" }}>{story.status ?? "todo"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

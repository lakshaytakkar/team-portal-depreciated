function formatInlineText(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|₹[\d,]+)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={i}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("*") && part.endsWith("*")) return <em key={i}>{part.slice(1, -1)}</em>;
    if (part.startsWith("`") && part.endsWith("`")) return <code key={i} className="bg-muted px-1 py-0.5 rounded text-xs">{part.slice(1, -1)}</code>;
    return part;
  });
}

export function MessageContent({ content }: { content: string }) {
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="prose prose-sm dark:prose-invert max-w-none break-words">
      {parts.map((part, i) => {
        if (part.startsWith("```")) {
          const match = part.match(/```(\w*)\n?([\s\S]*?)```/);
          const lang = match?.[1] || "";
          const code = match?.[2] || part.slice(3, -3);
          return (
            <pre key={i} className="bg-muted rounded-lg p-3 text-xs overflow-x-auto my-2">
              {lang && (
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{lang}</div>
              )}
              <code>{code.trim()}</code>
            </pre>
          );
        }
        const lines = part.split("\n");
        return (
          <span key={i}>
            {lines.map((line, j) => {
              const tableMatch = line.match(/^\|(.+)\|$/);
              if (tableMatch) {
                if (line.match(/^\|[\s-:|]+\|$/)) return null;
                const cells = tableMatch[1].split("|").map((c) => c.trim());
                return (
                  <div key={j} className="flex gap-2 text-xs py-0.5 font-mono">
                    {cells.map((cell, k) => (
                      <span key={k} className="flex-1 min-w-0 truncate">{cell}</span>
                    ))}
                  </div>
                );
              }
              if (line.startsWith("### ")) return <h3 key={j} className="text-sm font-semibold mt-2 mb-1">{line.slice(4)}</h3>;
              if (line.startsWith("## ")) return <h2 key={j} className="text-sm font-bold mt-2 mb-1">{line.slice(3)}</h2>;
              if (line.startsWith("# ")) return <h1 key={j} className="text-base font-bold mt-2 mb-1">{line.slice(2)}</h1>;
              if (line.startsWith("- ")) return <li key={j} className="ml-3 text-sm">{formatInlineText(line.slice(2))}</li>;
              if (line.match(/^\d+\.\s/)) return <li key={j} className="ml-3 text-sm list-decimal">{formatInlineText(line.replace(/^\d+\.\s/, ""))}</li>;
              if (line.trim() === "") return <br key={j} />;
              return <p key={j} className="text-sm my-0.5 leading-relaxed">{formatInlineText(line)}</p>;
            })}
          </span>
        );
      })}
    </div>
  );
}

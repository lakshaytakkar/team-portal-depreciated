import { useState } from "react";
import { Wrench, ChevronDown, ChevronUp } from "lucide-react";

interface ToolCallDisplayProps {
  toolName?: string;
  args?: Record<string, unknown>;
  result?: unknown;
}

export function ToolCallDisplay({ toolName, args, result }: ToolCallDisplayProps) {
  const [expanded, setExpanded] = useState(false);
  const displayName = toolName || "Unknown tool";

  const toolLabels: Record<string, string> = {
    getSchema: "Inspecting database schema",
    queryTable: "Querying CRM data",
    proposeMutation: "Proposing change",
    createRecord: "Creating record",
    updateRecord: "Updating record",
    deleteRecord: "Deleting record",
  };

  return (
    <div className="my-2 rounded-lg border bg-muted/50 text-sm overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-muted/80 transition-colors"
        data-testid={`tool-call-${displayName}`}
      >
        <Wrench className="h-3.5 w-3.5 text-primary shrink-0" />
        <span className="text-muted-foreground font-medium flex-1">
          {toolLabels[displayName] || displayName}
        </span>
        {expanded ? (
          <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        )}
      </button>
      {expanded && (
        <div className="px-3 pb-2 space-y-1">
          {args && (
            <pre className="text-xs text-muted-foreground bg-background rounded p-2 overflow-x-auto whitespace-pre-wrap break-all">
              {typeof args === "string" ? args : JSON.stringify(args, null, 2)}
            </pre>
          )}
          {result && (
            <pre className="text-xs text-green-600 dark:text-green-400 bg-background rounded p-2 overflow-x-auto whitespace-pre-wrap break-all max-h-40 overflow-y-auto">
              {typeof result === "string" ? result : JSON.stringify(result, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}

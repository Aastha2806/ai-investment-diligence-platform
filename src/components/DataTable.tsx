export interface DataTableRow {
  label: string;
  values: (string | number)[];
  emphasize?: boolean;
  indent?: boolean;
}

export default function DataTable({
  columns,
  rows,
}: {
  columns: string[];
  rows: DataTableRow[];
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-surface-muted text-left">
            <th className="px-4 py-2.5 font-medium text-foreground-muted">Metric</th>
            {columns.map((col) => (
              <th key={col} className="px-4 py-2.5 text-right font-medium text-foreground-muted">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={row.label + i}
              className={`border-b border-border last:border-0 ${row.emphasize ? "bg-surface-muted/60 font-semibold" : ""}`}
            >
              <td className={`px-4 py-2 text-foreground ${row.indent ? "pl-8 font-normal text-foreground-muted" : ""}`}>
                {row.label}
              </td>
              {row.values.map((v, j) => (
                <td key={j} className="px-4 py-2 text-right font-tabular text-foreground">
                  {v}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

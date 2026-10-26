import type { ReactNode } from "react";

export type Column<T> = { key: string; header: string; numeric?: boolean; render: (row: T) => ReactNode };

type Props<T> = { columns: Column<T>[]; rows: T[]; rowKey: (row: T) => string; caption: string };

export function Table<T>({ columns, rows, rowKey, caption }: Props<T>) {
  return (
    <div className="table-wrap">
      <table className="table">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} scope="col" className={c.numeric ? "num" : undefined}>{c.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={rowKey(row)}>
              {columns.map((c) => (
                <td key={c.key} className={c.numeric ? "num" : undefined}>{c.render(row)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

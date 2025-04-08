type ExportFormat = "latex" | "plaintext" | "csv";

export class ExportHelper {
  static exportTable(table: HTMLTableElement, format: ExportFormat): string {
    switch (format) {
      case "latex":
        return this.exportAsLaTeX(table);
      case "plaintext":
        return this.exportAsPlainText(table);
      case "csv":
        return this.exportAsCSV(table);
      default:
        // Optional: handle unexpected format, though TypeScript should prevent this
        console.warn(`Unsupported export format: ${format}`);
        return "";
    }
  }

  static exportAsLaTeX(table: HTMLTableElement): string {
    if (!table || !table.rows || table.rows.length === 0 || !table.rows[0].cells) {
      return ""; // Return empty string if table is invalid
    }
    const numCols = table.rows[0].cells.length;
    let latex = "\\begin{tabular}{|" + "c|".repeat(numCols) + "}\n\\hline\n";

    for (let i = 0; i < table.rows.length; i++) {
      const row = table.rows[i];
      const cells: string[] = [];
      for (let j = 0; j < row.cells.length; j++) {
        // Ensure innerText exists and is a string
        cells.push(row.cells[j]?.innerText || "");
      }
      latex += cells.join(" & ") + " \\\\\n\\hline\n";
    }
    latex += "\\end{tabular}";
    return latex;
  }

  static exportAsPlainText(table: HTMLTableElement): string {
    if (!table || !table.rows) {
      return ""; // Return empty string if table is invalid
    }
    return Array.from(table.rows)
      .map((row) =>
        Array.from(row.cells)
          .map((cell) => cell?.innerText || "") // Ensure innerText exists
          .join("\t")
      )
      .join("\n");
  }

  static exportAsCSV(table: HTMLTableElement): string {
    if (!table || !table.rows) {
      return ""; // Return empty string if table is invalid
    }
    return Array.from(table.rows)
      .map((row) =>
        Array.from(row.cells)
          .map((cell) => `"${(cell?.innerText || "").replace(/"/g, '""')}"`) // Ensure innerText exists, handle quotes
          .join(",")
      )
      .join("\n");
  }
}

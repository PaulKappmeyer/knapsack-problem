import { DynamicProgrammingSolver, DPSolveResult } from "./dynamic-programming-solver";
import { GreedySolver, GreedySolveResult } from "./greedy-solver";
import { Visualization } from "./visualization";
import { ExportHelper } from "./export-helper";
import './static/style.css';

class KnapsackApp {
  // --- DOM Element Properties ---
  private capacityInput!: HTMLInputElement;
  private itemsTableBody!: HTMLTableSectionElement;
  private solveButton!: HTMLButtonElement;
  private clearButton!: HTMLButtonElement;
  private dpVisualizationElement!: HTMLDivElement;
  private dpMaxValueElement!: HTMLParagraphElement;
  private dpTableElement!: HTMLDivElement;
  private exportFormatSelect!: HTMLSelectElement;
  private greedyVisualizationElement!: HTMLDivElement;
  private greedyMaxValueElement!: HTMLParagraphElement;
  private notificationContainer!: HTMLDivElement;

  // --- Solvers ---
  private dpSolver: DynamicProgrammingSolver;
  private greedySolver: GreedySolver;

  constructor() {
    // Initialize solvers
    this.dpSolver = new DynamicProgrammingSolver();
    this.greedySolver = new GreedySolver();

    // Assign DOM elements safely
    this.capacityInput = document.getElementById("capacity") as HTMLInputElement;
    this.itemsTableBody = document
      .getElementById("itemsTable")
      ?.getElementsByTagName("tbody")[0] as HTMLTableSectionElement;
    this.solveButton = document.getElementById("solveButton") as HTMLButtonElement;
    this.clearButton = document.getElementById("clearButton") as HTMLButtonElement;
    this.dpVisualizationElement = document.getElementById("dpVisualization") as HTMLDivElement;
    this.dpMaxValueElement = document.getElementById("dpMaxValue") as HTMLParagraphElement;
    this.dpTableElement = document.getElementById("dpTable") as HTMLDivElement;
    this.exportFormatSelect = document.getElementById("exportFormat") as HTMLSelectElement;
    this.greedyVisualizationElement = document.getElementById("greedyVisualization") as HTMLDivElement;
    this.greedyMaxValueElement = document.getElementById("greedyMaxValue") as HTMLParagraphElement;
    this.notificationContainer = document.getElementById("notificationContainer") as HTMLDivElement;

    // Check if all essential DOM elements were found
    if (
      !this.capacityInput ||
      !this.itemsTableBody ||
      !this.solveButton ||
      !this.clearButton ||
      !this.dpVisualizationElement ||
      !this.dpMaxValueElement ||
      !this.dpTableElement ||
      !this.exportFormatSelect ||
      !this.greedyVisualizationElement ||
      !this.greedyMaxValueElement ||
      !this.notificationContainer
    ) {
      console.error("Initialization failed: One or more essential DOM elements not found.");
      this.showNotification(
        "Error: Could not initialize the application correctly. Some features might be disabled.",
        true
      );
      // Disable buttons if initialization failed
      if (this.solveButton) this.solveButton.disabled = true;
      if (this.clearButton) this.clearButton.disabled = true;
      if (this.exportFormatSelect) this.exportFormatSelect.disabled = true;
      return;
    }

    // Continue with initialization if all elements were found
    this.initialize();
  }

  private initialize(): void {
    this.addItemRow(); // Add the initial empty row
    // Add event listeners with type safety
    this.capacityInput.addEventListener("input", this.updateInputValidity);
    this.solveButton.addEventListener("click", this.solve);
    this.clearButton.addEventListener("click", this.clearInput);
    this.exportFormatSelect.addEventListener("change", this.exportDPTable);
  }

  private addItemRow = (index?: number, weight?: string, value?: string): void => {
    const newRow = this.itemsTableBody.insertRow(index);

    // Item number cell
    const itemCell = newRow.insertCell();
    itemCell.scope = "row";

    // Weight input cell
    const weightCell = newRow.insertCell();
    const weightInput = document.createElement("input");
    weightInput.type = "number";
    weightInput.placeholder = "Weight";
    weightInput.min = "0";
    weightInput.required = true;
    if (weight) weightInput.value = weight;
    weightInput.addEventListener("input", () => this.handleWeightValueInput(newRow));
    weightCell.appendChild(weightInput);

    // Value input cell
    const valueCell = newRow.insertCell();
    const valueInput = document.createElement("input");
    valueInput.type = "number";
    valueInput.placeholder = "Value";
    valueInput.min = "0";
    valueInput.required = true;
    if (value) valueInput.value = value;
    valueInput.addEventListener("input", () => this.handleWeightValueInput(newRow));
    valueCell.appendChild(valueInput);

    // Action buttons cell
    const actionCell = newRow.insertCell();
    actionCell.style.display = "flex";
    actionCell.style.gap = "5px";

    // Duplicate button
    const duplicateButton = document.createElement("button");
    duplicateButton.className = "duplicate-button";
    duplicateButton.innerHTML = "+";
    duplicateButton.title = "Duplicate item";
    duplicateButton.tabIndex = -1;
    if (!weight && !value) duplicateButton.disabled = true;
    duplicateButton.onclick = (event) => {
      event.preventDefault();
      this.duplicateItemRow(newRow);
    };
    actionCell.appendChild(duplicateButton);

    // Delete button
    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-button";
    deleteButton.innerHTML = "&times;";
    deleteButton.title = "Delete item";
    deleteButton.tabIndex = -1;
    if (!weight && !value) deleteButton.disabled = true;
    deleteButton.onclick = (event) => {
      event.preventDefault();
      this.deleteItemRow(newRow);
    };
    actionCell.appendChild(deleteButton);
  };

  private deleteItemRow = (row: HTMLTableRowElement): void => {
    const rowIndex = Array.from(this.itemsTableBody.rows).indexOf(row);
    this.itemsTableBody.deleteRow(rowIndex);
    this.updateItemNumbers();
    this.updateInputValidity();
  };

  private duplicateItemRow = (row: HTMLTableRowElement): void => {
    const rowIndex = Array.from(this.itemsTableBody.rows).indexOf(row);
    const weightInput = row.cells[1]?.querySelector("input");
    const valueInput = row.cells[2]?.querySelector("input");

    if (weightInput && valueInput) {
      this.addItemRow(rowIndex + 1, weightInput.value, valueInput.value);
      this.updateItemNumbers();
      this.updateInputValidity();
    }
  };

  private updateItemNumbers = (): void => {
    const rows = this.itemsTableBody.rows;
    for (let i = 0; i < rows.length - 1; i++) {
      const itemCell = rows[i].cells[0];
      itemCell.textContent = (i + 1).toString();
    }
  };

  private handleWeightValueInput = (row: HTMLTableRowElement): void => {
    const itemCell = row.cells[0];
    if (!itemCell.textContent) {
      // It's the template row, and it just received input
      itemCell.textContent = this.itemsTableBody.rows.length.toString();
      // Activate the delete button
      const deleteButton = row.cells[3]?.querySelector(".delete-button") as HTMLButtonElement;
      deleteButton.disabled = false;
      // Add a new empty template row
      this.addItemRow();
    }

    this.updateInputValidity();
  };

  private updateInputValidity = (): void => {
    // Check capacity input validity
    const isValidCapacity = this.capacityInput.checkValidity() && parseFloat(this.capacityInput.value) >= 0;

    // Check if there's at least one valid item row (excluding the template row)
    const itemRows = Array.from(this.itemsTableBody.rows).slice(0, -1);
    const hasItems = itemRows.length > 0;

    // Check if all item rows (excluding template) have valid weight and value
    const areItemsValid = itemRows.every((row) => {
      const weightInput = row.cells[1]?.querySelector("input") as HTMLInputElement;
      const valueInput = row.cells[2]?.querySelector("input") as HTMLInputElement;

      const weightValid = weightInput?.checkValidity() && parseFloat(weightInput.value) >= 0;
      const valueValid = valueInput?.checkValidity() && parseFloat(valueInput.value) >= 0;

      // Activate the duplicate button
      const duplicateButton = row.cells[3]?.querySelector(".duplicate-button") as HTMLButtonElement;
      duplicateButton.disabled = !(weightValid || valueValid);

      return weightValid && valueValid;
    });

    // Enable solve button only if all conditions are met
    this.solveButton.disabled = !(isValidCapacity && hasItems && areItemsValid);

    // Enable clear button if there is capacity or more than one row (meaning items were added)
    this.clearButton.disabled = !(this.capacityInput.value || this.itemsTableBody.rows.length > 1);
  };

  private getItemsData(): { weights: number[]; values: number[] } {
    const weights: number[] = [];
    const values: number[] = [];

    // Iterate over rows, excluding the last (template) row
    Array.from(this.itemsTableBody.rows)
      .slice(0, -1)
      .forEach((row) => {
        const weightInput = row.cells[1]?.querySelector("input");
        const valueInput = row.cells[2]?.querySelector("input");
        // Ensure inputs exist and parse their values
        if (weightInput && valueInput) {
          const weight = parseFloat(weightInput.value);
          const value = parseFloat(valueInput.value);
          // Add item only if both weight and value are valid numbers
          if (!isNaN(weight) && !isNaN(value)) {
            weights.push(weight);
            values.push(value);
          } else {
            console.warn("Skipping row with invalid weight or value:", row);
          }
        }
      });

    return { weights, values };
  }

  private solve = (): void => {
    if (this.solveButton.disabled) {
      this.showNotification("Please ensure capacity and all item weights/values are valid numbers.", true);
      return;
    }
    // Use parseInt for capacity as it should be an integer
    const capacity = parseInt(this.capacityInput.value, 10);
    // Validate capacity again after parsing
    if (isNaN(capacity) || capacity < 0) {
      this.showNotification("Invalid capacity value. Please enter a non-negative integer.", true);
      return;
    }

    const { weights, values } = this.getItemsData();

    if (weights.length === 0) {
      this.showNotification("No valid items to process. Please add items with valid weights and values.", true);
      return;
    }

    try {
      // Solve with Dynamic Programming
      const dpResult: DPSolveResult = this.dpSolver.solve(weights, values, capacity);
      this.dpMaxValueElement.textContent = `Maximum Value: ${dpResult.maxValue}`; // Use textContent
      Visualization.createKnapsackVisualization(dpResult.selectedItems, weights, values, capacity, "dpVisualization");
      this.displayDPTable(dpResult.dpTable, capacity);

      // Solve with Greedy Algorithm
      const greedyResult: GreedySolveResult = this.greedySolver.solve(weights, values, capacity);
      this.greedyMaxValueElement.textContent = `Maximum Value: ${greedyResult.maxValue}`; // Use textContent
      Visualization.createKnapsackVisualization(
        greedyResult.selectedItems,
        weights,
        values,
        capacity,
        "greedyVisualization"
      );

      this.showNotification("Results generated successfully!");
      this.exportFormatSelect.disabled = false; // Enable export after successful solve
    } catch (error) {
      console.error("An error occurred during solving:", error);
      this.showNotification("An error occurred while solving. Please check the console for details.", true);
      // Disable export if solving failed
      this.exportFormatSelect.disabled = true;
      this.exportFormatSelect.selectedIndex = 0;
    }
  };

  private displayDPTable(dp: number[][], capacity: number): void {
    this.dpTableElement.innerHTML = ""; // Clear previous table
    const tableElement = document.createElement("table");

    // --- Create header row (Capacity) ---
    const headerRow = tableElement.createTHead().insertRow();
    const thCorner = document.createElement("th");
    thCorner.textContent = "i / w"; // Indicate items/weights
    headerRow.appendChild(thCorner);

    for (let j = 0; j <= capacity; j++) {
      const th = document.createElement("th");
      th.scope = "col";
      th.textContent = j.toString();
      headerRow.appendChild(th);
    }

    // --- Create table body (Items and Values) ---
    const tbody = tableElement.createTBody();
    for (let i = 0; i < dp.length; i++) {
      const row = tbody.insertRow();

      // Row header (Item index)
      const rowHeader = document.createElement("th");
      rowHeader.scope = "row";
      rowHeader.textContent = i.toString();
      row.appendChild(rowHeader);

      // DP values
      for (let j = 0; j <= capacity; j++) {
        const cell = row.insertCell();
        cell.textContent = dp[i][j].toString();

        // Highlight the final result cell
        if (i === dp.length - 1 && j === capacity) {
          cell.style.backgroundColor = "#4CAF50";
          cell.style.color = "#fff";
          cell.style.fontWeight = "bold";
        }
      }
    }

    this.dpTableElement.appendChild(tableElement);
  }

  private exportDPTable = (): void => {
    const format = this.exportFormatSelect.value as "latex" | "plaintext" | "csv"; // Type assertion
    if (!format) return; // Exit if no format selected (e.g., default disabled option)

    const table = this.dpTableElement.querySelector("table");
    if (!table) {
      this.showNotification("Cannot export: DP table not found.", true);
      return;
    }

    try {
      const exportedData = ExportHelper.exportTable(table, format);

      if (exportedData && navigator.clipboard) {
        navigator.clipboard
          .writeText(exportedData)
          .then(() => {
            this.showNotification(`Table exported as ${format.toUpperCase()} and copied to clipboard!`);
          })
          .catch((err) => {
            console.error("Failed to copy to clipboard:", err);
            this.showNotification(`Table exported as ${format.toUpperCase()}. Failed to copy to clipboard.`, true);
            // Optional: provide data in a textarea for manual copying
            this.showExportDataForManualCopy(exportedData, format);
          });
      } else if (!navigator.clipboard) {
        this.showNotification(`Table exported as ${format.toUpperCase()}. Clipboard API not available.`, true);
        // Optional: provide data in a textarea for manual copying
        this.showExportDataForManualCopy(exportedData, format);
      } else if (!exportedData) {
        this.showNotification(`Could not generate export data for ${format.toUpperCase()}.`, true);
      }
    } catch (error) {
      console.error(`Error exporting table as ${format}:`, error);
      this.showNotification(`An error occurred during ${format.toUpperCase()} export.`, true);
    } finally {
      // Reset dropdown after attempt
      this.exportFormatSelect.selectedIndex = 0;
    }
  };

  // Helper to show data for manual copy if clipboard fails or isn't supported
  private showExportDataForManualCopy(data: string, format: string): void {
    const dataArea = document.createElement("textarea");
    dataArea.value = data;
    dataArea.rows = 10;
    dataArea.cols = 50;
    dataArea.readOnly = true;
    dataArea.style.marginTop = "10px";
    dataArea.style.width = "100%";
    dataArea.style.boxSizing = "border-box";

    const infoPara = document.createElement("p");
    infoPara.textContent = `Could not copy to clipboard automatically. Please copy the ${format.toUpperCase()} data below:`;

    const container = document.createElement("div");
    container.appendChild(infoPara);
    container.appendChild(dataArea);

    // Display this container somewhere appropriate, maybe near the export button or in a modal.
    // For simplicity, appending near the export select:
    this.exportFormatSelect.parentNode?.appendChild(container);

    // Optionally remove it after some time or provide a close button.
  }

  private showNotification(message: string, isError: boolean = false): void {
    // Create a new notification element
    const notification = document.createElement("div");
    notification.className = `notification ${isError ? "error" : ""}`;
    notification.textContent = message;

    // Create the close button
    const closeButton = document.createElement("button");
    closeButton.className = "close-button";
    closeButton.innerHTML = "&times;";
    closeButton.title = "Close notification";
    closeButton.type = "button";
    closeButton.addEventListener("click", () => {
      this.removeNotification(notification);
    });

    // Add the close button to the notification
    notification.appendChild(closeButton);

    // Add the notification to the container
    this.notificationContainer.appendChild(notification);

    // Trigger the show animation using requestAnimationFrame for reliability
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        // Double requestAnimationFrame for better cross-browser compatibility
        notification.classList.add("show");
      });
    });

    // Automatically hide the notification after a delay (unless it's an error)
    if (!isError) {
      setTimeout(() => {
        this.removeNotification(notification);
      }, 3000); // 3 seconds for normal notifications
    }
  }

  private removeNotification(notification: HTMLDivElement): void {
    if (notification.classList.contains("show")) {
      notification.classList.remove("show");
      notification.classList.add("fade-out");

      // Remove the notification from the DOM after the fade-out animation
      notification.addEventListener(
        "transitionend",
        () => {
          notification.remove();
        },
        { once: true } // Ensure the listener is removed after firing once
      );
    } else if (this.notificationContainer.contains(notification)) {
      // If it was never shown but still exists, just remove it
      notification.remove();
    }
  }

  private clearInput = (): void => {
    this.capacityInput.value = "";
    this.itemsTableBody.innerHTML = ""; // Clear all existing item rows

    // Clear DP results
    this.dpVisualizationElement.innerHTML = "";
    this.dpMaxValueElement.textContent = "";
    this.dpTableElement.innerHTML = "";
    this.exportFormatSelect.disabled = true;
    this.exportFormatSelect.selectedIndex = 0; // Reset dropdown

    // Clear Greedy results
    this.greedyVisualizationElement.innerHTML = "";
    this.greedyMaxValueElement.textContent = "";

    // Add the initial empty row back
    this.addItemRow();

    // Update button states
    this.updateInputValidity();

    // Optionally, clear any manual copy textareas
    const manualCopyAreas = this.exportFormatSelect.parentNode?.querySelectorAll("div > textarea");
    manualCopyAreas?.forEach((area) => area.closest("div")?.remove());

    // Optionally clear notifications
    // Array.from(this.notificationContainer.children).forEach(notif => this.removeNotification(notif as HTMLDivElement));

    // Focus capacity input for convenience
    this.capacityInput.focus();

    this.showNotification("Input cleared.");
  };
}

// Initialize the app
document.addEventListener("DOMContentLoaded", () => {
  new KnapsackApp();
});

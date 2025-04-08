export class Visualization {
  // Define a specific type for the container ID to improve clarity
  static createKnapsackVisualization(
    selectedItems: number[],
    weights: number[],
    values: number[],
    capacity: number,
    containerId: "dpVisualization" | "greedyVisualization"
  ): void {
    const visualizationElement = document.getElementById(containerId) as HTMLDivElement | null;

    // Check if the container element exists
    if (!visualizationElement) {
      console.error(`Visualization container with ID "${containerId}" not found.`);
      return; // Exit if the container doesn't exist
    }

    visualizationElement.innerHTML = ""; // Clear previous visualization

    // Define colors - consider making this configurable or generating more colors if needed
    const itemColors: readonly string[] = [
      // Use readonly for constant arrays
      "#4CAF50",
      "#2196F3",
      "#FFC107",
      "#FF5722",
      "#9C27B0",
      "#E91E63",
      "#00BCD4",
      "#8BC34A",
      "#FF9800",
      "#673AB7",
    ];

    let totalUsedCapacity: number = 0; // Track used capacity

    selectedItems.sort();

    selectedItems.forEach((itemIndex, displayIndex) => {
      // Use displayIndex for color selection
      // Validate itemIndex
      if (itemIndex < 0 || itemIndex >= weights.length) {
        console.warn(`Invalid item index ${itemIndex} found in selectedItems.`);
        return; // Skip invalid items
      }

      const weight = weights[itemIndex];
      const value = values[itemIndex];
      // Ensure weight is positive for visualization width
      if (weight <= 0) {
        console.warn(`Item ${itemIndex + 1} has zero or negative weight (${weight}), skipping visualization.`);
        return; // Skip items with non-positive weight in visualization flex calculation
      }

      totalUsedCapacity += weight; // Add valid weight to total

      // Cycle through colors based on the order items are added to the visualization
      const color = itemColors[displayIndex % itemColors.length];

      const itemBox = document.createElement("div");
      itemBox.className = "item-box";
      // Use dataset for custom attributes - better practice
      itemBox.dataset.tooltip = `Item ${itemIndex + 1} (Weight: ${weight}, Value: ${value})`;
      itemBox.style.backgroundColor = color;
      // Use flex-grow based on weight relative to total capacity for better scaling
      // Note: This assumes capacity > 0. Add a check if capacity can be 0.
      itemBox.style.flexGrow = capacity > 0 ? weight.toString() : "0"; // Set flex-grow based on weight
      itemBox.style.flexBasis = "0"; // Important for flex-grow to work correctly
      itemBox.style.minWidth = "10px"; // Ensure very small items are still visible

      const label = document.createElement("div");
      label.className = "item-label";
      label.textContent = `Item ${itemIndex + 1}`;
      itemBox.appendChild(label);
      visualizationElement.appendChild(itemBox);

      // Adjust font size dynamically after the element is rendered
      // Use requestAnimationFrame for better timing
      requestAnimationFrame(() => {
        // Ensure itemBox is still in the DOM
        if (!itemBox.isConnected) return;

        const boxWidth = itemBox.clientWidth;
        const labelWidth = label.scrollWidth;
        const minFontSize = 8; // Minimum readable font size
        const targetFontSize = 12; // Desired font size

        // Calculate font size based on available width, but don't go below minFontSize
        // Subtract some padding/margin for better fit
        const availableWidth = boxWidth - 6; // Adjust padding as needed
        let newFontSize = targetFontSize;

        if (labelWidth > availableWidth) {
          newFontSize = Math.max(minFontSize, (availableWidth / labelWidth) * targetFontSize);
        }

        label.style.fontSize = `${newFontSize}px`;
        // Hide label if calculated size is below minimum or box is too narrow overall
        label.style.display = newFontSize < minFontSize || boxWidth < 20 ? "none" : "block";
      });
    });

    // Calculate remaining capacity accurately
    const remainingCapacity = capacity - totalUsedCapacity;

    // Add box for remaining capacity only if it's positive
    if (remainingCapacity > 0 && capacity > 0) {
      const emptyBox = document.createElement("div");
      emptyBox.className = "item-box empty";
      emptyBox.style.backgroundColor = "#e0e0e0";
      emptyBox.style.flexGrow = remainingCapacity.toString();
      emptyBox.style.flexBasis = "0";
      emptyBox.style.minWidth = "5px";

      // Optionally add a label to the empty box if it's large enough
      const emptyLabel = document.createElement("div");
      emptyLabel.className = "item-label empty-label";
      emptyLabel.textContent = "Free";
      emptyBox.appendChild(emptyLabel);

      visualizationElement.appendChild(emptyBox);

      requestAnimationFrame(() => {
        if (!emptyBox.isConnected) return;
        const boxWidth = emptyBox.clientWidth;
        emptyLabel.style.display = boxWidth < 30 ? "none" : "block"; // Show 'Free' only if enough space
      });
    } else if (totalUsedCapacity > capacity) {
      console.warn("Total weight of selected items exceeds capacity in visualization.");
      // Optionally add a visual indicator for overflow if needed
    }
  }
}

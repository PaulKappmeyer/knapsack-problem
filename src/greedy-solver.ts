interface Item {
  index: number;
  weight: number;
  value: number;
  ratio: number;
}

export interface GreedySolveResult {
  maxValue: number;
  selectedItems: number[];
}

export class GreedySolver {
  solve(weights: number[], values: number[], capacity: number): GreedySolveResult {
    // Calculate value-to-weight ratio for each item
    const items: Item[] = weights.map((weight, index) => ({
      index,
      weight,
      value: values[index],
      ratio: weight === 0 ? Infinity : values[index] / weight, // Handle potential division by zero
    }));

    // Sort items by ratio in descending order
    // Items with Infinity ratio (zero weight, positive value) should come first
    items.sort((a, b) => b.ratio - a.ratio);

    let remainingCapacity: number = capacity;
    let maxValue: number = 0;
    const selectedItems: number[] = [];

    for (const item of items) {
      if (item.weight <= remainingCapacity) {
        selectedItems.push(item.index);
        maxValue += item.value;
        remainingCapacity -= item.weight;
      }
    }

    return {
      maxValue,
      selectedItems,
    };
  }
}

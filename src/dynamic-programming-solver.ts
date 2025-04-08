export interface DPSolveResult {
  maxValue: number;
  selectedItems: number[];
  dpTable: number[][];
}

export class DynamicProgrammingSolver {
  solve(weights: number[], values: number[], capacity: number): DPSolveResult {
    const n: number = weights.length;
    // Initialize DP table with zeros
    const dp: number[][] = Array.from({ length: n + 1 }, () => Array(capacity + 1).fill(0));

    // Build DP table bottom-up
    for (let i = 1; i <= n; i++) {
      for (let j = 0; j <= capacity; j++) {
        // If the current item's weight is less than or equal to the current capacity
        if (weights[i - 1] <= j) {
          // Decide whether to include the item or not
          dp[i][j] = Math.max(
            dp[i - 1][j], // Item not included
            dp[i - 1][j - weights[i - 1]] + values[i - 1] // Item included
          );
        } else {
          // If the item's weight is more than the current capacity, it cannot be included
          dp[i][j] = dp[i - 1][j];
        }
      }
    }

    // Backtrack to find selected items
    let j: number = capacity;
    const selectedItems: number[] = [];
    for (let i = n; i > 0 && j > 0; i--) {
      // If the value differs from the row above, it means the item i was included
      if (dp[i][j] !== dp[i - 1][j]) {
        selectedItems.push(i - 1); // Add the index of the item
        j -= weights[i - 1]; // Reduce capacity by the weight of the included item
      }
    }
    // Items are added in reverse order during backtracking, so reverse to get the correct order (optional)
    selectedItems.reverse();

    return {
      maxValue: dp[n][capacity], // The maximum value found
      selectedItems, // The indices of the items included in the optimal solution
      dpTable: dp, // The complete DP table
    };
  }
}

export type Lesson = {
  slug: string;
  title: string;
  minutes: number;
  summary: string;
  body: string[];
  quiz: {
    prompt: string;
    choices: string[];
    answerIndex: number;
    explain: string;
  };
};

export const LESSONS: Lesson[] = [
  {
    slug: "two-pointers",
    title: "Two pointers",
    minutes: 8,
    summary: "Walk a sorted array from both ends to find pairs in linear time.",
    body: [
      "When the input is sorted (or can be sorted cheaply), two pointers often replace nested loops.",
      "Start left at index 0 and right at n − 1. Move the pointer that improves the invariant — for a target sum, advance left if the sum is too small, shrink right if too large.",
      "Classic shapes: pair sum, remove duplicates in place, container with most water, and palindrome checks on a string.",
      "Complexity target: O(n) time after any sort, O(1) extra space when you mutate in place.",
    ],
    quiz: {
      prompt: "Given a sorted array, finding two numbers that sum to a target with two pointers is typically:",
      choices: ["O(n²) time", "O(n) time", "O(log n) time", "O(n!) time"],
      answerIndex: 1,
      explain: "Each step moves one pointer; you scan at most n elements once.",
    },
  },
  {
    slug: "sliding-window",
    title: "Sliding window",
    minutes: 10,
    summary: "Maintain a contiguous span that grows and shrinks to satisfy a constraint.",
    body: [
      "Sliding window turns substring / subarray problems into a single pass with a moving [left, right] range.",
      "Expand right to include new elements. When the window violates a constraint (too many unique chars, sum too large), advance left until it is valid again.",
      "Track window state with a counter, frequency map, or running sum — update in O(1) as edges move.",
      "Use it for longest substring without repeat, minimum window covering a set, and max sum of size k (fixed window).",
    ],
    quiz: {
      prompt: "In a variable sliding window, when the window becomes invalid you usually:",
      choices: [
        "Restart from index 0",
        "Advance the left edge until valid",
        "Sort the window",
        "Binary search the array",
      ],
      answerIndex: 1,
      explain: "Shrinking from the left restores the invariant without discarding the work already done on the right.",
    },
  },
  {
    slug: "hash-maps",
    title: "Hash maps for lookups",
    minutes: 7,
    summary: "Trade space for O(1) average lookups — the backbone of many easy/medium prompts.",
    body: [
      "Interview favorites (two-sum, anagrams, group by key) lean on a map from value → index or frequency.",
      "Build the map as you scan, or do a first pass to count then a second pass to decide.",
      "Watch collisions in theory; in practice languages give you dict/Map. Focus on what you store and when you update it.",
      "Pair with two pointers or a window when you need both order and fast membership tests.",
    ],
    quiz: {
      prompt: "Two-sum with a hash map of value → index is typically:",
      choices: ["O(n) time, O(n) space", "O(n²) time, O(1) space", "O(n log n) time only", "O(1) time always"],
      answerIndex: 0,
      explain: "One pass with constant-time lookups; space grows with distinct values stored.",
    },
  },
  {
    slug: "bfs-dfs",
    title: "BFS and DFS",
    minutes: 12,
    summary: "Traverse graphs and trees — queue for layers, stack/recursion for depth-first paths.",
    body: [
      "BFS uses a queue and explores level by level. Shortest path in an unweighted graph is BFS distance.",
      "DFS uses recursion or an explicit stack. Reachability, cycle detection, and topological ideas start here.",
      "On grids, treat each cell as a node with up to four edges. Mark visited early to avoid re-enqueueing.",
      "Interview cue: “minimum steps” or “nearest” → BFS. “Explore all paths” or “connected components” → often DFS.",
    ],
    quiz: {
      prompt: "Shortest path in an unweighted graph is most directly found with:",
      choices: ["Dijkstra only", "BFS", "Binary search", "Two pointers"],
      answerIndex: 1,
      explain: "BFS visits nodes in increasing distance from the source when edges have equal weight.",
    },
  },
];

export function getLesson(slug: string): Lesson | undefined {
  return LESSONS.find((l) => l.slug === slug);
}

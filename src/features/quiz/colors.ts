export const GROUP_COLORS = [
  "bg-[var(--card-header1)]",
  "bg-[var(--card-header2)]",
  "bg-[var(--card-header3)]",
  "bg-[var(--card-header4)]",
  "bg-[var(--card-header5)]",
];

// export function getGroupColor(group?: string): string {
//   if (!group) return GROUP_COLORS[0];
//   let sum = 0;
//   for (let i = 0; i < group.length; i++) sum += group.charCodeAt(i);
//   const idx = sum % GROUP_COLORS.length;
//   return GROUP_COLORS[idx];
// }

// Utility: assign a consistent color to each group
const groupColorMap: Record<string, string> = {};

export function getGroupColor(group: string): string {
  if (!groupColorMap[group]) {
    const assignedIndex =
      Object.keys(groupColorMap).length % GROUP_COLORS.length;
    groupColorMap[group] = GROUP_COLORS[assignedIndex];
  }
  return groupColorMap[group];
}

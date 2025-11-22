
export interface Task {
  id: string;
  title: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  progress: number;  // 0-100
  category: string;
  assignee?: string; // New field for user assignment
}

// Helper to generate consistent colors for any category name
const TAILWIND_COLORS = [
  'bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-amber-500', 
  'bg-rose-500', 'bg-cyan-500', 'bg-fuchsia-500', 'bg-indigo-500', 
  'bg-orange-500', 'bg-teal-500', 'bg-lime-500', 'bg-pink-500'
];

export const getCategoryColor = (category: string): string => {
  if (!category) return 'bg-gray-500';
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = category.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % TAILWIND_COLORS.length;
  return TAILWIND_COLORS[index];
};

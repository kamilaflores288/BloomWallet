export interface Config {
  bloomValue: number;
  weekLimit: number;
  parentName: string;
  childName: string;
  profileColor: string;
}

export interface ChildState {
  blooms: number;
  totalEarned: number;
  totalSpent: number;
  weeklyEarned: number;
  streak: number;
  lastTaskDate: string;
}

export interface Task {
  id: string;
  name: string;
  emoji: string;
  frequency: 'daily' | 'weekly';
  blooms: number;
}

export interface PendingTask {
  id: string;
  taskId: string;
  taskName: string;
  taskEmoji: string;
  blooms: number;
  completedAt: string;
  childName: string;
}

export type GoalType = 'need' | 'wish';

export interface Goal {
  id: string;
  name: string;
  emoji: string;
  type: GoalType;
  bloomCost: number;
  currentBlooms: number;
  redeemed: boolean;
  reason?: string;
}

export interface HistoryEntry {
  id: string;
  type: 'earned' | 'spent' | 'redeemed';
  description: string;
  amount: number;
  date: string;
}

export interface AppData {
  config: Config;
  child: ChildState;
  tasks: Task[];
  pendingTasks: PendingTask[];
  goals: Goal[];
  history: HistoryEntry[];
  lastCompletedDates: Record<string, string>;
}

export type Sheet = 'aprobar' | 'gestionar' | 'stats' | 'config' | null;

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppData, Task, Goal, Config, PendingTask } from '@/types';

const DATA_KEY = 'bloom:app_data';

const DEFAULT: AppData = {
  config: { bloomValue: 5.60, weekLimit: 50, parentName: '', childName: '', profileColor: '#F0447A' },
  child: {
    blooms: 0,
    totalEarned: 0,
    totalSpent: 0,
    weeklyEarned: 0,
    streak: 0,
    lastTaskDate: '',
  },
  tasks: [],
  pendingTasks: [],
  goals: [],
  history: [],
  lastCompletedDates: {},
};

type Action =
  | { type: 'LOAD'; payload: AppData }
  | { type: 'COMPLETE_TASK'; taskId: string }
  | { type: 'APPROVE_TASK'; pendingId: string }
  | { type: 'REJECT_TASK'; pendingId: string }
  | { type: 'REDEEM_GOAL'; goalId: string }
  | { type: 'UPDATE_CONFIG'; config: Partial<Config> }
  | { type: 'ADD_TASK'; task: Task }
  | { type: 'DELETE_TASK'; taskId: string }
  | { type: 'UPDATE_TASK'; task: Task }
  | { type: 'ADD_GOAL'; goal: Goal }
  | { type: 'UPDATE_GOAL'; goal: Partial<Goal> & { id: string } };

function reducer(state: AppData, action: Action): AppData {
  switch (action.type) {
    case 'LOAD':
      return {
        ...action.payload,
        lastCompletedDates: action.payload.lastCompletedDates ?? {},
        config: {
          ...action.payload.config,
          profileColor: action.payload.config.profileColor ?? '#F0447A',
        },
      };

    case 'COMPLETE_TASK': {
      const task = state.tasks.find(t => t.id === action.taskId);
      if (!task) return state;

      const today = new Date().toISOString().split('T')[0];
      const lastDate = state.lastCompletedDates[task.id];

      if (task.frequency === 'daily' && lastDate === today) return state;

      if (task.frequency === 'weekly' && lastDate) {
        const daysSince = (Date.now() - new Date(lastDate).getTime()) / 86400000;
        if (daysSince < 7) return state;
      }

      const pending: PendingTask = {
        id: `p${Date.now()}`,
        taskId: task.id,
        taskName: task.name,
        taskEmoji: task.emoji,
        blooms: task.blooms,
        completedAt: new Date().toISOString(),
        childName: state.config.childName,
      };
      return {
        ...state,
        pendingTasks: [...state.pendingTasks, pending],
        lastCompletedDates: { ...state.lastCompletedDates, [task.id]: today },
      };
    }

    case 'APPROVE_TASK': {
      const pending = state.pendingTasks.find(p => p.id === action.pendingId);
      if (!pending) return state;
      const today = new Date().toISOString().split('T')[0];
      const prev  = state.child.lastTaskDate;
      const yest  = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      let streak = state.child.streak;
      if (prev === yest) streak += 1;
      else if (prev !== today) streak = 1;
      return {
        ...state,
        pendingTasks: state.pendingTasks.filter(p => p.id !== action.pendingId),
        child: {
          ...state.child,
          blooms:       state.child.blooms       + pending.blooms,
          totalEarned:  state.child.totalEarned  + pending.blooms,
          weeklyEarned: state.child.weeklyEarned + pending.blooms,
          streak,
          lastTaskDate: today,
        },
        history: [
          { id: `h${Date.now()}`, type: 'earned', description: pending.taskName, amount: pending.blooms, date: new Date().toISOString() },
          ...state.history,
        ],
      };
    }

    case 'REJECT_TASK':
      return { ...state, pendingTasks: state.pendingTasks.filter(p => p.id !== action.pendingId) };

    case 'REDEEM_GOAL': {
      const goal = state.goals.find(g => g.id === action.goalId);
      if (!goal || goal.redeemed || state.child.blooms < goal.bloomCost) return state;
      return {
        ...state,
        goals: state.goals.map(g =>
          g.id === action.goalId ? { ...g, redeemed: true, currentBlooms: g.bloomCost } : g
        ),
        child: {
          ...state.child,
          blooms:     state.child.blooms     - goal.bloomCost,
          totalSpent: state.child.totalSpent + goal.bloomCost,
        },
        history: [
          { id: `h${Date.now()}`, type: 'redeemed', description: `Meta: ${goal.name}`, amount: -goal.bloomCost, date: new Date().toISOString() },
          ...state.history,
        ],
      };
    }

    case 'UPDATE_CONFIG':
      return { ...state, config: { ...state.config, ...action.config } };

    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, action.task] };

    case 'DELETE_TASK':
      return { ...state, tasks: state.tasks.filter(t => t.id !== action.taskId) };

    case 'UPDATE_TASK':
      return { ...state, tasks: state.tasks.map(t => t.id === action.task.id ? action.task : t) };

    case 'ADD_GOAL':
      return { ...state, goals: [...state.goals, action.goal] };

    case 'UPDATE_GOAL':
      return { ...state, goals: state.goals.map(g => g.id === action.goal.id ? { ...g, ...action.goal } : g) };

    default:
      return state;
  }
}

interface ContextValue {
  data: AppData;
  loading: boolean;
  completeTask:  (taskId: string) => void;
  approveTask:   (pendingId: string) => void;
  rejectTask:    (pendingId: string) => void;
  redeemGoal:    (goalId: string) => void;
  updateConfig:  (config: Partial<Config>) => void;
  addTask:       (task: Task) => void;
  deleteTask:    (taskId: string) => void;
  updateTask:    (task: Task) => void;
  addGoal:       (goal: Goal) => void;
  updateGoal:    (goal: Partial<Goal> & { id: string }) => void;
}

const AppDataContext = createContext<ContextValue | null>(null);

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [data, dispatch] = useReducer(reducer, DEFAULT);
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    AsyncStorage.getItem(DATA_KEY).then(raw => {
      if (raw) {
        try { dispatch({ type: 'LOAD', payload: JSON.parse(raw) }); } catch {}
      }
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!loading) AsyncStorage.setItem(DATA_KEY, JSON.stringify(data));
  }, [data, loading]);

  const completeTask  = useCallback((taskId: string)         => dispatch({ type: 'COMPLETE_TASK', taskId }),       []);
  const approveTask   = useCallback((pendingId: string)       => dispatch({ type: 'APPROVE_TASK', pendingId }),     []);
  const rejectTask    = useCallback((pendingId: string)       => dispatch({ type: 'REJECT_TASK', pendingId }),      []);
  const redeemGoal    = useCallback((goalId: string)          => dispatch({ type: 'REDEEM_GOAL', goalId }),         []);
  const updateConfig  = useCallback((config: Partial<Config>) => dispatch({ type: 'UPDATE_CONFIG', config }),       []);
  const addTask       = useCallback((task: Task)              => dispatch({ type: 'ADD_TASK', task }),              []);
  const deleteTask    = useCallback((taskId: string)          => dispatch({ type: 'DELETE_TASK', taskId }),         []);
  const updateTask    = useCallback((task: Task)              => dispatch({ type: 'UPDATE_TASK', task }),           []);
  const addGoal       = useCallback((goal: Goal)              => dispatch({ type: 'ADD_GOAL', goal }),              []);
  const updateGoal    = useCallback((goal: Partial<Goal> & { id: string }) => dispatch({ type: 'UPDATE_GOAL', goal }), []);

  return (
    <AppDataContext.Provider value={{ data, loading, completeTask, approveTask, rejectTask, redeemGoal, updateConfig, addTask, deleteTask, updateTask, addGoal, updateGoal }}>
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used inside AppDataProvider');
  return ctx;
}

// Stage based on % of weekly limit earned this week
export function bloomyStage(weeklyEarned: number, weekLimit: number) {
  const pct = weekLimit > 0 ? (weeklyEarned / weekLimit) * 100 : 0;
  if (pct >= 80) return { name: 'Flor',    level: 4, nextPct: null as null | number, pct, image: require('@/placeholders/bloomy_stage_4_Flor.PNG') };
  if (pct >= 41) return { name: 'Planta',  level: 3, nextPct: 80 as null | number,   pct, image: require('@/placeholders/bloomy_stage_3_Planta.png') };
  if (pct >= 20) return { name: 'Brote',   level: 2, nextPct: 41 as null | number,   pct, image: require('@/placeholders/bloomy_stage_2_Brote.PNG') };
  return               { name: 'Semilla', level: 1, nextPct: 20 as null | number,   pct, image: require('@/placeholders/bloomy_stage_1_Semilla.PNG') };
}

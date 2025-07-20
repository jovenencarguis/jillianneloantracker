
import type { User, Client, RecentActivity, UpcomingPayment } from './types';

export const users: User[] = [
  { id: '1', name: 'Admin Account', username: 'admin', email: 'admin@loadbuddy.com', password: 'admin123', role: 'admin' },
  { id: '2', name: 'Joven', username: 'joven', email: 'joven@loadbuddy.com', password: 'joven123', role: 'admin' },
  { id: '3', name: 'User Account', username: 'user', email: 'user@loadbuddy.com', password: 'user1234', role: 'user' },
  { id: '4', name: 'Jhoy', username: 'jhoy', email: 'jhoy@loadbuddy.com', password: 'jhoy1234', role: 'user' },
];

export const clients: Client[] = [];

// Helper function to get a date in the past
const getDateInPast = (days: number, hours=0, minutes=0) => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    date.setHours(date.getHours() - hours);
    date.setMinutes(date.getMinutes() - minutes);
    return date.toISOString();
}

// Helper function to get a date in the future
const getDateInFuture = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString();
}

export const recentActivities: RecentActivity[] = [];

export const upcomingPayments: UpcomingPayment[] = [];

    


import type { User, Client, RecentActivity, UpcomingPayment } from './types';
import { users as initialUsers, clients as initialClients, recentActivities as initialRecentActivities } from './data';

// --- Data Initialization ---
export const initializeData = () => {
    if (typeof window === 'undefined') return;
    if (sessionStorage.getItem('data-initialized')) return;

    sessionStorage.setItem('all-users', JSON.stringify(initialUsers));
    sessionStorage.setItem('all-clients', JSON.stringify(initialClients));
    sessionStorage.setItem('recent-activities', JSON.stringify(initialRecentActivities));
    
    sessionStorage.setItem('data-initialized', 'true');
};


// --- Generic Storage Functions ---
const getStoredData = <T,>(key: string, fallback: T[]): T[] => {
    if (typeof window === 'undefined') return fallback;
    const storedValue = sessionStorage.getItem(key);
    if (storedValue) {
        try {
            const parsed = JSON.parse(storedValue);
            // Ensure it's an array, handles cases like empty object storage
            return Array.isArray(parsed) ? parsed : fallback;
        } catch (e) {
            console.error(`Failed to parse ${key} from sessionStorage`, e);
            return fallback;
        }
    }
    return fallback;
};

export const updateStoredData = (key: 'users' | 'clients' | 'activities', data: any[]) => {
    if (typeof window !== 'undefined') {
        const storageKey = key === 'activities' ? 'recent-activities' : `all-${key}`;
        sessionStorage.setItem(storageKey, JSON.stringify(data));
        window.dispatchEvent(new Event('storage-updated'));
    }
};


// --- Specific Getters ---
export const getStoredUsers = (): User[] => {
    return getStoredData<User>('all-users', initialUsers);
};

export const getStoredClients = (): Client[] => {
    return getStoredData<Client>('all-clients', []);
};

export const getStoredRecentActivities = (): RecentActivity[] => {
    return getStoredData<RecentActivity>('recent-activities', []);
};


// --- Derived Data Getters ---
export const getStoredUpcomingPayments = (): UpcomingPayment[] => {
    if (typeof window === 'undefined') return [];
    
    const clients = getStoredClients();
    if (!clients || clients.length === 0) return [];

    const today = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(today.getDate() + 7);

    const payments = clients
        .filter(c => c.status === 'Active' || c.status === 'Overdue')
        .map(c => {
            const monthlyInterestRate = c.interestRate / 100;
            const interestAmount = c.remainingBalance * monthlyInterestRate;
            const expectedAmount = interestAmount * 1.1; // Placeholder logic
            
            const lastPaymentDate = c.payments.length > 0 
                ? new Date(c.payments.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].date)
                : new Date(c.loanDate);

            const dueDate = new Date(lastPaymentDate);
            dueDate.setMonth(dueDate.getMonth() + 1);

            return {
                id: `up-${c.id}`,
                clientName: c.name,
                dueDate: dueDate.toISOString(),
                amount: expectedAmount,
                isOverdue: dueDate < today,
            }
        })
        .filter(p => new Date(p.dueDate) <= sevenDaysFromNow)
        .sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    
    sessionStorage.setItem('upcoming-payments', JSON.stringify(payments));
    return payments;
};

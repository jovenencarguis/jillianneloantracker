import type { User, Client, RecentActivity, UpcomingPayment } from './types';

export const users: User[] = [
  { id: '1', name: 'Admin Jilliane', username: 'admin', email: 'admin@loadbuddy.com', password: 'password', role: 'admin' },
  { id: '2', name: 'User One', username: 'user', email: 'user@loadbuddy.com', password: 'password', role: 'user' },
];

export const clients: Client[] = [
  {
    id: 'c1',
    name: 'Jillianne Doe',
    idNumber: 'AB123456',
    mobile: '+853-1111-1111',
    occupation: 'Programmer',
    yearsWorking: 5,
    originalLoanAmount: 10000,
    interestRate: 120, // 10% monthly = 120% annually
    loanDate: '2023-01-15',
    remainingBalance: 3000,
    status: 'Active',
    payments: [
      { id: 'p1', date: '2023-02-15', capitalPaid: 5000, interestPaid: 1000, totalPaid: 6000 },
      { id: 'p2', date: '2023-03-15', capitalPaid: 2000, interestPaid: 500, totalPaid: 2500 },
    ],
  },
  {
    id: 'c2',
    name: 'John Smith',
    idNumber: 'CD789012',
    mobile: '+853-2222-2222',
    passportNumber: 'P12345678',
    occupation: 'Security Guard',
    yearsWorking: 10,
    originalLoanAmount: 50000,
    interestRate: 120,
    loanDate: '2023-03-01',
    remainingBalance: 50000,
    status: 'Overdue',
    payments: [],
  },
  {
    id: 'c3',
    name: 'Peter Jones',
    idNumber: 'EF345678',
    mobile: '+853-3333-3333',
    occupation: 'Supervisor',
    yearsWorking: 3,
    originalLoanAmount: 2500,
    interestRate: 120,
    loanDate: '2023-04-10',
    remainingBalance: 1000,
    status: 'Active',
    payments: [
      { id: 'p3', date: '2023-05-10', capitalPaid: 1500, interestPaid: 250, totalPaid: 1750 },
    ],
  },
  {
    id: 'c4',
    name: 'Sarah Miller',
    idNumber: 'GH901234',
    mobile: '+853-4444-4444',
    occupation: 'Room Attendant',
    yearsWorking: 1,
    originalLoanAmount: 100000,
    interestRate: 120,
    loanDate: '2023-02-20',
    remainingBalance: 0,
    status: 'Paid Off',
    payments: [
      { id: 'p4', date: '2023-03-20', capitalPaid: 30000, interestPaid: 10000, totalPaid: 40000 },
      { id: 'p5', date: '2024-05-20', capitalPaid: 70000, interestPaid: 1000, totalPaid: 71000 }
    ],
  },
];

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

export const recentActivities: RecentActivity[] = [
    { id: 'ra1', type: 'payment', clientName: 'Jillianne Doe', date: getDateInPast(0, 0, 5), amount: 2500 },
    { id: 'ra2', type: 'new_client', clientName: 'Sarah Miller', date: getDateInPast(1, 2), amount: 100000 },
    { id: 'ra3', type: 'paid_off', clientName: 'Sarah Miller', date: getDateInPast(1, 1), amount: 0 },
    { id: 'ra4', type: 'payment', clientName: 'Peter Jones', date: getDateInPast(2, 5), amount: 1750 },
];

export const upcomingPayments: UpcomingPayment[] = [
    { id: 'up1', clientName: 'Jillianne Doe', dueDate: getDateInFuture(3), amount: 3300, isOverdue: false },
    { id: 'up2', clientName: 'John Smith', dueDate: getDateInPast(1), amount: 55000, isOverdue: true },
    { id: 'up3', clientName: 'Peter Jones', dueDate: getDateInFuture(6), amount: 1100, isOverdue: false },
];

    

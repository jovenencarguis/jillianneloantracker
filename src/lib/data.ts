import type { User, Client } from './types';

export const users: User[] = [
  { id: '1', name: 'Admin Jilliane', email: 'admin@loadbuddy.com', role: 'admin' },
  { id: '2', name: 'User One', email: 'user@loadbuddy.com', role: 'user' },
];

export const clients: Client[] = [
  {
    id: 'c1',
    name: 'Jillianne Doe',
    originalLoanAmount: 10000,
    interestRate: 120, // 10% monthly = 120% annually
    loanDate: '2023-01-15',
    remainingBalance: 3000,
    payments: [
      { id: 'p1', date: '2023-02-15', capitalPaid: 5000, interestPaid: 1000, totalPaid: 6000 },
      { id: 'p2', date: '2023-03-15', capitalPaid: 2000, interestPaid: 500, totalPaid: 2500 },
    ],
  },
  {
    id: 'c2',
    name: 'John Smith',
    originalLoanAmount: 50000,
    interestRate: 120,
    loanDate: '2023-03-01',
    remainingBalance: 50000,
    payments: [],
  },
  {
    id: 'c3',
    name: 'Peter Jones',
    originalLoanAmount: 2500,
    interestRate: 120,
    loanDate: '2023-04-10',
    remainingBalance: 1000,
    payments: [
      { id: 'p3', date: '2023-05-10', capitalPaid: 1500, interestPaid: 250, totalPaid: 1750 },
    ],
  },
  {
    id: 'c4',
    name: 'Sarah Miller',
    originalLoanAmount: 100000,
    interestRate: 120,
    loanDate: '2023-02-20',
    remainingBalance: 70000,
    payments: [
      { id: 'p4', date: '2023-03-20', capitalPaid: 30000, interestPaid: 10000, totalPaid: 40000 }
    ],
  },
];

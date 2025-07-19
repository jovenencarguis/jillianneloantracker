export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

export interface Payment {
  id: string;
  date: string;
  capitalPaid: number;
  interestPaid: number;
  totalPaid: number;
}

export interface Client {
  id: string;
  name: string;
  originalLoanAmount: number;
  interestRate: number; // Annual rate as a percentage, e.g., 10 for 10%
  loanDate: string;
  payments: Payment[];
  remainingBalance: number;
}

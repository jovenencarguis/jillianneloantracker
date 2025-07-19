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
  idNumber: string;
  passportNumber?: string;
  mobile: string;
  originalLoanAmount: number;
  interestRate: number; // Annual rate as a percentage, e.g., 10 for 10%
  loanDate: string;
  payments: Payment[];
  remainingBalance: number;
  status: 'Active' | 'Overdue' | 'Paid Off';
}

export interface RecentActivity {
  id: string;
  type: 'payment' | 'new_client' | 'paid_off';
  clientName: string;
  date: string;
  amount?: number;
}

export interface UpcomingPayment {
    id: string;
    clientName: string;
    dueDate: string;
    amount: number;
    isOverdue: boolean;
}

    
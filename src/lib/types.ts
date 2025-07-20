
export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  password?: string; // Should not be stored on client-side in a real app
  role: 'admin' | 'user';
}

export interface Payment {
  id: string;
  date: string;
  capitalPaid: number;
  interestPaid: number;
  totalPaid: number;
  notes?: string;
  createdBy?: string;
}

export interface Client {
  id: string;
  name: string;
  passportNumber?: string;
  mobile: string;
  occupation?: string;
  yearsWorking?: number;
  originalLoanAmount: number;
  interestRate: number; // Monthly rate as a percentage, e.g., 10 for 10%
  loanDate: string;
  payments: Payment[];
  remainingBalance: number;
  status: 'Active' | 'Overdue' | 'Paid Off';
}

export interface RecentActivity {
  id: string;
  action: 'Add Payment' | 'Add Client' | 'Paid Off' | 'Edit Borrower Info' | 'Delete Borrower';
  performedBy: string;
  role: 'admin' | 'user';
  target: string; // The name of the client affected
  details?: string;
  date: string; // ISO string for timestamp
}


export interface UpcomingPayment {
    id: string;
    clientName: string;
    dueDate: string;
    amount: number;
    isOverdue: boolean;
}


"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { DollarSign, Users, PiggyBank, Scale, TrendingUp, Edit3, UserPlus, Trash2 } from "lucide-react"
import { clients as initialClients, recentActivities as initialRecentActivities } from "@/lib/data"
import { useState, useEffect, useMemo } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import type { Client, RecentActivity, UpcomingPayment } from "@/lib/types"

const getStoredClients = (): Client[] => {
    if (typeof window === 'undefined') return initialClients;
    const stored = sessionStorage.getItem('all-clients');
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch (e) {
            return initialClients;
        }
    }
    return [];
};

const getStoredRecentActivities = (): RecentActivity[] => {
    if (typeof window === 'undefined') return initialRecentActivities;
    const stored = sessionStorage.getItem('recent-activities');
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch (e) {
            return initialRecentActivities;
        }
    }
    return [];
}

const getStoredUpcomingPayments = (): UpcomingPayment[] => {
    if (typeof window === 'undefined') return [];
    
    // Derive from clients if not available
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
            // Simplified: assumes a minimum payment of interest + some capital part
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
}

export default function DashboardPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [upcomingPayments, setUpcomingPayments] = useState<UpcomingPayment[]>([]);

  useEffect(() => {
    const handleStorageChange = () => {
        setClients(getStoredClients());
        setRecentActivities(getStoredRecentActivities().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        setUpcomingPayments(getStoredUpcomingPayments());
    };

    handleStorageChange(); // Initial load

    window.addEventListener('storage', handleStorageChange);
    return () => {
        window.removeEventListener('storage', handleStorageChange);
    };
  }, []);


  const stats = useMemo(() => {
    const totalClients = clients.length
    const totalLoanAmount = clients.reduce((sum, client) => sum + client.originalLoanAmount, 0)
    const totalOutstanding = clients.reduce((sum, client) => sum + client.remainingBalance, 0)
    const totalInterestPaid = clients.reduce((sum, client) => {
      return sum + client.payments.reduce((paymentSum, payment) => paymentSum + payment.interestPaid, 0)
    }, 0)

    return { totalClients, totalLoanAmount, totalOutstanding, totalInterestPaid }
  }, [clients])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'MOP' }).format(amount)
  }
  
  const timeSince = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 5) return "just now";
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "m ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    return Math.floor(seconds) + "s ago";
  };
  
  const getActivityIcon = (type: RecentActivity['action']) => {
    switch (type) {
      case 'Add Client':
        return <UserPlus className="h-4 w-4" />;
      case 'Add Payment':
        return <DollarSign className="h-4 w-4" />;
      case 'Paid Off':
        return <TrendingUp className="h-4 w-4" />;
      case 'Edit Borrower Info':
        return <Edit3 className="h-4 w-4" />;
      case 'Delete Borrower':
        return <Trash2 className="h-4 w-4 text-destructive" />;
      default:
        return null;
    }
  };


  return (
    <div className="flex-1 space-y-4 pt-6">
      <h2 className="text-3xl font-bold tracking-tight font-headline">Dashboard</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClients}</div>
            <p className="text-xs text-muted-foreground">All registered borrowers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Loaned Amount</CardTitle>
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalLoanAmount)}</div>
            <p className="text-xs text-muted-foreground">Total capital disbursed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Balances</CardTitle>
            <Scale className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalOutstanding)}</div>
            <p className="text-xs text-muted-foreground">Total amount yet to be paid</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Interest Earned</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalInterestPaid)}</div>
            <p className="text-xs text-muted-foreground">Total interest payments received</p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-full lg:col-span-4">
          <CardHeader>
            <CardTitle className="font-headline">Recent Activity</CardTitle>
            <CardDescription>A log of all important actions within the system.</CardDescription>
          </CardHeader>
          <CardContent>
             {recentActivities.length > 0 ? (
                <div className="space-y-6">
                    {recentActivities.slice(0, 10).map((activity) => (
                        <div key={activity.id} className="flex items-center">
                            <Avatar className="h-9 w-9">
                                <AvatarFallback className="bg-primary/10 text-primary">
                                    {getActivityIcon(activity.action)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="ml-4 space-y-1">
                                <p className="text-sm font-medium leading-none flex items-center gap-2">
                                    {activity.action}
                                    <span className="text-xs text-muted-foreground font-normal">by {activity.performedBy} ({activity.role})</span>
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    <span className="font-semibold">{activity.target}</span>
                                    {activity.details ? ` - ${activity.details}` : ''}
                                </p>
                            </div>
                            <div className="ml-auto font-medium text-muted-foreground text-xs">{timeSince(activity.date)}</div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center text-muted-foreground h-24 flex items-center justify-center p-4">No recent activity yet. Actions like payments, edits, or deletions will appear here.</div>
            )}
          </CardContent>
        </Card>
        <Card className="col-span-full lg:col-span-3">
          <CardHeader>
            <CardTitle className="font-headline">Upcoming Payments</CardTitle>
             <CardDescription>Payments due within the next 7 days.</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingPayments.length > 0 ? (
                <div className="space-y-6">
                    {upcomingPayments.map((payment) => (
                        <div key={payment.id} className="flex items-center">
                             <Avatar className="h-9 w-9 border">
                                <AvatarFallback>{payment.clientName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="ml-4 space-y-1">
                                <p className="text-sm font-medium leading-none">{payment.clientName}</p>
                                <div className="text-sm text-muted-foreground flex items-center">
                                    <span>Due: {new Date(payment.dueDate).toLocaleDateString()}</span>
                                    {payment.isOverdue && <Badge variant="destructive" className="ml-2 text-xs">Overdue</Badge>}
                                </div>
                            </div>
                            <div className="ml-auto font-semibold">{formatCurrency(payment.amount)}</div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center text-muted-foreground h-24 flex items-center justify-center p-4">No payments due soon. You’re all caught up!</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

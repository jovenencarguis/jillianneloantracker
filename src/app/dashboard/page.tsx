
"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { DollarSign, Users, PiggyBank, Scale, UserPlus, TrendingUp, AlertCircle } from "lucide-react"
import { clients, recentActivities, upcomingPayments } from "@/lib/data"
import { useMemo } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

export default function DashboardPage() {
  const stats = useMemo(() => {
    const totalClients = clients.length
    const totalLoanAmount = clients.reduce((sum, client) => sum + client.originalLoanAmount, 0)
    const totalOutstanding = clients.reduce((sum, client) => sum + client.remainingBalance, 0)
    const totalInterestPaid = clients.reduce((sum, client) => {
      return sum + client.payments.reduce((paymentSum, payment) => paymentSum + payment.interestPaid, 0)
    }, 0)

    return { totalClients, totalLoanAmount, totalOutstanding, totalInterestPaid }
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'MOP' }).format(amount)
  }
  
  const timeSince = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
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
  
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'new_client':
        return <UserPlus className="h-4 w-4" />
      case 'payment':
        return <DollarSign className="h-4 w-4" />
      case 'paid_off':
        return <TrendingUp className="h-4 w-4" />
      default:
        return null;
    }
  }

  const getActivityDescription = (activity: typeof recentActivities[0]) => {
     switch (activity.type) {
      case 'new_client':
        return `New loan of ${formatCurrency(activity.amount || 0)}`
      case 'payment':
        return `Made a payment of ${formatCurrency(activity.amount || 0)}`
      case 'paid_off':
        return 'Loan fully paid off'
      default:
        return '';
    }
  }


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
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle className="font-headline">Recent Activity</CardTitle>
            <CardDescription>Recent transactions from your clients.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
                {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-center">
                        <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-primary/10 text-primary">
                                {getActivityIcon(activity.type)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="ml-4 space-y-1">
                            <p className="text-sm font-medium leading-none">{activity.clientName}</p>
                            <p className="text-sm text-muted-foreground">{getActivityDescription(activity)}</p>
                        </div>
                        <div className="ml-auto font-medium text-muted-foreground text-xs">{timeSince(activity.date)}</div>
                    </div>
                ))}
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle className="font-headline">Upcoming Payments</CardTitle>
             <CardDescription>Payments due within the next 7 days.</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="space-y-6">
                {upcomingPayments.map((payment) => (
                    <div key={payment.id} className="flex items-center">
                         <Avatar className="h-9 w-9">
                            <AvatarImage src={`https://placehold.co/100x100.png`} alt={payment.clientName} data-ai-hint="profile person" />
                            <AvatarFallback>{payment.clientName.charAt(0)}</AvatarFallback>
                        </Avatar>
                         <div className="ml-4 space-y-1">
                            <p className="text-sm font-medium leading-none">{payment.clientName}</p>
                            <div className="text-sm text-muted-foreground">
                                Due: {new Date(payment.dueDate).toLocaleDateString()}
                                {payment.isOverdue && <Badge variant="destructive" className="ml-2 text-xs">Overdue</Badge>}
                            </div>
                        </div>
                        <div className="ml-auto font-semibold">{formatCurrency(payment.amount)}</div>
                    </div>
                ))}
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

    

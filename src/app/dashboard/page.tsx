"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Users, PiggyBank, Scale } from "lucide-react"
import { clients } from "@/lib/data"
import { useMemo } from "react"

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
          </CardHeader>
          <CardContent className="pl-2">
            {/* A more complex chart or list of recent payments could go here */}
            <div className="text-center text-muted-foreground py-12">
              <p>Recent activity feed coming soon.</p>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle className="font-headline">Upcoming Payments</CardTitle>
          </CardHeader>
          <CardContent>
             {/* A list of clients with upcoming payments could go here */}
             <div className="text-center text-muted-foreground py-12">
              <p>Upcoming payments tracking coming soon.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

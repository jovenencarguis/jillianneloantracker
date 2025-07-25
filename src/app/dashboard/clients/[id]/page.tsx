
"use client";

import { useState, useEffect } from "react";
import { useParams, notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  User,
  Calendar,
  DollarSign,
  Landmark,
  PlusCircle,
  Hash,
  BadgePercent,
  FileText,
  Smartphone,
  Briefcase,
  CalendarClock,
  MessageSquare,
} from "lucide-react";
import type { Client } from "@/lib/types";
import { AddPaymentForm } from "@/components/add-payment-form";
import { useAuth } from "@/context/auth-context";
import { updateStoredData } from "@/lib/storage";

export default function ClientDetailPage() {
  const params = useParams();
  const { user, clients, setClients } = useAuth();
  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddPaymentModalOpen, setAddPaymentModalOpen] = useState(false);

  useEffect(() => {
    const id = Array.isArray(params.id) ? params.id[0] : params.id;
    const foundClient = clients.find((c: Client) => c.id === id);
    if (foundClient) {
      setClient(foundClient);
    }
    setIsLoading(false);
  }, [params.id, clients]);

  const handlePaymentAdded = (updatedClient: Client) => {
    setClient(updatedClient);
    const updatedClients = clients.map((c: Client) => 
        c.id === updatedClient.id ? updatedClient : c
    );
    setClients(updatedClients);
    updateStoredData('clients', updatedClients);
  };


  if (isLoading) {
    return <div>Loading client details...</div>;
  }

  if (!client) {
    // Let the notFound() be triggered by the parent component's loading state handling
    return <div>Client not found.</div>;
  }
  
  const getStatusBadge = (status: Client['status']) => {
    switch (status) {
        case 'Paid Off':
            return <Badge variant="outline" className="text-accent-foreground border-accent">Paid Off</Badge>;
        case 'Overdue':
            return <Badge variant="destructive">Overdue</Badge>;
        case 'Active':
        default:
            return <Badge variant="secondary">Active</Badge>;
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "MOP",
    }).format(amount);
  };
  
  const totalPaid = client.payments.reduce((sum, p) => sum + p.totalPaid, 0);

  return (
    <>
      <AddPaymentForm
        isOpen={isAddPaymentModalOpen}
        onOpenChange={setAddPaymentModalOpen}
        client={client}
        onPaymentAdded={handlePaymentAdded}
      />
      <div className="space-y-6 pt-6 pb-12">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-4">
               <h2 className="text-3xl font-bold tracking-tight font-headline">
                  {client.name}
               </h2>
               {getStatusBadge(client.status)}
            </div>
            <p className="text-muted-foreground">
              Detailed loan information and payment history.
            </p>
          </div>
          {user && (
            <Button onClick={() => setAddPaymentModalOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Payment
            </Button>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="font-headline">Client Profile</CardTitle>
              <CardDescription>Borrower's personal details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center">
                <User className="mr-3 h-5 w-5 text-muted-foreground" />
                <span>{client.name}</span>
              </div>
               <div className="flex items-center">
                <Hash className="mr-3 h-5 w-5 text-muted-foreground" />
                <span>ID: {client.id}</span>
              </div>
              {client.passportNumber && (
                  <div className="flex items-center">
                      <FileText className="mr-3 h-5 w-5 text-muted-foreground" />
                      <span>Passport: {client.passportNumber}</span>
                  </div>
              )}
               <div className="flex items-center">
                <Smartphone className="mr-3 h-5 w-5 text-muted-foreground" />
                <span>{client.mobile}</span>
              </div>
              {client.occupation && (
                  <div className="flex items-center">
                      <Briefcase className="mr-3 h-5 w-5 text-muted-foreground" />
                      <span>{client.occupation}</span>
                  </div>
              )}
              {client.yearsWorking && (
                  <div className="flex items-center">
                      <CalendarClock className="mr-3 h-5 w-5 text-muted-foreground" />
                      <span>{client.yearsWorking} years working</span>
                  </div>
              )}
               <div className="flex items-center">
                <BadgePercent className="mr-3 h-5 w-5 text-muted-foreground" />
                <span>Interest Rate: {client.interestRate}% / month</span>
              </div>
              <div className="flex items-center">
                <Calendar className="mr-3 h-5 w-5 text-muted-foreground" />
                <span>Loan Date: {new Date(client.loanDate).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>
          <Card className="md:col-span-2">
              <CardHeader>
                  <CardTitle className="font-headline">Loan Summary</CardTitle>
                  <CardDescription>Financial overview of the loan.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-y-4 gap-x-2">
                  <div className="flex items-start space-x-3">
                      <div className="p-2 bg-primary/10 rounded-md"><Landmark className="h-5 w-5 text-primary"/></div>
                      <div>
                          <p className="text-sm text-muted-foreground">Original Loan</p>
                          <p className="font-semibold text-lg">{formatCurrency(client.originalLoanAmount)}</p>
                      </div>
                  </div>
                  <div className="flex items-start space-x-3">
                      <div className="p-2 bg-primary/10 rounded-md"><DollarSign className="h-5 w-5 text-primary"/></div>
                      <div>
                          <p className="text-sm text-muted-foreground">Remaining Balance</p>
                          <p className="font-semibold text-lg">{formatCurrency(client.remainingBalance)}</p>
                      </div>
                  </div>
                   <div className="flex items-start space-x-3">
                      <div className="p-2 bg-accent/10 rounded-md"><DollarSign className="h-5 w-5 text-accent"/></div>
                      <div>
                          <p className="text-sm text-muted-foreground">Total Paid</p>
                          <p className="font-semibold text-lg">{formatCurrency(totalPaid)}</p>
                      </div>
                  </div>
                  <div className="flex items-start space-x-3">
                      <div className="p-2 bg-accent/10 rounded-md"><DollarSign className="h-5 w-5 text-accent"/></div>
                      <div>
                          <p className="text-sm text-muted-foreground">Interest Paid</p>
                          <p className="font-semibold text-lg">{formatCurrency(client.payments.reduce((s, p) => s + p.interestPaid, 0))}</p>
                      </div>
                  </div>
              </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Payment History</CardTitle>
            <CardDescription>
              A detailed log of all payments made for this loan.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Capital Paid</TableHead>
                  <TableHead className="text-right">Interest Paid</TableHead>
                  <TableHead className="text-right">Total Paid</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Added By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {client.payments.length > 0 ? (
                  client.payments.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        {new Date(payment.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(payment.capitalPaid)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(payment.interestPaid)}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(payment.totalPaid)}
                      </TableCell>
                       <TableCell>
                        {payment.notes && (
                           <div className="flex items-start gap-2 text-muted-foreground text-xs">
                             <MessageSquare className="h-4 w-4 mt-0.5 shrink-0" /> 
                             <span>{payment.notes}</span>
                           </div>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {payment.createdBy}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-24">
                      No payments have been made yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

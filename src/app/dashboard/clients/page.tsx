"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, PlusCircle, Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import type { Client } from "@/lib/types";
import { clients as initialClients } from "@/lib/data";
import { AddClientForm } from "@/components/add-client-form";
import { cn } from "@/lib/utils";

const updateStoredClients = (clients: Client[]) => {
    if (typeof window !== 'undefined') {
        window.sessionStorage.setItem('all-clients', JSON.stringify(clients));
    }
};

const getStoredClients = () => {
    if (typeof window !== 'undefined') {
        const storedClients = window.sessionStorage.getItem('all-clients');
        if (storedClients) {
            return JSON.parse(storedClients);
        }
    }
    return initialClients;
};


export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>(getStoredClients);
  const [isAddClientModalOpen, setAddClientModalOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    updateStoredClients(clients);
  }, [clients]);

  const handleAddClient = (newClient: Client) => {
    setClients((prevClients) => [newClient, ...prevClients]);
  };
  
  const handleDeleteClient = (clientId: string) => {
    const clientName = clients.find(c => c.id === clientId)?.name || "The client";
    setClients((prevClients) => prevClients.filter((client) => client.id !== clientId));
    toast({
        title: "Client Deleted",
        description: `${clientName} has been permanently removed.`,
    });
    setClientToDelete(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "MOP",
      minimumFractionDigits: 2,
    }).format(amount);
  };
  
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

  return (
    <>
      <AddClientForm 
        isOpen={isAddClientModalOpen}
        onOpenChange={setAddClientModalOpen}
        onClientAdded={handleAddClient}
      />
      <AlertDialog open={!!clientToDelete} onOpenChange={() => setClientToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="text-destructive"/> Are you absolutely sure?
                </AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the profile for <strong>{clientToDelete?.name}</strong> and all of their associated payment history.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => handleDeleteClient(clientToDelete!.id)} className={buttonVariants({ variant: "destructive" })}>
                    <Trash2 className="mr-2 h-4 w-4"/>
                    Yes, delete client
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="space-y-4 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight font-headline">
              Client Profiles
            </h2>
            <p className="text-muted-foreground">
              Manage your borrowers and their loans.
            </p>
          </div>
          <Button onClick={() => setAddClientModalOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Client
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Borrowers List</CardTitle>
            <CardDescription>
              A list of all clients with active or past loans.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Original Loan
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                    Remaining Balance
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">{client.name}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {formatCurrency(client.originalLoanAmount)}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {formatCurrency(client.remainingBalance)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(client.status)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            aria-haspopup="true"
                            size="icon"
                            variant="ghost"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem
                            onSelect={() =>
                              router.push(`/dashboard/clients/${client.id}`)
                            }
                          >
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>Edit Profile</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive focus:bg-destructive/10"
                            onSelect={() => setClientToDelete(client)}
                          >
                            <Trash2 className="mr-2 h-4 w-4"/>
                            Delete Client
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}


"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FileText, PlusCircle, Trash2, AlertTriangle, Pencil } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
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
import type { Client, RecentActivity } from "@/lib/types";
import { AddClientForm } from "@/components/add-client-form";
import { EditClientForm } from "@/components/edit-client-form";
import { useAuth } from "@/context/auth-context";
import { updateStoredData, getStoredClients, getStoredRecentActivities } from "@/lib/storage";


export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isAddClientModalOpen, setAddClientModalOpen] = useState(false);
  const [isEditClientModalOpen, setEditClientModalOpen] = useState(false);
  const [clientToEdit, setClientToEdit] = useState<Client | null>(null);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const refreshData = () => {
      setClients(getStoredClients());
    };
    refreshData();

    window.addEventListener('storage-updated', refreshData);
    return () => {
        window.removeEventListener('storage-updated', refreshData);
    };
  }, []);

  const handleAddClient = (newClient: Client) => {
    const updatedClients = [newClient, ...clients];
    setClients(updatedClients);
    updateStoredData('clients', updatedClients);
  };

  const handleUpdateClient = (updatedClient: Client, changes: string[]) => {
    const updatedClients = clients.map(c => c.id === updatedClient.id ? updatedClient : c);
    setClients(updatedClients);
    updateStoredData('clients', updatedClients);
    setClientToEdit(null);

    // Log activity
    if (user) {
      const newActivity: RecentActivity = {
        id: `ra${Date.now()}`,
        action: 'Edit Borrower Info',
        performedBy: user.name,
        role: user.role,
        target: updatedClient.name,
        details: `Updated fields: ${changes.join(', ')}`,
        date: new Date().toISOString(),
      };
      const updatedActivities = [newActivity, ...getStoredRecentActivities()];
      updateStoredData('activities', updatedActivities);
    }
    toast({
        title: "Client Updated",
        description: "Edits saved and logged to system history.",
    });
  };
  
  const handleDeleteClient = (clientId: string) => {
    const client = clients.find(c => c.id === clientId)
    if (!client) return;
    
    const updatedClients = clients.filter((c) => c.id !== clientId);
    setClients(updatedClients);

    // Log activity
     if (user) {
      const newActivity: RecentActivity = {
        id: `ra${Date.now()}`,
        action: 'Delete Borrower',
        performedBy: user.name,
        role: user.role,
        target: client.name,
        date: new Date().toISOString(),
      };
      const updatedActivities = [newActivity, ...getStoredRecentActivities()];
      updateStoredData('activities', updatedActivities);
    } else {
      updateStoredData('clients', updatedClients);
    }

    toast({
        title: "Client Deleted",
        description: `${client.name} has been permanently removed.`,
    });
    setClientToDelete(null);
  };

  const openEditModal = (client: Client) => {
    setClientToEdit(client);
    setEditClientModalOpen(true);
  }

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
      {clientToEdit && user && (
        <EditClientForm
            isOpen={isEditClientModalOpen}
            onOpenChange={setEditClientModalOpen}
            client={clientToEdit}
            onClientUpdated={handleUpdateClient}
            currentUser={user}
        />
      )}
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
                <AlertDialogAction onClick={() => clientToDelete && handleDeleteClient(clientToDelete.id)} className={buttonVariants({ variant: "destructive" })}>
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
          {user && (
              <Button onClick={() => setAddClientModalOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Client
              </Button>
          )}
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
                            <FileText className="h-4 w-4" />
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
                          {user && (
                            <>
                              <DropdownMenuItem onSelect={() => openEditModal(client)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit Profile
                              </DropdownMenuItem>
                              {user.role === 'admin' && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-destructive focus:text-destructive focus:bg-destructive/10"
                                    onSelect={() => setClientToDelete(client)}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4"/>
                                    Delete Client
                                  </DropdownMenuItem>
                                </>
                              )}
                            </>
                          )}
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

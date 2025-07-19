"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, PlusCircle } from "lucide-react";
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
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import type { Client } from "@/lib/types";
import { clients as initialClients } from "@/lib/data";

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>(initialClients);
  const router = useRouter();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "MOP",
      minimumFractionDigits: 2,
    }).format(amount);
  };
  
  const getStatus = (client: Client) => {
    if (client.remainingBalance <= 0) {
      return <Badge variant="outline" className="text-accent-foreground border-accent">Paid Off</Badge>;
    }
    // This is a mock logic. A real app would compare due dates.
    if (client.id === 'c2') {
        return <Badge variant="destructive">Overdue</Badge>
    }
    return <Badge variant="secondary">Active</Badge>;
  }

  return (
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
        <Button>
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
                    {getStatus(client)}
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
                        <DropdownMenuItem className="text-destructive">
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
  );
}

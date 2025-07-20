
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { PlusCircle, ShieldCheck, UserCog, Trash2, AlertTriangle, UserPlus, MoreVertical, Pencil } from "lucide-react";
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
import type { User } from "@/lib/types";
import { users as initialUsers } from "@/lib/data";
import { AddUserForm } from "@/components/add-user-form";
import { EditUserForm } from "@/components/edit-user-form";

const updateStoredUsers = (users: User[]) => {
    if (typeof window !== 'undefined') {
        window.sessionStorage.setItem('all-users', JSON.stringify(users));
    }
};

const getStoredUsers = (): User[] => {
    if (typeof window !== 'undefined') {
        const storedUsers = window.sessionStorage.getItem('all-users');
        if (storedUsers) {
            try {
                // If storedUsers is an empty array string '[]', it's valid.
                // It only falls back to initialUsers if parsing fails or storedUsers is null/undefined.
                return JSON.parse(storedUsers);
            } catch (e) {
                console.error("Failed to parse users from sessionStorage", e);
                // Fallback only on error
                return initialUsers;
            }
        }
    }
    // Fallback if sessionStorage is not available or item doesn't exist.
    // We can seed it here for the first run.
    updateStoredUsers(initialUsers);
    return initialUsers;
};

export default function AdminPage() {
  const { user, loading, logout, refetchUsers } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [isAddUserModalOpen, setAddUserModalOpen] = useState(false);
  const [isEditUserModalOpen, setEditUserModalOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setUsers(getStoredUsers());
  }, []);
  
  useEffect(() => {
    if (!loading && user?.role !== "admin") {
      // User will be redirected by the layout if not admin, but this is a failsafe
      // For this simple app, we can just show a message. A redirect could cause a loop if not handled carefully.
    }
  }, [user, loading]);
  
  useEffect(() => {
    // We only update storage if users state is not the initial empty array on mount.
    // This prevents overwriting storage with an empty array before it's loaded.
    if (users.length > 0 || sessionStorage.getItem('all-users')) {
        updateStoredUsers(users);
        refetchUsers?.();
    }
  }, [users, refetchUsers]);

  const handleRoleChange = (userId: string, newRole: "admin" | "user") => {
    const targetUser = users.find((u) => u.id === userId);
    if (!targetUser) return;
    
    // Prevent admin from demoting themselves if they are the only admin
    const adminCount = users.filter(u => u.role === 'admin').length;
    if (user?.id === userId && newRole === 'user' && adminCount <= 1) {
        toast({
            variant: "destructive",
            title: "Action Forbidden",
            description: "You cannot demote the only administrator.",
        });
        return;
    }

    setUsers(
      users.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
    toast({
        title: "Role Updated",
        description: `${targetUser.name}'s role has been changed to ${newRole}.`,
    });

    // If admin demotes themselves, log them out to re-authenticate with new role
    if (user?.id === userId && newRole === 'user') {
      setTimeout(() => logout(), 1500);
    }
  };

  const openDeleteDialog = (userToDelete: User) => {
    if (user?.id === userToDelete.id) {
         toast({
            variant: "destructive",
            title: "Action Forbidden",
            description: "You cannot delete your own account.",
        });
        return;
    }
     // Prevent admin from deleting the only admin
    const adminCount = users.filter(u => u.role === 'admin').length;
    if (userToDelete.role === 'admin' && adminCount <= 1) {
        toast({
            variant: "destructive",
            title: "Action Forbidden",
            description: "You cannot delete the only administrator.",
        });
        return;
    }
    setUserToDelete(userToDelete);
  }

  const handleDeleteUser = () => {
    if (!userToDelete) return;
    setUsers(users.filter((u) => u.id !== userToDelete.id));
    toast({
        title: "User Deleted",
        description: `User ${userToDelete.name} has been permanently removed.`,
    });
    setUserToDelete(null);
  };

  const handleUserAdded = (newUser: User) => {
    setUsers((prev) => [...prev, newUser]);
  }

  const handleUserUpdated = (updatedUser: User) => {
    setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
    toast({
      title: "User Updated",
      description: `${updatedUser.name}'s details have been updated.`,
    });
    setUserToEdit(null);
  };

  const openEditModal = (userToEdit: User) => {
    setUserToEdit(userToEdit);
    setEditUserModalOpen(true);
  };

  if (loading || user?.role !== "admin") {
    return <div>Loading or unauthorized...</div>;
  }

  return (
    <>
      <AddUserForm 
          isOpen={isAddUserModalOpen}
          onOpenChange={setAddUserModalOpen}
          onUserAdded={handleUserAdded}
      />
      {userToEdit && (
          <EditUserForm
              isOpen={isEditUserModalOpen}
              onOpenChange={setEditUserModalOpen}
              user={userToEdit}
              onUserUpdated={handleUserUpdated}
          />
      )}
      <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                      <AlertTriangle className="text-destructive"/> Are you sure?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                      This will permanently delete the user <strong>{userToDelete?.name}</strong>. This action cannot be undone.
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteUser} className={buttonVariants({ variant: "destructive" })}>
                      <Trash2 className="mr-2 h-4 w-4"/>
                      Yes, delete user
                  </AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
      <div className="space-y-4 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight font-headline">
              Admin Control Panel
            </h2>
            <p className="text-muted-foreground">
              Manage users and application settings.
            </p>
          </div>
          <Button onClick={() => setAddUserModalOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" /> Add New User
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>
              View and manage user roles and access.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.username}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>
                      {u.role === "admin" ? (
                        <Badge><ShieldCheck className="mr-1 h-3 w-3" />Admin</Badge>
                      ) : (
                        <Badge variant="secondary"><UserCog className="mr-1 h-3 w-3" />User</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            aria-haspopup="true"
                            size="icon"
                            variant="ghost"
                          >
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onSelect={() => openEditModal(u)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit User
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onSelect={() => handleRoleChange(u.id, "admin")} disabled={u.role === 'admin'}>
                              Make Admin
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => handleRoleChange(u.id, "user")} disabled={u.role === 'user'}>
                              Make User
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10" onSelect={() => openDeleteDialog(u)}>
                            <Trash2 className="mr-2 h-4 w-4"/>
                            Delete User
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

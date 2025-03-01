"use client";

import { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Calendar,
  Check,
  MoreHorizontal, 
  Shield, 
  ShieldOff, 
  User,
  X 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type User = {
  id: number;
  email: string;
  username: string | null;
  name: string | null;
  profileImage: string | null;
  isVerified: boolean;
  role: string;
  isActive: boolean;
  activeUntil: string | null;
  createdAt: string;
};

// This is temporary mock data. In the real app this will come from the API
const MOCK_USERS: User[] = [
  {
    id: 1,
    email: "admin@example.com",
    username: "admin",
    name: "Administrator",
    profileImage: null,
    isVerified: true,
    role: "ADMIN",
    isActive: true,
    activeUntil: null,
    createdAt: "2023-01-15T00:00:00.000Z"
  },
  {
    id: 2,
    email: "user1@example.com",
    username: "user1",
    name: "Regular User",
    profileImage: null,
    isVerified: true,
    role: "USER",
    isActive: true,
    activeUntil: "2024-12-31T00:00:00.000Z",
    createdAt: "2023-02-20T00:00:00.000Z"
  },
  {
    id: 3,
    email: "user2@example.com",
    username: "user2",
    name: "Inactive User",
    profileImage: null,
    isVerified: true,
    role: "USER",
    isActive: false,
    activeUntil: null,
    createdAt: "2023-03-10T00:00:00.000Z"
  },
];

export function UserTable() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showActivationDialog, setShowActivationDialog] = useState(false);
  const [activationDate, setActivationDate] = useState<string>("");
  
  // #TODO: Replace with actual API calls
  async function toggleUserRole(userId: number) {
    try {
      // Get the user
      const user = users.find(u => u.id === userId);
      if (!user) return;
      
      // Don't allow demoting the last admin
      if (user.role === "ADMIN" && users.filter(u => u.role === "ADMIN").length <= 1) {
        toast.error("Cannot demote the last admin user");
        return;
      }
      
      // Toggle role
      const newRole = user.role === "ADMIN" ? "USER" : "ADMIN";
      
      // In a real app, this would be an API call
      // await fetch(`/api/admin/users/${userId}/role`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ role: newRole })
      // });
      
      // Update local state for now
      setUsers(users.map(u => 
        u.id === userId 
          ? { ...u, role: newRole } 
          : u
      ));
      
      toast.success(`User ${user.email} is now a ${newRole.toLowerCase()}`);
      router.refresh();
    } catch (error) {
      toast.error("Failed to update user role");
      console.error(error);
    }
  }
  
  async function toggleUserActivation(userId: number) {
    try {
      // Get the user
      const user = users.find(u => u.id === userId);
      if (!user) return;
      
      // Toggle activation
      const newStatus = !user.isActive;
      let activeUntil = user.activeUntil;
      
      if (newStatus && activationDate) {
        activeUntil = new Date(activationDate).toISOString();
      }
      
      // In a real app, this would be an API call
      // await fetch(`/api/admin/users/${userId}/activation`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ 
      //     isActive: newStatus,
      //     activeUntil: activeUntil
      //   })
      // });
      
      // Update local state for now
      setUsers(users.map(u => 
        u.id === userId 
          ? { ...u, isActive: newStatus, activeUntil } 
          : u
      ));
      
      setShowActivationDialog(false);
      setSelectedUser(null);
      setActivationDate("");
      
      toast.success(`User ${user.email} is now ${newStatus ? 'active' : 'inactive'}`);
      router.refresh();
    } catch (error) {
      toast.error("Failed to update user activation status");
      console.error(error);
    }
  }
  
  function handleActivateUser(user: User) {
    setSelectedUser(user);
    setActivationDate(user.activeUntil || "");
    setShowActivationDialog(true);
  }
  
  function formatDate(dateString: string | null) {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  }
  
  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Active Until</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={user.profileImage || ""} />
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{user.name || user.username}</div>
                      <div className="text-xs text-muted-foreground">@{user.username}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge 
                    variant={user.role === "ADMIN" ? "default" : "outline"}
                    className={cn(
                      "capitalize",
                      user.role === "ADMIN" && "bg-primary text-primary-foreground"
                    )}
                  >
                    {user.role.toLowerCase()}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div 
                      className={cn(
                        "h-2 w-2 rounded-full",
                        user.isActive ? "bg-green-500" : "bg-red-500"
                      )} 
                    />
                    <span>{user.isActive ? "Active" : "Inactive"}</span>
                  </div>
                </TableCell>
                <TableCell>{formatDate(user.activeUntil)}</TableCell>
                <TableCell>{formatDate(user.createdAt)}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => toggleUserRole(user.id)}>
                        {user.role === "ADMIN" ? (
                          <>
                            <ShieldOff className="mr-2 h-4 w-4" />
                            <span>Remove Admin</span>
                          </>
                        ) : (
                          <>
                            <Shield className="mr-2 h-4 w-4" />
                            <span>Make Admin</span>
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleActivateUser(user)}>
                        {user.isActive ? (
                          <>
                            <X className="mr-2 h-4 w-4" />
                            <span>Deactivate</span>
                          </>
                        ) : (
                          <>
                            <Check className="mr-2 h-4 w-4" />
                            <span>Activate</span>
                          </>
                        )}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {/* Activation Dialog */}
      <Dialog open={showActivationDialog} onOpenChange={setShowActivationDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {selectedUser?.isActive ? "Deactivate" : "Activate"} User Account
            </DialogTitle>
            <DialogDescription>
              {selectedUser?.isActive 
                ? "Deactivating this account will prevent the user from accessing certain features."
                : "Set an optional expiration date for the account activation period."}
            </DialogDescription>
          </DialogHeader>
          
          {!selectedUser?.isActive && (
            <div className="grid gap-4 py-4">
              <div className="grid items-center gap-4">
                <Label htmlFor="activeUntil">Active Until (Optional)</Label>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 opacity-50" />
                  <Input
                    id="activeUntil"
                    type="date"
                    value={activationDate ? new Date(activationDate).toISOString().split('T')[0] : ""}
                    onChange={(e) => setActivationDate(e.target.value ? new Date(e.target.value).toISOString() : "")}
                    placeholder="No expiration"
                  />
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowActivationDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant={selectedUser?.isActive ? "destructive" : "default"}
              onClick={() => selectedUser && toggleUserActivation(selectedUser.id)}
            >
              {selectedUser?.isActive ? "Deactivate" : "Activate"} Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 
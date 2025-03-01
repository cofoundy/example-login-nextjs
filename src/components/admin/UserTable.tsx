"use client";

import { useState, useEffect } from "react";
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
  X,
  Loader2
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

type Pagination = {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

// Proper error type
interface ApiError extends Error {
  message: string;
}

export function UserTable() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showActivationDialog, setShowActivationDialog] = useState(false);
  const [activationDate, setActivationDate] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 10,
    pages: 0
  });
  
  // Function to fetch users - defined outside useEffect so it can be called elsewhere
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/admin/users?page=${pagination.page}&limit=${pagination.limit}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      
      const data = await response.json();
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to load users. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch users when component mounts or pagination changes
  useEffect(() => {
    fetchUsers();
  }, [pagination.page, pagination.limit]);
  
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
      
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update user role');
      }
      
      // Update local state
      setUsers(users.map(u => 
        u.id === userId 
          ? { ...u, role: newRole } 
          : u
      ));
      
      toast.success(`User ${user.email} is now a ${newRole.toLowerCase()}`);
      router.refresh();
    } catch (error: unknown) {
      const apiError = error as ApiError;
      toast.error(apiError.message || "Failed to update user role");
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
      let activeUntil = null; // Default to null
      
      // Only set activeUntil if activating and a date is specified
      if (newStatus && activationDate) {
        activeUntil = new Date(activationDate).toISOString();
      }
      
      const response = await fetch(`/api/admin/users/${userId}/activation`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          isActive: newStatus,
          activeUntil: activeUntil
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update user activation status');
      }
      
      // Update local state
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
    } catch (error: unknown) {
      const apiError = error as ApiError;
      toast.error(apiError.message || "Failed to update user activation status");
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
  
  function handleChangePage(page: number) {
    if (page < 1 || page > pagination.pages) return;
    setPagination(prev => ({ ...prev, page }));
  }
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading users...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex justify-center items-center h-64 text-destructive">
        <p>{error}</p>
        <Button 
          variant="outline" 
          className="ml-4"
          onClick={() => fetchUsers()}
        >
          Retry
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
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
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
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
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => toggleUserRole(user.id)}
                          className="cursor-pointer"
                        >
                          {user.role === "ADMIN" ? (
                            <>
                              <ShieldOff className="h-4 w-4 mr-2" />
                              <span>Remove Admin</span>
                            </>
                          ) : (
                            <>
                              <Shield className="h-4 w-4 mr-2" />
                              <span>Make Admin</span>
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleActivateUser(user)}
                          className="cursor-pointer"
                        >
                          {user.isActive ? (
                            <>
                              <X className="h-4 w-4 mr-2" />
                              <span>Deactivate</span>
                            </>
                          ) : (
                            <>
                              <Check className="h-4 w-4 mr-2" />
                              <span>Activate</span>
                            </>
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination controls */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-end space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleChangePage(pagination.page - 1)}
            disabled={pagination.page <= 1}
          >
            Previous
          </Button>
          <div className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.pages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleChangePage(pagination.page + 1)}
            disabled={pagination.page >= pagination.pages}
          >
            Next
          </Button>
        </div>
      )}
      
      {/* Activation Dialog */}
      <Dialog open={showActivationDialog} onOpenChange={setShowActivationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedUser?.isActive ? "Deactivate User Account" : "Activate User Account"}
            </DialogTitle>
            <DialogDescription>
              {selectedUser?.isActive 
                ? `This will prevent ${selectedUser?.email} from accessing the platform.` +
                  (selectedUser?.activeUntil ? " The activation expiration date will be cleared." : "")
                : `This will allow ${selectedUser?.email} to access the platform.`
              }
            </DialogDescription>
          </DialogHeader>
          
          {!selectedUser?.isActive && (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="expirationDate">Account Active Until (Optional)</Label>
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4 opacity-70" />
                  <Input 
                    id="expirationDate" 
                    type="date" 
                    value={activationDate?.split('T')[0] || ''} 
                    onChange={(e) => {
                      const date = e.target.value;
                      if (date) {
                        setActivationDate(new Date(date).toISOString());
                      } else {
                        setActivationDate('');
                      }
                    }}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  If not specified, the account will remain active indefinitely.
                </p>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowActivationDialog(false);
                setSelectedUser(null);
              }}
            >
              Cancel
            </Button>
            <Button 
              variant={selectedUser?.isActive ? "destructive" : "default"}
              onClick={() => selectedUser && toggleUserActivation(selectedUser.id)}
            >
              {selectedUser?.isActive ? "Deactivate" : "Activate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 
import { Metadata } from "next";
import ProfileForm from "@/components/profile/ProfileForm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Profile | MyApp",
  description: "Manage your profile settings",
};

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  
  // Redirect to login if not authenticated
  if (!session) {
    redirect("/auth/login");
  }
  
  return (
    <div className="flex justify-center items-start py-10">
      <div className="w-full max-w-3xl px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Profile Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and profile information
          </p>
        </div>
        
        <ProfileForm />
      </div>
    </div>
  );
} 
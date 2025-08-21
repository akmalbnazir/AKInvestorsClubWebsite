import { redirect } from "next/navigation";
import { requireAdmin } from "lib/auth";
import UltraCard from "components/ui/UltraCard";
import AdminPanel from "./AdminPanel";

export default async function AdminPage() {
  const admin = await requireAdmin();
  if (!admin) redirect("/signin");

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <UltraCard>
        <h2 className="text-2xl font-bold mb-4">Admin Panel</h2>
        <p className="text-ak-sub">Manage bulletin, events, and join requests.</p>
      </UltraCard>
      <AdminPanel /> {/* delegate all client stuff here */}
    </div>
  );
}

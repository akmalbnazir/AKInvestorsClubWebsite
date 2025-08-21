import { redirect } from "next/navigation";
import { getSession } from "lib/auth";
import ForumContent from "./ForumContent";

export default async function ForumPage() {
  const s = await getSession();
  if (!s) redirect("/signin");
  return <ForumContent />;
}

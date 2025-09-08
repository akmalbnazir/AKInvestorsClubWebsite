import { getSession } from "lib/auth";
import { redirect } from "next/navigation";
import ToolsClient from "./ToolsClient";

export const dynamic = "force-dynamic";

export default async function ToolsPage(){
  const s = await getSession();
  if(!s) redirect("/signin?next=/tools");
  return <ToolsClient />;
}

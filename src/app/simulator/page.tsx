import { getSession } from "lib/auth";
import { redirect } from "next/navigation";
import SimulatorApp from "./SimulatorApp";

export const dynamic = "force-dynamic";

export default async function SimulatorPage(){
  const s = await getSession();
  if(!s) redirect("/signin?next=/simulator");
  return <SimulatorApp />;
}

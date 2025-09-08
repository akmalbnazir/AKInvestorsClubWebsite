import MorphDock from "./MorphDock";
import { getSession } from "lib/auth";

export default async function MorphDockWrapper(){
  const s = await getSession();
  return <MorphDock session={s ? { role: s.user.role } : null} />;
}

import { getSession } from "lib/auth";
import { redirect } from "next/navigation";
import CourseClient from "./CourseClient";
import course from "data/course.json";

export const dynamic = "force-dynamic";

export default async function CoursePage(){
  const s = await getSession();
  if(!s) redirect("/signin?next=/course");
  return <CourseClient course={course} />;
}

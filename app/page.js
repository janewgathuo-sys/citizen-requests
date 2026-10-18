import { redirect } from "next/navigation";

export default function Home() {
  // send everyone to the login page
  redirect("/login");
}
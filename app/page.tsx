import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  const role = session.user.role;
  if (role === "SUPER_ADMIN") {
    redirect("/admin/dashboard");
  } else if (role === "TRANSPORT_MANAGER") {
    redirect("/manager/dashboard");
  } else if (role === "DRIVER") {
    redirect("/driver");
  }

  redirect("/login");
}

import { cookies } from "next/headers";
import { ConvexClientProvider } from "./ConvexClientProvider";

export async function ConvexProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const initialToken = cookieStore.get("better-auth.session_token")?.value;

  return (
    <ConvexClientProvider initialToken={initialToken}>
      {children}
    </ConvexClientProvider>
  );
}

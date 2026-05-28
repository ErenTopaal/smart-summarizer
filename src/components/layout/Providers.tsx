"use client";

import { AuthContext, useAuthProvider } from "@/hooks/useAuth";
import { ToastProvider } from "@/components/ui/Toast";

export default function Providers({ children }: { children: React.ReactNode }) {
  const auth = useAuthProvider();

  return (
    <ToastProvider>
      <AuthContext.Provider value={auth}>
        {children}
      </AuthContext.Provider>
    </ToastProvider>
  );
}

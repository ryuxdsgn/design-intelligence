"use client";

import { useRouter } from "next/navigation";
import { editorBrowserClient } from "@/lib/editor/supabase";
import { Icon } from "./icons";
import { Button } from "./ui";

export function SignOut() {
  const router = useRouter();
  return (
    <Button kind="quiet" onClick={async () => { await editorBrowserClient().auth.signOut(); router.replace("/editor/login"); router.refresh(); }}>
      <Icon name="signOut" />Sign out
    </Button>
  );
}

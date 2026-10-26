import { request, scenario } from "./client";

export type Member = { id: string; name: string; email: string; role: "Owner" | "Admin" | "Member"; status: "active" | "invited" };

const MEMBERS: Member[] = [
  { id: "m1", name: "Ana Ruiz", email: "ana@example.com", role: "Owner", status: "active" },
  { id: "m2", name: "Ben Okoro", email: "ben@example.com", role: "Admin", status: "active" },
  { id: "m3", name: "Chen Wei", email: "chen@example.com", role: "Member", status: "active" },
  { id: "m4", name: "Dana Lind", email: "dana@example.com", role: "Member", status: "invited" },
];

export function getMembers(): Promise<Member[]> {
  return request(() => (scenario() === "empty" ? [] : MEMBERS));
}

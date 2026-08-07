"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  allowLoginAttempt,
  clearLoginAttempts,
  endSession,
  isAdminEnabled,
  isAuthenticated,
  startSession,
  verifyPassword,
} from "@/lib/admin-auth";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import {
  createServer,
  deleteServer,
  updateServer,
  type ServerKind,
} from "@/lib/servers-db";

async function clientKey(): Promise<string> {
  return clientIp(await headers());
}

function back(status?: string): never {
  redirect(status ? `/admin?status=${status}` : "/admin");
}

// Server Actions are reachable by direct POST, so every mutation re-checks
// that the panel is enabled and the caller holds a valid session, and is
// throttled so a leaked session can't be used to hammer the database.
async function requireAdmin(): Promise<void> {
  if (!isAdminEnabled() || !(await isAuthenticated())) {
    redirect("/admin");
  }
  const key = await clientKey();
  if (!rateLimit(`admin:write:${key}`, 60, 60_000).ok) {
    back("throttled");
  }
}

export async function login(formData: FormData): Promise<void> {
  if (!isAdminEnabled()) back("disabled");

  // Counts every attempt, not just the failures, so a flood of guesses is
  // capped regardless of outcome. A correct password clears the counter.
  const key = await clientKey();
  if (!allowLoginAttempt(key)) back("throttled");

  const password = String(formData.get("password") ?? "");
  if (!verifyPassword(password)) back("bad-password");

  clearLoginAttempts(key);
  await startSession();
  back();
}

export async function logout(): Promise<void> {
  await endSession();
  back();
}

function readFields(formData: FormData): { name: string; url: string } | null {
  const name = String(formData.get("name") ?? "").trim();
  const url = String(formData.get("url") ?? "").trim();
  if (!name || !url) return null;
  if (name.length > 200 || url.length > 2000) return null;

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return null;

  return { name, url: parsed.toString() };
}

/** The list a form is acting on. Anything unrecognised is treated as
 *  unofficial, so a tampered field can't sneak an entry onto the official
 *  list. */
function readKind(formData: FormData): ServerKind {
  return formData.get("kind") === "official" ? "official" : "unofficial";
}

export async function addServer(formData: FormData): Promise<void> {
  await requireAdmin();

  const fields = readFields(formData);
  if (!fields) back("invalid");

  try {
    await createServer(fields.name, fields.url, readKind(formData));
  } catch (error) {
    console.error("Failed to add server", error);
    back("db-error");
  }

  revalidatePath("/admin");
  back("added");
}

export async function editServer(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const fields = readFields(formData);
  if (!id || !fields) back("invalid");

  try {
    await updateServer(id, fields.name, fields.url);
  } catch (error) {
    console.error("Failed to update server", error);
    back("db-error");
  }

  revalidatePath("/admin");
  back("saved");
}

export async function removeServer(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  if (!id) back("invalid");

  try {
    await deleteServer(id);
  } catch (error) {
    console.error("Failed to delete server", error);
    back("db-error");
  }

  revalidatePath("/admin");
  back("deleted");
}

import type { Metadata } from "next";
import { isAdminEnabled, isAuthenticated } from "@/lib/admin-auth";
import { isDatabaseConfigured, listServers, type OfficialServer } from "@/lib/servers-db";
import { addServer, editServer, login, logout, removeServer } from "./actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin – ClipSpace",
  robots: { index: false, follow: false },
};

const STATUS_MESSAGES: Record<string, { text: string; tone: "ok" | "bad" }> = {
  added: { text: "Server added.", tone: "ok" },
  saved: { text: "Changes saved.", tone: "ok" },
  deleted: { text: "Server removed.", tone: "ok" },
  "bad-password": { text: "Wrong password.", tone: "bad" },
  throttled: { text: "Too many attempts. Try again later.", tone: "bad" },
  invalid: { text: "Name is required and the URL must be a valid http(s) address.", tone: "bad" },
  "db-error": { text: "Database error — the change was not saved.", tone: "bad" },
  disabled: { text: "The admin panel is disabled.", tone: "bad" },
};

const inputClass =
  "w-full rounded-lg border border-line bg-bg px-3 py-2 text-sm text-cream outline-none placeholder:text-muted focus:border-brass";
const buttonClass =
  "rounded-lg bg-brass px-4 py-2 text-sm font-semibold text-bg transition-colors hover:bg-brass-soft";
const ghostButtonClass =
  "rounded-lg border border-line px-4 py-2 text-sm font-semibold text-muted transition-colors hover:border-brass hover:text-cream";

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
      <h1 className="font-display text-3xl font-bold">Admin</h1>
      <p className="mt-2 text-sm text-muted">Official server list</p>
      <div className="mt-8">{children}</div>
    </main>
  );
}

function StatusBanner({ status }: { status?: string }) {
  const message = status ? STATUS_MESSAGES[status] : undefined;
  if (!message) return null;
  return (
    <p
      role="status"
      className={`mb-6 rounded-lg border px-4 py-3 text-sm ${
        message.tone === "ok"
          ? "border-brass/40 bg-surface text-cream"
          : "border-red-500/40 bg-surface text-red-300"
      }`}
    >
      {message.text}
    </p>
  );
}

function ServerRow({ server }: { server: OfficialServer }) {
  return (
    <li className="rounded-xl border border-line bg-surface p-4">
      <form className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input type="hidden" name="id" value={server.id} />
        <label className="sr-only" htmlFor={`name-${server.id}`}>
          Server name
        </label>
        <input
          id={`name-${server.id}`}
          name="name"
          defaultValue={server.name}
          required
          maxLength={200}
          className={`${inputClass} sm:flex-1`}
        />
        <label className="sr-only" htmlFor={`url-${server.id}`}>
          Server URL
        </label>
        <input
          id={`url-${server.id}`}
          name="url"
          type="url"
          defaultValue={server.url}
          required
          maxLength={2000}
          className={`${inputClass} sm:flex-[2]`}
        />
        <div className="flex gap-2">
          <button type="submit" formAction={editServer} className={buttonClass}>
            Save
          </button>
          <button
            type="submit"
            formAction={removeServer}
            className="rounded-lg border border-red-500/40 px-4 py-2 text-sm font-semibold text-red-300 transition-colors hover:bg-red-500/10"
          >
            Delete
          </button>
        </div>
      </form>
    </li>
  );
}

async function ServerList() {
  if (!isDatabaseConfigured()) {
    return (
      <p className="rounded-xl border border-line bg-surface p-6 text-sm text-muted">
        <code className="text-cream">DATABASE_URL</code> is not set, so the server
        list cannot be loaded.
      </p>
    );
  }

  let servers: OfficialServer[];
  try {
    servers = await listServers();
  } catch (error) {
    console.error("Failed to load servers for admin panel", error);
    return (
      <p className="rounded-xl border border-red-500/40 bg-surface p-6 text-sm text-red-300">
        Could not reach the database.
      </p>
    );
  }

  if (servers.length === 0) {
    return (
      <p className="rounded-xl border border-line bg-surface p-6 text-sm text-muted">
        No servers yet. Add the first one above.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {servers.map((server) => (
        <ServerRow key={server.id} server={server} />
      ))}
    </ul>
  );
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;

  if (!isAdminEnabled()) {
    return (
      <Shell>
        <p className="rounded-xl border border-line bg-surface p-6 text-sm text-muted">
          The admin panel is disabled. Set{" "}
          <code className="text-cream">ADMIN_PASSWORD</code> in the environment to
          turn it on.
        </p>
      </Shell>
    );
  }

  if (!(await isAuthenticated())) {
    return (
      <Shell>
        <StatusBanner status={status} />
        <form
          action={login}
          className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-6 sm:flex-row"
        >
          <label className="sr-only" htmlFor="password">
            Admin password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            placeholder="Admin password"
            className={`${inputClass} sm:flex-1`}
          />
          <button type="submit" className={buttonClass}>
            Sign in
          </button>
        </form>
      </Shell>
    );
  }

  return (
    <Shell>
      <StatusBanner status={status} />

      <section>
        <h2 className="font-display text-lg font-semibold">Add a server</h2>
        <form
          action={addServer}
          className="mt-3 flex flex-col gap-3 rounded-xl border border-line bg-surface p-4 sm:flex-row sm:items-center"
        >
          <label className="sr-only" htmlFor="new-name">
            Server name
          </label>
          <input
            id="new-name"
            name="name"
            required
            maxLength={200}
            placeholder="Name"
            className={`${inputClass} sm:flex-1`}
          />
          <label className="sr-only" htmlFor="new-url">
            Server URL
          </label>
          <input
            id="new-url"
            name="url"
            type="url"
            required
            maxLength={2000}
            placeholder="https://example.org"
            className={`${inputClass} sm:flex-[2]`}
          />
          <button type="submit" className={buttonClass}>
            Add
          </button>
        </form>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-lg font-semibold">Servers</h2>
        <div className="mt-3">
          <ServerList />
        </div>
      </section>

      <form action={logout} className="mt-10">
        <button type="submit" className={ghostButtonClass}>
          Sign out
        </button>
      </form>
    </Shell>
  );
}

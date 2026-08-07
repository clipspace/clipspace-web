import postgres from "postgres";

/** Which list an entry belongs to. Both are edited from /admin. */
export type ServerKind = "official" | "unofficial";

export type ServerEntry = {
  id: string;
  name: string;
  url: string;
  createdAt: string;
};

type Row = {
  id: string;
  name: string;
  url: string;
  created_at: Date;
};

// The connection is created lazily so that a build (or a page that never
// touches the database) doesn't fall over when DATABASE_URL is absent.
let client: postgres.Sql | null = null;
let schemaReady: Promise<void> | null = null;

export class DatabaseNotConfiguredError extends Error {
  constructor() {
    super("DATABASE_URL is not set");
    this.name = "DatabaseNotConfiguredError";
  }
}

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}

function sql(): postgres.Sql {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) throw new DatabaseNotConfiguredError();
  if (!client) {
    client = postgres(url, {
      // Supabase's transaction pooler (port 6543) does not support prepared
      // statements; disabling them keeps both pooler modes working.
      prepare: false,
      max: 1,
      idle_timeout: 20,
      connect_timeout: 10,
    });
  }
  return client;
}

// Runs once per process — cheap enough to keep the schema self-installing
// instead of shipping a migration runner for a single table.
function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = (async () => {
      const db = sql();
      await db`
        create table if not exists official_servers (
          id uuid primary key default gen_random_uuid(),
          name text not null,
          url text not null,
          created_at timestamptz not null default now()
        )
      `;
      // Added after the table shipped, so it has to be a separate migration
      // rather than part of the create above. Existing rows predate the
      // unofficial list and are all official, which the default covers.
      await db`
        alter table official_servers
        add column if not exists official boolean not null default true
      `;
    })().catch((err) => {
      // Don't cache a failure: the next request should retry.
      schemaReady = null;
      throw err;
    });
  }
  return schemaReady;
}

function toServer(row: Row): ServerEntry {
  return {
    id: row.id,
    name: row.name,
    url: row.url,
    createdAt: row.created_at.toISOString(),
  };
}

export async function listServers(kind: ServerKind): Promise<ServerEntry[]> {
  await ensureSchema();
  const db = sql();
  const rows = await db<Row[]>`
    select id, name, url, created_at
    from official_servers
    where official = ${kind === "official"}
    order by created_at asc
  `;
  return rows.map(toServer);
}

export async function createServer(
  name: string,
  url: string,
  kind: ServerKind,
): Promise<ServerEntry> {
  await ensureSchema();
  const db = sql();
  const [row] = await db<Row[]>`
    insert into official_servers (name, url, official)
    values (${name}, ${url}, ${kind === "official"})
    returning id, name, url, created_at
  `;
  return toServer(row);
}

export async function updateServer(
  id: string,
  name: string,
  url: string,
): Promise<void> {
  await ensureSchema();
  const db = sql();
  await db`
    update official_servers
    set name = ${name}, url = ${url}
    where id = ${id}
  `;
}

export async function deleteServer(id: string): Promise<void> {
  await ensureSchema();
  const db = sql();
  await db`delete from official_servers where id = ${id}`;
}

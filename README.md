# Local dev notes

## Prisma migration drift

If you have already applied the initial migration locally and then edited that migration file in place, Prisma may detect the old schema checksum and report drift on the next `prisma migrate dev` run. In a disposable local setup, the safe reset is:

```bash
docker compose down -v
```

Then run the normal migration flow again:

```bash
docker compose up --build
# or from the backend service
pnpm --dir backend exec prisma migrate dev
```

This clears the old Postgres volume so the database matches the current migration history and the updated `timestamptz` schema.

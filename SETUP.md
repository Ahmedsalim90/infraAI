# Setup (fresh database)

The README's "Getting started" steps are correct for installing dependencies, but
they leave out three steps that are required before the app actually works. Skipping
them is why project creation (and possibly other actions) return a 500 error on a
fresh setup.

Run these **in order**, from `Backend/`, after installing dependencies and creating
your `.env`:

```bash
python create_tables.py   # creates all tables directly from the models
python seed_roles.py      # seeds the 5 required roles: admin, user, owner, editor, viewer
flask db stamp head       # tells Alembic the schema is already up to date, so future
                           # `flask db upgrade` calls only apply NEW migrations
```

## Why this is necessary

- The Alembic migration history (`Backend/migrations/versions/`) does not start from
  an empty database — its first migration already assumes `users`, `projects`, and
  `roles` exist. Running `flask db upgrade` alone on a brand-new database fails with
  `relation "projects" does not exist`.
- `create_tables.py` builds the full schema directly from the SQLAlchemy models
  (`db.create_all()`), which is what actually needs to run first on a new database.
- Project creation (and any endpoint that assigns a role) queries the `roles` table
  and expects `owner`/`editor`/`viewer`/`admin` to already exist. Nothing creates
  these automatically — `seed_roles.py` has to be run once, manually.
- Stamping `head` after `create_tables.py` tells Alembic "the schema is current,"
  so it won't try to re-run migrations for tables that already exist.

## Also required (not related to the above)

- **PostgreSQL with the `pgvector` extension** — needed for `retrieve_context.py`.
  Enable it once per database: `CREATE EXTENSION IF NOT EXISTS vector;`
- **Redis**, running and reachable at the `REDIS_URL` in your `.env`.
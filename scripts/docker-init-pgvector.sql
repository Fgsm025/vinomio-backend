-- Runs once on first Postgres init (empty volume). Migrations also call this; safe if redundant.
CREATE EXTENSION IF NOT EXISTS vector;

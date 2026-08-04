"""
Ingest script for InfraAI Document Embedding pipeline.

What this does:
1. Reads reference_docs.json (title, content, source for each doc)
2. Calls OpenAI's embedding API to turn each doc's content into a vector
3. Inserts each doc + its embedding into the `document_embedding` table in Postgres

Setup before running:
  pip install openai psycopg2-binary python-dotenv

Create a .env file next to this script with:
  OPENROUTER_API_KEY=sk-or-...
  DB_HOST=localhost
  DB_PORT=5432
  DB_NAME=postgres
  DB_USER=postgres
  DB_PASSWORD=your_password_here

NOTE: This version calls OpenRouter's OpenAI-compatible embeddings endpoint
instead of OpenAI directly. Only the base_url + API key + model name differ.
"""

import json
import os
import time

from dotenv import load_dotenv
from openai import OpenAI
import psycopg2

load_dotenv()

# ---- Config ----
# OpenRouter mirrors OpenAI's text-embedding-3-small (1536 dimensions) — matches the table schema
EMBEDDING_MODEL = "openai/text-embedding-3-small"
JSON_PATH = "reference_docs.json"
BATCH_SLEEP_SECONDS = 0.2  # small delay to be gentle on rate limits

# ---- Clients ----
# Same OpenAI SDK, just pointed at OpenRouter's endpoint with your OpenRouter key
client = OpenAI(
    api_key=os.environ["OPENROUTER_API_KEY"],
    base_url="https://openrouter.ai/api/v1",
)

conn = psycopg2.connect(
    host=os.environ.get("DB_HOST", "localhost"),
    port=os.environ.get("DB_PORT", "5432"),
    dbname=os.environ.get("DB_NAME", "postgres"),
    user=os.environ.get("DB_USER", "postgres"),
    password=os.environ["DB_PASSWORD"],
)
cur = conn.cursor()


def get_embedding(text: str):
    """Call OpenAI's embedding API for a single piece of text."""
    response = client.embeddings.create(
        model=EMBEDDING_MODEL,
        input=text,
    )
    return response.data[0].embedding


def main():
    with open(JSON_PATH, "r") as f:
        docs = json.load(f)

    print(f"Loaded {len(docs)} docs from {JSON_PATH}")

    inserted = 0
    for i, doc in enumerate(docs, start=1):
        title = doc["title"]
        content = doc["content"]
        source = doc.get("source", "")

        try:
            embedding = get_embedding(content)
        except Exception as e:
            print(f"[{i}/{len(docs)}] FAILED to embed '{title}': {e}")
            continue

        cur.execute(
            """
            INSERT INTO document_embedding (title, content, source, embedding)
            VALUES (%s, %s, %s, %s)
            """,
            (title, content, source, embedding),
        )
        conn.commit()
        inserted += 1
        print(f"[{i}/{len(docs)}] Inserted: {title}")

        time.sleep(BATCH_SLEEP_SECONDS)

    print(f"\nDone. Inserted {inserted}/{len(docs)} documents.")
    cur.close()
    conn.close()


if __name__ == "__main__":
    main()

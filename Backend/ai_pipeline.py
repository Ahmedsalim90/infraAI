import os
import json
from openai import OpenAI
from retrieve_context import retrieve_context
from validate_design import validate_design
DESIGN_SCHEMA_EXAMPLE = {
    "nodes": [
        {"id": "1", "type": "ec2", "label": "Web Server"},
        {"id": "2", "type": "database", "label": "Postgres DB"}
    ],
    "edges": [
        {"from": "1", "to": "2", "label": "connects to"}
    ]
}

SYSTEM_PROMPT = f"""You are an infrastructure design assistant. Given a user's
plain-language description of a system, generate a JSON object describing
the infrastructure diagram.

You MUST respond with valid JSON matching exactly this structure:
{json.dumps(DESIGN_SCHEMA_EXAMPLE, indent=2)}

Rules:
- "nodes" is a list of infrastructure components (ec2, database, s3, etc.)
- "edges" describe connections between node ids
- Do not include any text outside the JSON object.
"""

def generate_design(prompt, query_embedding=None):
    """
    Takes a user's plain-language prompt, retrieves relevant reference
    context via retrieve_context(), and returns a structured design dict
    matching DESIGN_SCHEMA_EXAMPLE.

    query_embedding: the embedded version of `prompt`. In the real
    pipeline this comes from embedding `prompt` with the same model
    Miranda used for ingestion. For now, since that's not wired up yet,
    this can be passed in manually for testing.
    """
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    context_text = ""
    if query_embedding:
        retrieved = retrieve_context(query_embedding, top_k=3)
        context_text = "\n".join([r["content"] for r in retrieved])

    full_prompt = prompt
    if context_text:
        full_prompt = f"Relevant reference info:\n{context_text}\n\nUser request:\n{prompt}"

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": full_prompt}
        ]
    )

    raw_output = response.choices[0].message.content
    design = json.loads(raw_output)
    is_valid, error = validate_design(design)
    if not is_valid:
        raise ValueError(f"AI generated an invalid design: {error}")
    return design

if __name__ == "__main__":
    fake_api_response = json.dumps(DESIGN_SCHEMA_EXAMPLE)
    parsed = json.loads(fake_api_response)
    print("Parsed design:", parsed)
    assert "nodes" in parsed and "edges" in parsed
    print("Structure check passed.")

    # Prove retrieve_context() is correctly wired and reachable from here
    test_results = retrieve_context([1, 0, 0], top_k=1)
    print("\nretrieve_context() reachable, top result:", test_results[0]["content"])
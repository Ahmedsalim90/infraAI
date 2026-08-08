import os
import json
from datetime import datetime
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()


def _generate_ai_explanation(prompt: str, design: dict) -> str:
    """
    Asks the AI to explain, in plain English, what kind of architecture
    this is and why it fits the user's original request — considering
    scalability, reliability, and cost. Returns a few paragraphs of
    markdown-formatted prose (not JSON — this is free-form writing).
    """
    client = OpenAI(
        api_key=os.getenv("OPENROUTER_API_KEY"),
        base_url="https://openrouter.ai/api/v1"
    )

    system_prompt = """You are a senior infrastructure architect writing a short
design-rationale section for a technical document. Given a user's original
request and the resulting architecture (as JSON, with nodes and edges),
write a clear explanation covering:

1. What TYPE of architecture this is (e.g. "load-balanced multi-tier web
   architecture", "event-driven microservices", "simple monolith with a
   managed database", etc — name it accurately based on the actual nodes).
2. WHY this architecture fits what the user asked for.
3. Key trade-offs or considerations (scalability, cost, reliability) —
   be honest about limitations, not just positives.

Write 2-4 short paragraphs in plain markdown (no headers, those are
added separately). Be specific to the actual components given — do not
give generic advice that could apply to any architecture. Keep it
readable for someone who is not deeply technical."""

    user_content = f"""User's original request:
{prompt}

Generated architecture (JSON):
{json.dumps(design, indent=2)}"""

    response = client.chat.completions.create(
        model="openai/gpt-4o-mini",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_content}
        ]
    )

    return response.choices[0].message.content.strip()


def generate_design_doc(project_name: str, prompt: str, design: dict, version: int) -> str:
    """
    Turns a design dict ({"nodes": [...], "edges": [...]}) into a
    readable markdown document: an AI-written explanation of WHY this
    architecture fits the request, plus a reliable, deterministic list
    of the actual components and connections (so the facts are always
    accurate even though the explanation above them is AI-generated).
    """
    nodes = design.get("nodes", [])
    edges = design.get("edges", [])
    node_labels = {n["id"]: n.get("label", n["id"]) for n in nodes}

    lines = []
    lines.append(f"# {project_name} — Architecture Documentation")
    lines.append("")
    lines.append(f"*Generated: {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')} · Design version {version}*")
    lines.append("")

    if prompt:
        lines.append("## Original Request")
        lines.append(f"> {prompt}")
        lines.append("")

    lines.append("## Architecture Explanation")
    lines.append("")
    try:
        explanation = _generate_ai_explanation(prompt, design)
        lines.append(explanation)
    except Exception as e:
        lines.append(f"_Explanation could not be generated automatically: {e}_")
    lines.append("")

    lines.append("## Components")
    lines.append("")
    if not nodes:
        lines.append("_No components in this design._")
    for node in nodes:
        label = node.get("label", node.get("id"))
        node_type = node.get("type", "unknown")
        lines.append(f"- **{label}** (`{node_type}`)")
    lines.append("")

    lines.append("## Connections")
    lines.append("")
    if not edges:
        lines.append("_No connections in this design._")
    for edge in edges:
        from_label = node_labels.get(edge.get("from"), edge.get("from"))
        to_label = node_labels.get(edge.get("to"), edge.get("to"))
        relationship = edge.get("label", "connects to")
        lines.append(f"- **{from_label}** {relationship} **{to_label}**")

    lines.append("")
    lines.append("---")
    lines.append("*This document was generated automatically by InfraAI.*")

    return "\n".join(lines)


if __name__ == "__main__":
    fake_design = {
        "nodes": [
            {"id": "1", "type": "load_balancer", "label": "Load Balancer"},
            {"id": "2", "type": "ec2", "label": "Web Server 1"},
            {"id": "3", "type": "ec2", "label": "Web Server 2"},
            {"id": "4", "type": "database", "label": "Database"},
        ],
        "edges": [
            {"from": "1", "to": "2", "label": "routes traffic to"},
            {"from": "1", "to": "3", "label": "routes traffic to"},
            {"from": "2", "to": "4", "label": "connects to"},
            {"from": "3", "to": "4", "label": "connects to"},
        ]
    }

    print("--- Testing real AI explanation call ---\n")
    doc = generate_design_doc(
        "Test Project",
        "A simple web app with a load balancer, two web servers, and a database",
        fake_design,
        version=1
    )
    print(doc)
    assert "# Test Project" in doc
    assert "Architecture Explanation" in doc
    print("\n\nStandalone test passed.")
"""
Groq LLM Service
Builds prompts and calls Groq API using qwen/qwen3-32b.
"""

import os
import json
import re
from groq import Groq
from dotenv import load_dotenv
from typing import List, Dict

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))
MODEL = "qwen/qwen3-32b"

SYSTEM_PROMPT = """You are a professional meeting preparation assistant.

Use recalled memories to:
1. Summarize contact history.
2. Identify recurring concerns.
3. Highlight missed commitments.
4. Suggest next actions.
5. Generate meeting preparation notes.

Always prioritize memory over assumptions. Be concise, specific, and actionable."""


def generate_brief(
    contact_name: str,
    company: str,
    role: str,
    memory_context: str,
    health_score: int,
    recurring_themes: List[str],
    hindsight_enabled: bool = False,
) -> Dict:
    memory_source = "Hindsight AI Memory" if hindsight_enabled else "meeting records"

    prompt = f"""Contact: {contact_name}
Company: {company}
Role: {role}
Relationship Health Score: {health_score}/100
Recurring Themes Detected: {", ".join(recurring_themes) if recurring_themes else "None yet"}
Memory Source: {memory_source}

=== RECALLED MEMORIES ===
{memory_context}
=== END MEMORIES ===

Based on the recalled memories above, generate a detailed meeting preparation brief.
Return ONLY a valid JSON object with exactly this structure (no markdown, no explanation):

{{
  "contact_summary": "2-3 sentence summary of who this person is and the relationship history",
  "recurring_concerns": ["concern1", "concern2", "concern3"],
  "pending_tasks": ["task1", "task2"],
  "suggested_talking_points": ["point1", "point2", "point3", "point4"],
  "recommended_actions": ["action1", "action2", "action3"],
  "risk_flag": "brief description of the main risk or empty string",
  "recommendation": "one clear strategic recommendation"
}}"""

    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt},
        ],
        temperature=0.3,
        max_tokens=1500,
    )

    raw = response.choices[0].message.content.strip()
    raw = re.sub(r"<think>.*?</think>", "", raw, flags=re.DOTALL).strip()

    json_match = re.search(r"\{.*\}", raw, re.DOTALL)
    if json_match:
        try:
            return json.loads(json_match.group())
        except json.JSONDecodeError:
            pass

    return {
        "contact_summary": raw[:500] if raw else "Unable to generate summary.",
        "recurring_concerns": recurring_themes[:3],
        "pending_tasks": [],
        "suggested_talking_points": ["Review previous concerns", "Address open commitments"],
        "recommended_actions": ["Follow up on previous discussion points"],
        "risk_flag": "",
        "recommendation": "Review all previous meeting notes before proceeding.",
    }


def generate_insights(contact_name: str, question: str, memory_context: str) -> str:
    prompt = f"""Contact: {contact_name}

=== RECALLED MEMORIES ===
{memory_context}
=== END MEMORIES ===

Question: {question}

Based only on the recalled memories, answer the question with specific patterns,
recurring topics, behavioral signals, and strategic recommendations.
Be direct and specific. Reference actual data from the memories.
Do not invent information not present in the memories."""

    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt},
        ],
        temperature=0.4,
        max_tokens=800,
    )

    content = response.choices[0].message.content.strip()
    content = re.sub(r"<think>.*?</think>", "", content, flags=re.DOTALL).strip()
    return content

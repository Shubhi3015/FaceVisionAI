"""
General skincare guidance chat.

If OPENAI_API_KEY or SKINCARE_CHAT_API_KEY is set, replies are generated via the
OpenAI Chat Completions API. Otherwise a built-in educational responder is used.
"""

from __future__ import annotations

import json
import os
import re
import urllib.error
import urllib.request
from typing import Literal

from pydantic import BaseModel, Field

DISCLAIMER = (
    "\n\n— *This is general skincare information, not medical advice. "
    "See a dermatologist for diagnosis, prescriptions, or concerning changes.*"
)

SYSTEM_PROMPT = """You are a friendly skincare education assistant for the FaceVision app.
You give concise, practical general guidance about routines, sun protection, common concerns
(acne, dryness, sensitivity, pigmentation, aging), and when to seek professional care.

Rules:
- Do not diagnose the user or their photos. Do not claim to replace a dermatologist.
- Avoid recommending specific prescription drugs unless the user already mentions one from their doctor.
- Prefer evidence-informed habits (cleanser, moisturizer, SPF, gentle introduction of actives).
- Keep answers readable: short paragraphs or bullet points when listing steps.
- If the user asks something unrelated to skin or health, politely redirect to skincare topics."""


class ChatMessageIn(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(..., max_length=8000)


class SkincareChatRequest(BaseModel):
    messages: list[ChatMessageIn] = Field(..., min_length=1, max_length=24)


class SkincareChatResponse(BaseModel):
    reply: str


def _last_user_text(messages: list[ChatMessageIn]) -> str:
    for m in reversed(messages):
        if m.role == "user":
            return m.content.strip()
    return ""


def _fallback_reply(text: str) -> str:
    t = text.lower()
    if not t:
        return (
            "Ask me anything about **general skincare**—for example: building a simple routine, "
            "how to use sunscreen, tips for dry or sensitive skin, or how to introduce actives slowly."
        ) + DISCLAIMER

    def out(body: str) -> str:
        return body.strip() + DISCLAIMER

    if any(k in t for k in ("routine", "steps", "am pm", "morning", "night", "order")):
        return out(
            "**Simple baseline routine**\n"
            "1. **AM:** gentle cleanser (if needed) → moisturizer → **SPF 30+** every day.\n"
            "2. **PM:** cleanser → moisturizer. Add one active at a time only after 2–4 weeks if skin tolerates it.\n"
            "3. Patch-test new products and increase frequency gradually."
        )

    if any(k in t for k in ("sun", "spf", "uv", "sunscreen")):
        return out(
            "**Sun protection**\n"
            "- Use a broad-spectrum **SPF 30+** daily on exposed skin, including cloudy days.\n"
            "- Apply enough (often ~1/4 tsp for face) and reapply every 2 hours if outdoors or sweating.\n"
            "- SPF helps with pigmentation, redness, and photoaging—not only burns."
        )

    if any(k in t for k in ("acne", "pimple", "breakout", "blemish")):
        return out(
            "**General acne habits (not a diagnosis)**\n"
            "- Prefer **non-comedogenic** moisturizer; avoid harsh scrubbing.\n"
            "- Over-the-counter options people often discuss with a pharmacist or derm include **benzoyl peroxide** "
            "or **salicylic acid**—start low and slow; they can irritate.\n"
            "- If acne is painful, cystic, or scarring, **see a dermatologist** for tailored treatment."
        )

    if any(k in t for k in ("dry", "flaky", "dehydrat")):
        return out(
            "**Dry or flaky skin**\n"
            "- Use a **gentle, fragrance-free** cleanser; lukewarm water; pat dry.\n"
            "- Apply **moisturizer** on damp skin; consider ingredients like **ceramides** or **glycerin**.\n"
            "- Reduce strong actives until the barrier feels comfortable; very dry or cracked skin warrants medical advice."
        )

    if any(k in t for k in ("sensitive", "sting", "burn", "reactive", "redness")):
        return out(
            "**Sensitive or reactive skin**\n"
            "- Fewer products, **fragrance-free**, introduce one new product at a time.\n"
            "- If many products sting, focus on **repair** (gentle cleanse + moisturizer + SPF) before strong actives.\n"
            "- Persistent burning, swelling, or rash: **seek medical care**."
        )

    if any(k in t for k in ("pigment", "dark spot", "melasma", "hyperpigmentation", "uneven")):
        return out(
            "**Pigmentation (general info)**\n"
            "- **Daily SPF** is the foundation; UV can worsen many pigment issues.\n"
            "- Ingredients often discussed for uneven tone include **vitamin C**, **niacinamide**, "
            "and **retinoids**—these vary by skin type and should be introduced carefully.\n"
            "- Melasma and stubborn spots often need **professional treatment**; a dermatologist can personalize options."
        )

    if any(k in t for k in ("retinol", "retinoid", "tretinoin", "vitamin a")):
        return out(
            "**Retinoids (general)**\n"
            "- Start **1–2 nights per week**, pea-sized amount, then slowly increase if tolerated.\n"
            "- Use **moisturizer** (“sandwich” method can reduce irritation).\n"
            "- **SPF** is essential; retinoids increase sun sensitivity.\n"
            "- **Pregnancy/breastfeeding:** avoid prescription retinoids unless a clinician says otherwise."
        )

    if any(k in t for k in ("vitamin c", "vit c", "ascorbic")):
        return out(
            "**Vitamin C (general)**\n"
            "- Often used in the **AM** under SPF for antioxidant support; formulas vary (L-ascorbic acid vs derivatives).\n"
            "- Can irritate sensitive skin; patch test and start a few times weekly.\n"
            "- Store per product instructions; some serums oxidize over time."
        )

    if any(k in t for k in ("exfoliat", "aha", "bha", "acid peel")):
        return out(
            "**Exfoliation**\n"
            "- Chemical exfoliants (**AHA/BHA**) can help texture for some people but **overuse** damages the barrier.\n"
            "- Start **once weekly**, never stack multiple strong acids the same night without guidance.\n"
            "- Stop and simplify if you get stinging, peeling, or persistent redness."
        )

    if any(k in t for k in ("anti-aging", "anti aging", "wrinkle", "fine line", "collagen")):
        return out(
            "**Healthy-aging habits**\n"
            "- **SPF daily** is the most evidence-backed step for visible aging.\n"
            "- **Retinoids** (when appropriate) and **consistent moisturization** help many people over months.\n"
            "- Lifestyle: sleep, hydration, and not smoking support skin health broadly."
        )

    if any(k in t for k in ("dermatologist", "doctor", "when should i see")):
        return out(
            "**When to see a dermatologist**\n"
            "- Rapidly changing moles, painful or widespread rashes, infection signs.\n"
            "- Severe acne, scarring acne, or acne not improving with OTC care.\n"
            "- Suspicion of **rosacea**, **eczema**, **psoriasis**, or **melasma**—accurate diagnosis matters."
        )

    return out(
        "Thanks for your question. For **general skincare**, a solid foundation is: "
        "**gentle cleansing**, **daily moisturizer**, and **broad-spectrum SPF 30+**. "
        "Introduce **one active at a time** (e.g. vitamin C, niacinamide, or a retinoid) and watch how your skin responds. "
        "Tell me if you want help with **acne**, **dryness**, **sensitivity**, **pigmentation**, or building an **AM/PM routine**."
    )


def _openai_reply(messages: list[ChatMessageIn]) -> str | None:
    api_key = os.environ.get("OPENAI_API_KEY") or os.environ.get("SKINCARE_CHAT_API_KEY")
    if not api_key or not api_key.strip():
        return None

    model = os.environ.get("SKINCARE_CHAT_MODEL", "gpt-4o-mini")
    url = os.environ.get("SKINCARE_CHAT_API_URL", "https://api.openai.com/v1/chat/completions")

    openai_messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    for m in messages:
        openai_messages.append({"role": m.role, "content": m.content})

    payload = {
        "model": model,
        "messages": openai_messages,
        "temperature": 0.65,
        "max_tokens": 900,
    }

    body = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=body,
        method="POST",
        headers={
            "Authorization": f"Bearer {api_key.strip()}",
            "Content-Type": "application/json",
        },
    )

    try:
        with urllib.request.urlopen(req, timeout=90) as resp:
            raw = json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        err_body = e.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"Chat API HTTP {e.code}: {err_body[:500]}") from e
    except Exception as exc:
        raise RuntimeError(f"Chat API request failed: {exc}") from exc

    try:
        choice = raw["choices"][0]["message"]["content"]
        if isinstance(choice, str) and choice.strip():
            return choice.strip()
    except (KeyError, IndexError, TypeError):
        pass
    return None


def generate_skincare_reply(messages: list[ChatMessageIn]) -> str:
    """Return assistant text; uses OpenAI when configured, else built-in guidance."""
    try:
        llm = _openai_reply(messages)
        if llm:
            # Ensure a short disclaimer is always present for LLM output
            if "not medical" not in llm.lower() and "dermatologist" not in llm.lower():
                return llm + "\n\n— *General information only; consult a dermatologist for medical concerns.*"
            return llm
    except RuntimeError:
        pass

    user_text = _last_user_text(messages)
    return _fallback_reply(user_text)


def sanitize_reply(text: str) -> str:
    """Strip control chars and bound length."""
    text = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f]", "", text)
    if len(text) > 12000:
        text = text[:12000] + "…"
    return text

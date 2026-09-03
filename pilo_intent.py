"""Rule-based CRM intent parser — Python port of web/lib/demoIntent.ts."""


def detect_demo_action(input_text: str) -> str:
    """Map a natural-language goal to a CRM action name."""
    text = input_text.lower()

    if "send" in text and "email" in text:
        return "send_email"
    if "update" in text and "email" in text:
        return "update_email"
    if "delete" in text:
        return "delete_lead"
    if "create" in text or "add" in text:
        return "create_lead"
    if "get" in text or "show" in text or "list" in text:
        return "get_leads"

    return "unknown"

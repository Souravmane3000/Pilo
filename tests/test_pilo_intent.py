"""Intent parser tests. One case is expected to fail until negation is handled."""

from pilo_intent import detect_demo_action


def test_send_email_goal():
    assert detect_demo_action("Send a welcome email to jane@acme.com") == "send_email"


def test_true_delete_goal():
    assert detect_demo_action("Delete the lead for jane@acme.com") == "delete_lead"


def test_negated_delete_is_not_classified_as_delete_lead():
    """'Do not delete' is not a delete intent. Today the parser is too greedy."""
    goal = "Do not delete this lead"
    assert detect_demo_action(goal) != "delete_lead"
    assert detect_demo_action(goal) == "unknown"

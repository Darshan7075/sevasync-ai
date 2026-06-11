"""Unit tests for ai_engine.py – urgency calculation, chat responses,
duplicate detection, and volunteer matching."""

import os
import sys
import types
import pytest

sys.path.insert(0, os.path.dirname(__file__))

# Force local fallback by unsetting any API key before import
os.environ.pop("GEMINI_API_KEY", None)

import ai_engine
from ai_engine import AIEngine


# ---------------------------------------------------------------------------
# calculate_urgency  (local fallback path)
# ---------------------------------------------------------------------------
class TestCalculateUrgency:
    """Test the keyword + scale-based fallback urgency logic."""

    def test_high_urgency_with_critical_keyword_and_large_scale(self):
        level, score, explanation = AIEngine.calculate_urgency(
            "Emergency! People trapped in a building fire.", 100
        )
        assert level == "High"
        assert score >= 8
        assert "Critical keywords detected" in explanation

    def test_high_urgency_multiple_keywords(self):
        level, score, _ = AIEngine.calculate_urgency(
            "Critical blood shortage, accident victims dying", 5
        )
        assert level == "High"
        assert score >= 8

    def test_medium_urgency_with_moderate_keywords(self):
        level, score, explanation = AIEngine.calculate_urgency(
            "Food shortage in the community.", 15
        )
        assert level == "Medium"
        assert 5 <= score < 8

    def test_low_urgency_no_keywords_small_scale(self):
        level, score, _ = AIEngine.calculate_urgency(
            "General community meeting scheduled.", 3
        )
        assert level == "Low"
        assert score < 5

    def test_people_affected_above_50_adds_score(self):
        level, score, explanation = AIEngine.calculate_urgency(
            "General community needs assessment.", 60
        )
        # 60 people -> +4 score; no high keywords -> should be at least Medium
        assert score >= 4
        assert "people affected" in explanation.lower() or "impact" in explanation.lower()

    def test_people_affected_between_10_and_50(self):
        _, score, _ = AIEngine.calculate_urgency(
            "Routine check-up event.", 20
        )
        assert score >= 2

    def test_score_capped_at_10(self):
        _, score, _ = AIEngine.calculate_urgency(
            "Emergency critical fire accident blood trapped dying starving", 200
        )
        assert score <= 10

    def test_explanation_contains_reasons(self):
        _, _, explanation = AIEngine.calculate_urgency(
            "Accident on the highway with trapped victims.", 55
        )
        assert "Priority marked because:" in explanation

    def test_no_keywords_no_scale_gives_default_explanation(self):
        _, _, explanation = AIEngine.calculate_urgency(
            "A minor question about registration.", 1
        )
        assert "standard community report metrics" in explanation.lower()

    def test_returns_tuple_of_three(self):
        result = AIEngine.calculate_urgency("test", 0)
        assert isinstance(result, tuple)
        assert len(result) == 3

    def test_water_keyword_medium_priority(self):
        level, score, _ = AIEngine.calculate_urgency(
            "Water supply running low in shelter.", 5
        )
        assert score >= 2
        assert level in ("Low", "Medium")

    def test_medical_keyword(self):
        _, score, _ = AIEngine.calculate_urgency(
            "Medical supplies needed for clinic.", 5
        )
        assert score >= 2


# ---------------------------------------------------------------------------
# chat_response  (local fallback path)
# ---------------------------------------------------------------------------
class TestChatResponse:
    """Test the keyword-based local fallback chatbot."""

    def test_greeting_hi(self):
        reply = AIEngine.chat_response("Hi there")
        assert isinstance(reply, str)
        assert len(reply) > 0

    def test_greeting_hello(self):
        reply = AIEngine.chat_response("Hello")
        assert any(word in reply.lower() for word in ["hello", "namaste", "hi"])

    def test_emergency_keyword(self):
        reply = AIEngine.chat_response("I need urgent help!")
        assert isinstance(reply, str)
        assert len(reply) > 0

    def test_sos_keyword(self):
        reply = AIEngine.chat_response("SOS please help now")
        assert isinstance(reply, str)
        assert len(reply) > 0

    def test_status_keyword(self):
        reply = AIEngine.chat_response("What is the current status?")
        assert isinstance(reply, str)
        assert len(reply) > 0

    def test_supply_keyword_water(self):
        reply = AIEngine.chat_response("We need water urgently")
        assert isinstance(reply, str)
        assert len(reply) > 0

    def test_supply_keyword_food(self):
        reply = AIEngine.chat_response("food supplies running low")
        assert isinstance(reply, str)

    def test_acknowledgment_thanks(self):
        reply = AIEngine.chat_response("Thanks for the update")
        assert isinstance(reply, str)
        assert len(reply) > 0

    def test_default_response_unknown_input(self):
        reply = AIEngine.chat_response("xyzzy random gibberish 12345")
        assert isinstance(reply, str)
        assert len(reply) > 0

    def test_namaste_greeting(self):
        reply = AIEngine.chat_response("Namaste")
        assert isinstance(reply, str)

    def test_madad_emergency(self):
        reply = AIEngine.chat_response("Madad chahiye")
        assert isinstance(reply, str)


# ---------------------------------------------------------------------------
# detect_duplicates
# ---------------------------------------------------------------------------
class TestDetectDuplicates:
    """Test the simple fuzzy duplicate-detection logic."""

    def _make_report(self, description: str):
        """Create a minimal object with a .description attribute."""
        return types.SimpleNamespace(id=1, description=description)

    def test_exact_duplicate(self):
        existing = [self._make_report("Emergency at sector 7 fire outbreak")]
        is_dup, report_id = AIEngine.detect_duplicates(
            "Emergency at sector 7 fire outbreak", existing
        )
        assert is_dup is True
        assert report_id == 1

    def test_high_overlap_is_duplicate(self):
        existing = [self._make_report("fire outbreak emergency sector 7 rescue")]
        is_dup, _ = AIEngine.detect_duplicates(
            "fire outbreak emergency sector 7", existing
        )
        assert is_dup is True

    def test_no_duplicate_different_content(self):
        existing = [self._make_report("Blood donation camp organized in Surat")]
        is_dup, report_id = AIEngine.detect_duplicates(
            "Food shortage in Vadodara shelter", existing
        )
        assert is_dup is False
        assert report_id is None

    def test_empty_existing_list(self):
        is_dup, report_id = AIEngine.detect_duplicates("some text", [])
        assert is_dup is False
        assert report_id is None

    def test_returns_first_match_id(self):
        existing = [
            self._make_report("water shortage critical"),
            self._make_report("water shortage critical alert"),
        ]
        is_dup, report_id = AIEngine.detect_duplicates(
            "water shortage critical", existing
        )
        assert is_dup is True
        assert report_id == 1


# ---------------------------------------------------------------------------
# match_volunteers
# ---------------------------------------------------------------------------
class TestMatchVolunteers:
    """Test volunteer matching based on skill and rating."""

    def _make_volunteer(self, name, skill, rating):
        return types.SimpleNamespace(
            name=name, skill=skill, rating=rating, availability="Full"
        )

    def _make_report(self, issue_type):
        return types.SimpleNamespace(issue_type=issue_type)

    def test_returns_top_3(self):
        volunteers = [
            self._make_volunteer("A", "Medical", 4.0),
            self._make_volunteer("B", "Logistics", 5.0),
            self._make_volunteer("C", "Medical", 3.0),
            self._make_volunteer("D", "Medical", 5.0),
        ]
        report = self._make_report("Medical Emergency")
        matches = AIEngine.match_volunteers(report, volunteers)
        assert len(matches) <= 3

    def test_skill_match_ranked_higher(self):
        volunteers = [
            self._make_volunteer("NoMatch", "Cooking", 5.0),
            self._make_volunteer("Match", "Medical", 3.0),
        ]
        report = self._make_report("Medical Emergency")
        matches = AIEngine.match_volunteers(report, volunteers)
        # The medical volunteer should score higher (5 + 3 = 8 vs 0 + 5 = 5)
        assert matches[0]["volunteer"].name == "Match"

    def test_empty_volunteers(self):
        report = self._make_report("Fire Rescue")
        matches = AIEngine.match_volunteers(report, [])
        assert matches == []

    def test_returns_dict_with_score_and_volunteer(self):
        volunteers = [self._make_volunteer("V1", "Rescue", 4.5)]
        report = self._make_report("Rescue Mission")
        matches = AIEngine.match_volunteers(report, volunteers)
        assert "volunteer" in matches[0]
        assert "match_score" in matches[0]

    def test_rating_tiebreaker(self):
        volunteers = [
            self._make_volunteer("Low", "Medical", 2.0),
            self._make_volunteer("High", "Medical", 5.0),
        ]
        report = self._make_report("Medical Emergency")
        matches = AIEngine.match_volunteers(report, volunteers)
        assert matches[0]["volunteer"].name == "High"

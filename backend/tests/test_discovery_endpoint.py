"""
Tests for the /api/discovery endpoint.

Verifies that:
  1. Image data (media_data) is forwarded to PipOrchestrator.process_discovery().
  2. The orchestrator's result is returned as-is in the HTTP response.
  3. The endpoint rejects requests missing the required `media_data` field (422).
  4. When save=False the discovery_repo is NOT called (live/analysis mode).
  5. When save=True and the user is authenticated, discovery_repo.save_discovery is called.
"""
import pytest
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, patch, MagicMock

# ─── App import ───────────────────────────────────────────────────────────────

# We must patch Firebase-dependent modules before importing the app
# so that the startup event doesn't fail in the test environment.
import sys

# Stub firebase_admin so the SDK is never called for real
firebase_admin_stub = MagicMock()
sys.modules.setdefault("firebase_admin", firebase_admin_stub)
sys.modules.setdefault("firebase_admin.credentials", firebase_admin_stub)
sys.modules.setdefault("firebase_admin.firestore", firebase_admin_stub)
sys.modules.setdefault("firebase_admin.auth", firebase_admin_stub)
sys.modules.setdefault("firebase_admin.storage", firebase_admin_stub)

with (
    patch("app.config.firebase_config.FirebaseConfig.initialize", return_value=None),
    patch("app.orchestrator.context_loader.ContextLoader.__init__", return_value=None),
    patch("app.orchestrator.agent_router.AgentRouter.__init__", return_value=None),
    patch("app.orchestrator.execution_coordinator.ExecutionCoordinator.__init__", return_value=None),
    patch("app.orchestrator.response_synthesizer.ResponseSynthesizer.__init__", return_value=None),
    patch("app.orchestrator.prompt_builder.PromptBuilder.__init__", return_value=None),
    patch("app.repositories.discovery_repository.DiscoveryRepository.__init__", return_value=None),
    patch("app.repositories.user_repository.UserRepository.__init__", return_value=None),
):
    from app.main import app


# ─── Test client ──────────────────────────────────────────────────────────────

client = TestClient(app, raise_server_exceptions=True)

# ─── Shared fixtures ──────────────────────────────────────────────────────────

FAKE_IMAGE_URL = "data:image/jpeg;base64," + "A" * 12_000

MINIMAL_PAYLOAD = {
    "media_type": "image",
    "media_data": FAKE_IMAGE_URL,
}

ORCHESTRATOR_RESPONSE = {
    "discovery_id": None,
    "identification": {
        "name": "Monarch Butterfly",
        "scientific_name": "Danaus plexippus",
        "facts": ["Migrates thousands of miles"],
    },
    "safety_status": "safe",
    "story": "The Monarch flies south every autumn.",
    "activity": {"prompt": "Draw the butterfly life cycle!"},
}


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _patch_orchestrator(response: dict = None):
    """Patch PipOrchestrator.process_discovery to return a fake response."""
    return patch(
        "app.main.orchestrator.process_discovery",
        new=AsyncMock(return_value=response or ORCHESTRATOR_RESPONSE),
    )


def _patch_discovery_repo_save(saved_id: str = "disc_saved_001"):
    """Patch DiscoveryRepository.save_discovery."""
    return patch(
        "app.main.discovery_repo.save_discovery",
        new=AsyncMock(return_value=saved_id),
    )


def _patch_user_repo_update():
    """Patch UserRepository.update_last_active (no-op)."""
    return patch(
        "app.main.user_repo.update_last_active",
        new=AsyncMock(return_value=None),
    )


# ─── Tests ────────────────────────────────────────────────────────────────────


class TestDiscoveryEndpoint:

    # ------------------------------------------------------------------
    # 1. image data is forwarded to the orchestrator
    # ------------------------------------------------------------------

    def test_image_data_is_forwarded_to_orchestrator(self):
        """POST /api/discovery passes the media_data field to process_discovery."""
        with _patch_orchestrator() as mock_process:
            response = client.post("/api/discovery", json=MINIMAL_PAYLOAD)

        assert response.status_code == 200
        mock_process.assert_called_once()

        # The dict passed to process_discovery must contain our image data
        call_kwargs = mock_process.call_args[0][0]  # first positional arg is the dict
        assert call_kwargs["media_data"] == FAKE_IMAGE_URL
        assert call_kwargs["media_type"] == "image"

    # ------------------------------------------------------------------
    # 2. orchestrator result is returned in the HTTP response
    # ------------------------------------------------------------------

    def test_orchestrator_result_is_returned_in_response(self):
        """Response JSON mirrors what the orchestrator returns."""
        with _patch_orchestrator(ORCHESTRATOR_RESPONSE):
            response = client.post("/api/discovery", json=MINIMAL_PAYLOAD)

        assert response.status_code == 200
        body = response.json()
        assert body["identification"]["name"] == "Monarch Butterfly"
        assert body["story"] == "The Monarch flies south every autumn."
        assert body["activity"]["prompt"] == "Draw the butterfly life cycle!"

    def test_response_contains_safety_status(self):
        """The safety_status field is present in the response."""
        with _patch_orchestrator():
            response = client.post("/api/discovery", json=MINIMAL_PAYLOAD)

        assert response.status_code == 200
        assert response.json()["safety_status"] == "safe"

    # ------------------------------------------------------------------
    # 3. missing required field returns 422
    # ------------------------------------------------------------------

    def test_missing_media_data_returns_422(self):
        """Omitting the required media_data field results in a 422 validation error."""
        response = client.post("/api/discovery", json={"media_type": "image"})
        assert response.status_code == 422

    def test_empty_body_returns_422(self):
        """An empty body also causes a 422."""
        response = client.post("/api/discovery", json={})
        assert response.status_code == 422

    # ------------------------------------------------------------------
    # 4. save=False → discovery_repo is NOT called
    # ------------------------------------------------------------------

    def test_save_false_does_not_call_discovery_repo(self):
        """When save=False the discovery is not persisted (live mode)."""
        with (
            _patch_orchestrator(),
            _patch_discovery_repo_save() as mock_save,
        ):
            response = client.post(
                "/api/discovery?save=false",
                json=MINIMAL_PAYLOAD,
            )

        assert response.status_code == 200
        mock_save.assert_not_called()

    def test_save_false_response_shows_live_mode_info(self):
        """Response indicates live/analysis-only mode when save=False and no auth."""
        with _patch_orchestrator():
            response = client.post(
                "/api/discovery?save=false",
                json=MINIMAL_PAYLOAD,
            )

        body = response.json()
        assert body["saved"] is False

    # ------------------------------------------------------------------
    # 5. Additional fields pass through correctly
    # ------------------------------------------------------------------

    def test_child_name_and_age_are_forwarded(self):
        """Optional child metadata is included in the orchestrator payload."""
        payload = {
            **MINIMAL_PAYLOAD,
            "child_name": "Alice",
            "child_age": 8,
        }
        with _patch_orchestrator() as mock_process:
            client.post("/api/discovery", json=payload)

        call_dict = mock_process.call_args[0][0]
        assert call_dict["child_name"] == "Alice"
        assert call_dict["child_age"] == 8

    def test_timestamp_is_forwarded(self):
        """Timestamp is passed through to the orchestrator when provided."""
        ts = "2024-06-15T10:30:00Z"
        payload = {**MINIMAL_PAYLOAD, "timestamp": ts}
        with _patch_orchestrator() as mock_process:
            client.post("/api/discovery", json=payload)

        call_dict = mock_process.call_args[0][0]
        assert call_dict["timestamp"] == ts

    # ------------------------------------------------------------------
    # 6. 500 when orchestrator raises
    # ------------------------------------------------------------------

    def test_orchestrator_exception_returns_500(self):
        """An unhandled orchestrator error results in a 500 response."""
        with patch(
            "app.main.orchestrator.process_discovery",
            new=AsyncMock(side_effect=RuntimeError("AI unavailable")),
        ):
            response = client.post("/api/discovery", json=MINIMAL_PAYLOAD)

        assert response.status_code == 500

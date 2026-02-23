from fastapi.testclient import TestClient
from uuid import uuid4

from app.main import app
from app.modules.delivery import routes as delivery_routes


class DummyDB:
    def add(self, _obj):
        return None

    def commit(self):
        return None

    def refresh(self, _obj):
        if getattr(_obj, "id", None) is None:
            _obj.id = uuid4()
        if getattr(_obj, "status", None) is None:
            _obj.status = "draft"
        return None

    def close(self):
        return None


def override_db():
    yield DummyDB()


client = TestClient(app)


def setup_module():
    app.dependency_overrides[delivery_routes.get_db] = override_db


def teardown_module():
    app.dependency_overrides.pop(delivery_routes.get_db, None)


def test_create_feature_without_hypothesis_or_mvp_is_allowed():
    response = client.post(
        "/delivery/features",
        json={
            "product_id": 1,
            "title": "Feature sem vinculo",
            "description": None,
            "complexity": "medium",
            "business_estimate": None,
            "effort_estimate": None,
            "ux_estimate": None,
            "status": "todo",
        },
    )

    assert response.status_code == 200
    assert response.json()["title"] == "Feature sem vinculo"


def test_create_story_requires_feature_or_workspace():
    response = client.post(
        "/delivery/stories",
        json={
            "feature_id": None,
            "workspace_id": None,
            "title": "Story sem vinculo",
            "description": None,
            "acceptance_criteria": None,
            "estimate": None,
        },
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Story requires feature_id or workspace_id"

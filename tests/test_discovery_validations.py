from fastapi.testclient import TestClient

from app.main import app
from app.modules.discovery import routes as discovery_routes


class DummyDB:
    def close(self):
        return None


def override_db():
    yield DummyDB()


client = TestClient(app)


def setup_module():
    app.dependency_overrides[discovery_routes.get_db] = override_db


def teardown_module():
    app.dependency_overrides.pop(discovery_routes.get_db, None)


def test_create_problem_requires_workspace_id():
    response = client.post(
        "/discovery/problems",
        json={
            "title": "Problema sem workspace",
            "description": "Descricao",
        },
    )

    assert response.status_code == 422

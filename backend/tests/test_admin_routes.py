import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import pytest
from app import create_app


@pytest.fixture
def client():
    app = create_app()
    app.testing = True
    with app.test_client() as client:
        yield client


def test_get_user_role_success(client):
    response = client.get("/api/admin/users/1/role")
    assert response.status_code == 200
    assert response.get_json()["role"] == "Admin"


def test_get_user_role_not_found(client):
    response = client.get("/api/admin/users/999/role")
    assert response.status_code == 404


def test_assign_valid_role(client):
    response = client.put("/api/admin/users/2/role", json={"role": "Admin"})
    assert response.status_code == 200
    assert response.get_json()["role"] == "Admin"


def test_assign_invalid_role(client):
    response = client.put("/api/admin/users/2/role", json={"role": "SuperUser"})
    assert response.status_code == 400


def test_assign_role_missing_field(client):
    response = client.put("/api/admin/users/2/role", json={})
    assert response.status_code == 400


def test_assign_role_user_not_found(client):
    response = client.put("/api/admin/users/999/role", json={"role": "Admin"})
    assert response.status_code == 404
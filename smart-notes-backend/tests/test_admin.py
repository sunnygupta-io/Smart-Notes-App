import pytest
from app.models.models import User
from app.utils.auth import get_password_hash

# 1. Create an Admin User in the DB
@pytest.fixture
def admin_user(db_session):
    user = User(
        email="admin@example.com",
        password_hash=get_password_hash("AdminPass@123!"),
        role="admin",
        is_active=True
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user

# 2. Create an Admin Client that is logged in
@pytest.fixture
def admin_client(client, admin_user):
    client.post(
        "/api/users/login",
        json={"email": admin_user.email, "password": "AdminPass@123!"}
    )
    return client


def test_list_all_users(admin_client, test_user):
    response = admin_client.get("/api/admin/users")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1
    assert "items" in data


def test_get_user_detail(admin_client, test_user):
    response = admin_client.get(f"/api/admin/users/{test_user.id}")
    assert response.status_code == 200
    assert response.json()["email"] == test_user.email


def test_deactivate_user(admin_client, test_user):
    response = admin_client.patch(f"/api/admin/users/{test_user.id}/deactivate")
    assert response.status_code == 200
    assert response.json()["is_active"] is False


def test_reactivate_user(admin_client, test_user):
    # First deactivate
    admin_client.patch(f"/api/admin/users/{test_user.id}/deactivate")
    
    # Then reactivate
    response = admin_client.patch(f"/api/admin/users/{test_user.id}/reactivate")
    assert response.status_code == 200
    assert response.json()["is_active"] is True


def test_admin_cannot_deactivate_self(admin_client, admin_user):
    response = admin_client.patch(f"/api/admin/users/{admin_user.id}/deactivate")
    assert response.status_code == 400
    assert response.json()["detail"] == "You cannot deactivate your account"


def test_get_user_notes_as_admin(admin_client, test_user):
    response = admin_client.get(f"/api/admin/users/{test_user.id}/notes")
    assert response.status_code == 200
    assert type(response.json()) == list


def test_get_platform_stats(admin_client):
    response = admin_client.get("/api/admin/stats")
    assert response.status_code == 200
    data = response.json()
    assert "users" in data
    assert "notes" in data
    assert "tags" in data


def test_delete_user_as_admin(admin_client, test_user):
    response = admin_client.delete(f"/api/admin/users/{test_user.id}")
    assert response.status_code == 200
    assert "permanently deleted" in response.json()["message"]
    
    # Verify user is gone
    verify = admin_client.get(f"/api/admin/users/{test_user.id}")
    assert verify.status_code == 404
import pytest
from app.models.models import User
from app.utils.auth import get_password_hash

# 1. Fixture to create a second user in the database
@pytest.fixture
def test_user_2(db_session):
    user = User(
        email="friend@example.com",
        password_hash=get_password_hash("StrongPass@123!"),
        role="user",
        is_active=True
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user

# 2. Fixture to quickly create a note we can share
@pytest.fixture
def note_to_share(auth_client):
    response = auth_client.post(
        "/api/notes/", 
        json={"title": "Team Project Ideas", "content": "Let's build an API"}
    )
    return response.json()


def test_share_note_success(auth_client, note_to_share, test_user_2):
    response = auth_client.post(
        f"/api/share/{note_to_share['id']}",
        json={"shared_with_email": test_user_2.email, "permission": "view"}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["shared_with_user_id"] == test_user_2.id
    assert data["permission"] == "view"


def test_share_note_with_self(auth_client, note_to_share, test_user):
    # Testing your custom logic that prevents sharing with yourself
    response = auth_client.post(
        f"/api/share/{note_to_share['id']}",
        json={"shared_with_email": test_user.email, "permission": "view"}
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "You cannot share a note yourself"


def test_list_note_shares(auth_client, note_to_share, test_user_2):
    # Share the note first
    auth_client.post(
        f"/api/share/{note_to_share['id']}",
        json={"shared_with_email": test_user_2.email, "permission": "view"}
    )
    
    # Now list the shares for this note
    response = auth_client.get(f"/api/share/{note_to_share['id']}/users")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["shared_with_email"] == test_user_2.email


def test_update_share_permission(auth_client, note_to_share, test_user_2):
    # 1. Share as 'view'
    auth_client.post(
        f"/api/share/{note_to_share['id']}",
        json={"shared_with_email": test_user_2.email, "permission": "view"}
    )
    
    # 2. Update to 'edit'
    response = auth_client.patch(
        f"/api/share/{note_to_share['id']}/users/{test_user_2.id}",
        json={"permission": "edit"}
    )
    assert response.status_code == 200
    assert response.json()["permission"] == "edit"


def test_revoke_share(auth_client, note_to_share, test_user_2):
    # Share the note
    auth_client.post(
        f"/api/share/{note_to_share['id']}",
        json={"shared_with_email": test_user_2.email, "permission": "view"}
    )
    
    # Revoke the share
    response = auth_client.delete(f"/api/share/{note_to_share['id']}/users/{test_user_2.id}")
    assert response.status_code == 200
    assert "Access revoked" in response.json()["message"]


def test_notes_shared_with_me(client, auth_client, note_to_share, test_user_2):
    # 1. Primary user (auth_client) shares note with user 2
    auth_client.post(
        f"/api/share/{note_to_share['id']}",
        json={"shared_with_email": test_user_2.email, "permission": "view"}
    )
    
    # 2. Switch accounts! Log in as test_user_2 to update the test client's cookies
    client.post(
        "/api/users/login",
        json={"email": test_user_2.email, "password": "StrongPass@123!"}
    )
    
    # 3. Fetch notes shared with user 2
    response = client.get("/api/share/me/notes")
    assert response.status_code == 200
    data = response.json()
    
    assert len(data) >= 1
    assert data[0]["note"]["id"] == note_to_share["id"]
    assert data[0]["permission"] == "view"
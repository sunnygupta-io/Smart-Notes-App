import pytest
from app.models.models import Notification

# Fixture to insert a dummy notification for the logged-in test_user
@pytest.fixture
def test_notification(db_session, test_user):
    notif = Notification(
        user_id=test_user.id,
        message="Someone shared a note with you!",
        is_read=False
    )
    db_session.add(notif)
    db_session.commit()
    db_session.refresh(notif)
    return notif


def test_list_notifications(auth_client, test_notification):
    response = auth_client.get("/api/notifications/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert data[0]["message"] == "Someone shared a note with you!"


def test_list_unread_notifications(auth_client, test_notification):
    response = auth_client.get("/api/notifications/?unread_only=true")
    assert response.status_code == 200
    data = response.json()
    # Ensure all returned notifications are actually unread
    assert all(n["is_read"] is False for n in data)


def test_get_unread_count(auth_client, test_notification):
    response = auth_client.get("/api/notifications/unread-count")
    assert response.status_code == 200
    assert response.json()["unread_count"] >= 1


def test_mark_as_read(auth_client, test_notification):
    response = auth_client.patch(f"/api/notifications/{test_notification.id}/read")
    assert response.status_code == 200
    assert response.json()["is_read"] is True


def test_mark_all_as_read(auth_client, test_notification):
    response = auth_client.patch("/api/notifications/read-all")
    assert response.status_code == 200
    assert "marked as read" in response.json()["message"]


def test_delete_one_notification(auth_client, test_notification):
    response = auth_client.delete(f"/api/notifications/{test_notification.id}")
    assert response.status_code == 200
    assert response.json()["message"] == "Notification deleted successfully"


def test_clear_all_notifications(auth_client, test_notification):
    response = auth_client.delete("/api/notifications/clear-all")
    assert response.status_code == 200
    assert "notifications cleared" in response.json()["message"]
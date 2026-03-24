import pytest

# Helper fixture to create a temporary note for tests that require an existing note
@pytest.fixture
def test_note(auth_client):
    response = auth_client.post(
        "/api/notes/", 
        json={"title": "Standard Test Note", "content": "This is a note for testing.", "tag_ids": []}
    )
    return response.json()


def test_create_note(auth_client):
    payload = {
        "title": "My Super Awesome Note",
        "content": "Learning FastAPI testing is fun.",
        "tag_ids": []
    }
    response = auth_client.post("/api/notes/", json=payload)
    
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == payload["title"]
    assert data["content"] == payload["content"]
    assert "id" in data
    assert data["is_archived"] is False


def test_create_note_empty_title(auth_client):
    # Testing your Pydantic validation for empty titles
    response = auth_client.post("/api/notes/", json={"title": "", "content": "No title here"})
    assert response.status_code == 422


def test_list_notes(auth_client, test_note):
    response = auth_client.get("/api/notes/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert data[0]["title"] == test_note["title"]


def test_get_note_by_id(auth_client, test_note):
    response = auth_client.get(f"/api/notes/{test_note['id']}")
    assert response.status_code == 200
    assert response.json()["title"] == test_note["title"]


def test_get_note_not_found(auth_client):
    response = auth_client.get("/api/notes/99999")
    assert response.status_code == 404


def test_update_note(auth_client, test_note):
    update_payload = {"title": "Updated Title", "content": "Updated Content"}
    response = auth_client.put(f"/api/notes/{test_note['id']}", json=update_payload)
    
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Updated Title"
    assert data["content"] == "Updated Content"


def test_toggle_archive_note(auth_client, test_note):
    # Archive the note
    response = auth_client.patch(f"/api/notes/{test_note['id']}/archive")
    assert response.status_code == 200
    assert response.json()["is_archived"] is True

    # Unarchive the note
    response2 = auth_client.patch(f"/api/notes/{test_note['id']}/archive")
    assert response2.status_code == 200
    assert response2.json()["is_archived"] is False


def test_delete_note(auth_client, test_note):
    # Delete it
    response = auth_client.delete(f"/api/notes/{test_note['id']}")
    assert response.status_code == 200
    assert response.json()["message"] == f"Note {test_note['id']} deleted successfully"

    # Verify it's gone
    verify_response = auth_client.get(f"/api/notes/{test_note['id']}")
    assert verify_response.status_code == 404


def test_search_notes(auth_client, test_note):
    # Test the search endpoint with the title of the test_note
    response = auth_client.get("/api/notes/search?q=Standard")
    assert response.status_code == 200
    data = response.json()
    
    assert data["total"] >= 1
    assert data["items"][0]["title"] == "Standard Test Note"
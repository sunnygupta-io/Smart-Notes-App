import pytest

# Setup fixtures for a test tag and a test note
@pytest.fixture
def test_tag(auth_client):
    response = auth_client.post("/api/tags/", json={"name": "work"})
    return response.json()

@pytest.fixture
def test_note_for_tags(auth_client):
    response = auth_client.post(
        "/api/notes/", 
        json={"title": "Tag Note", "content": "Testing tags", "tag_ids": []}
    )
    return response.json()


def test_create_tag(auth_client):
    response = auth_client.post("/api/tags/", json={"name": "personal"})
    assert response.status_code == 201
    assert response.json()["name"] == "personal"


def test_create_duplicate_tag(auth_client, test_tag):
    # Your API logic returns the existing tag instead of throwing an error
    response = auth_client.post("/api/tags/", json={"name": test_tag["name"]})
    assert response.status_code == 201 
    assert response.json()["id"] == test_tag["id"]


def test_list_tags(auth_client, test_tag):
    response = auth_client.get("/api/tags/")
    assert response.status_code == 200
    assert len(response.json()) >= 1


def test_add_tag_to_note(auth_client, test_note_for_tags, test_tag):
    response = auth_client.post(f"/api/tags/notes/{test_note_for_tags['id']}/tags/{test_tag['id']}")
    
    assert response.status_code == 200
    tags = response.json()["tags"]
    # Check if the tag ID exists in the note's tags list
    assert any(t["id"] == test_tag["id"] for t in tags)


def test_get_notes_by_tag(auth_client, test_note_for_tags, test_tag):
    # First, attach the tag to the note
    auth_client.post(f"/api/tags/notes/{test_note_for_tags['id']}/tags/{test_tag['id']}")
    
    # Now fetch notes by tag ID
    response = auth_client.get(f"/api/tags/{test_tag['id']}/notes")
    assert response.status_code == 200
    assert len(response.json()) >= 1
    assert response.json()[0]["id"] == test_note_for_tags["id"]


def test_remove_tag_from_note(auth_client, test_note_for_tags, test_tag):
    # Add it
    auth_client.post(f"/api/tags/notes/{test_note_for_tags['id']}/tags/{test_tag['id']}")
    
    # Remove it
    response = auth_client.delete(f"/api/tags/notes/{test_note_for_tags['id']}/tags/{test_tag['id']}")
    assert response.status_code == 200
    tags = response.json()["tags"]
    
    # Verify it is no longer in the list
    assert not any(t["id"] == test_tag["id"] for t in tags)


def test_delete_tag(auth_client, test_tag):
    response = auth_client.delete(f"/api/tags/{test_tag['id']}")
    assert response.status_code == 200
    
    # Verify it was actually deleted
    verify = auth_client.get(f"/api/tags/{test_tag['id']}")
    assert verify.status_code == 404
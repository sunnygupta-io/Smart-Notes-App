import pytest

def test_register_user(client):
    response = client.post(
        "/api/users/register",
        # Notice the strong password here
        json={"email": "newuser@example.com", "password": "NewUser@1234!"}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "newuser@example.com"
    assert "id" in data

def test_register_existing_user(client, test_user):
    response = client.post(
        "/api/users/register",
        # Notice the strong password here too
        json={"email": test_user.email, "password": "ExistingUser@1234!"}
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Email already exists"

def test_login_user(client, test_user):
    response = client.post(
        "/api/users/login",
        json={"email": test_user.email, "password": "testpassword123"}
    )
    assert response.status_code == 200
    assert response.json()["message"] == "User login successfully"
    assert "access_token" in response.cookies
    assert "refresh_token" in response.cookies

def test_login_invalid_credentials(client, test_user):
    response = client.post(
        "/api/users/login",
        json={"email": test_user.email, "password": "WrongPassword@123!"}
    )
    assert response.status_code == 401

def test_get_me(client, test_user):
    client.post(
        "/api/users/login",
        json={"email": test_user.email, "password": "testpassword123"}
    )
    response = client.get("/api/users/me")
    assert response.status_code == 200
    assert response.json()["email"] == test_user.email
import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from database.session import Base, get_db
from main import app

# Use a test-specific database file
TEST_DB_URL = "sqlite:///./test_auth.db"
engine = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Set up test database tables
Base.metadata.create_all(bind=engine)

def override_get_db():
    """
    Overrides the database dependency to return sessions bound to the test database.
    """
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

# Apply the dependency override to the app
app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

test_email = "testauthuser@example.com"
test_password = "supersecretpassword123"

def test_signup():
    """Verify standard user signup returns 201 Created and the correct email."""
    response = client.post(
        "/api/v1/auth/signup",
        json={"email": test_email, "password": test_password}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == test_email
    assert "id" in data

def test_signup_duplicate_email():
    """Verify signup fails with 400 Bad Request if the email is already in use."""
    response = client.post(
        "/api/v1/auth/signup",
        json={"email": test_email, "password": test_password}
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "A user with this email address already exists."

def test_login_success():
    """Verify login returns 200 OK and valid JWT credentials."""
    response = client.post(
        "/api/v1/auth/login",
        json={"email": test_email, "password": test_password}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"

def test_login_failure():
    """Verify login fails with 401 Unauthorized for incorrect password."""
    response = client.post(
        "/api/v1/auth/login",
        json={"email": test_email, "password": "wrongpassword"}
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect email or password."

def test_get_current_user_profile():
    """Verify user can access profile with correct bearer token."""
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"email": test_email, "password": test_password}
    )
    token = login_resp.json()["access_token"]
    
    response = client.get(
        "/api/v1/users/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == test_email

def test_refresh_token_rotation():
    """Verify refresh endpoint accepts refresh token and yields new credentials."""
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"email": test_email, "password": test_password}
    )
    refresh_token = login_resp.json()["refresh_token"]
    
    response = client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": refresh_token}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    
def test_teardown():
    """Clean up the test database file."""
    if os.path.exists("./test_auth.db"):
        os.remove("./test_auth.db")

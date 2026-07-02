import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from database.session import Base, get_db
from main import app

# Use a test-specific database file
TEST_DB_URL = "sqlite:///./test_capture.db"
engine = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Set up test database tables
Base.metadata.create_all(bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

# Apply the dependency override to the app
app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)

# Helper fixtures for auth headers and test isolation
@pytest.fixture(scope="module")
def auth_headers():
    # 1. Sign up test user
    email = "capture_tester@example.com"
    password = "testerpassword123"
    client.post(
        "/api/v1/auth/signup",
        json={"email": email, "password": password}
    )
    # 2. Log in and retrieve access token
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": password}
    )
    token = login_resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

# --- 1. NLP Capture Endpoint Tests ---

def test_nlp_capture_note(auth_headers):
    # Short capture should resolve as a note if it's general declarative text
    text = "Machine learning is a field of study that gives computers the ability to learn without being explicitly programmed."
    resp = client.post(
        "/api/v1/captures/process",
        json={"text": text},
        headers=auth_headers
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["intent"] == "note"
    assert data["type"] == "note"
    assert "data" in data
    assert data["data"]["content"] == text
    assert len(data["data"]["tags"]) > 0

def test_nlp_capture_task(auth_headers):
    # Capture with future context and temporal elements should map to task
    text = "Work on project assignment and submit the final draft tomorrow at 5 PM"
    resp = client.post(
        "/api/v1/captures/process",
        json={"text": text},
        headers=auth_headers
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["intent"] in ("task", "todo")
    assert data["type"] == "task"
    assert data["data"]["due_date"] is not None
    assert "Work" in [t["name"] for t in data["data"]["tags"]]

def test_nlp_capture_reminder(auth_headers):
    # Capture starting with "remind me" should map to reminder
    text = "Remind me to pay utility bills next week"
    resp = client.post(
        "/api/v1/captures/process",
        json={"text": text},
        headers=auth_headers
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["intent"] == "reminder"
    assert data["type"] == "reminder"
    assert data["data"]["remind_at"] is not None

# --- 2. Notes CRUD Direct Operations ---

def test_note_crud(auth_headers):
    # Create note manually
    create_resp = client.post(
        "/api/v1/notes",
        json={"title": "Manual Note Title", "content": "Manual note content description.", "tags": ["Study", "Personal"]},
        headers=auth_headers
    )
    assert create_resp.status_code == 201
    note_id = create_resp.json()["id"]

    # Get single note
    get_resp = client.get(f"/api/v1/notes/{note_id}", headers=auth_headers)
    assert get_resp.status_code == 200
    assert get_resp.json()["title"] == "Manual Note Title"

    # Get list
    list_resp = client.get("/api/v1/notes", headers=auth_headers)
    assert list_resp.status_code == 200
    assert len(list_resp.json()) >= 1

    # Update note
    update_resp = client.put(
        f"/api/v1/notes/{note_id}",
        json={"title": "Updated Title"},
        headers=auth_headers
    )
    assert update_resp.status_code == 200
    assert update_resp.json()["title"] == "Updated Title"

    # Delete note
    delete_resp = client.delete(f"/api/v1/notes/{note_id}", headers=auth_headers)
    assert delete_resp.status_code == 200
    
    # Verify 404
    get_again = client.get(f"/api/v1/notes/{note_id}", headers=auth_headers)
    assert get_again.status_code == 404

# --- 3. Search and Filters Tests ---

def test_search_and_filter(auth_headers):
    # Setup some test items
    client.post(
        "/api/v1/notes",
        json={"title": "Electricity Invoice", "content": "Need to pay electricity bill of $120.", "tags": ["Finance"]},
        headers=auth_headers
    )
    client.post(
        "/api/v1/notes",
        json={"title": "Gym workout schedule", "content": "Doing cardio on Mondays and strength on Fridays.", "tags": ["Health"]},
        headers=auth_headers
    )

    # 1. Keyword search test
    resp_kw = client.get("/api/v1/search?query=electricity&mode=keyword", headers=auth_headers)
    assert resp_kw.status_code == 200
    results_kw = resp_kw.json()["results"]
    assert len(results_kw) >= 1
    assert "Invoice" in results_kw[0]["title"]

    # 2. Semantic search test
    resp_sem = client.get("/api/v1/search?query=paying bills and banking details&mode=semantic", headers=auth_headers)
    assert resp_sem.status_code == 200
    results_sem = resp_sem.json()["results"]
    assert len(results_sem) >= 1
    # "Electricity Invoice" has a Finance tag and banking terms, should be ranked high
    assert any("Invoice" in r["title"] for r in results_sem)

    # 3. Filter by tag test
    resp_tag = client.get("/api/v1/search?query=electricity&mode=keyword&tag=Finance", headers=auth_headers)
    assert resp_tag.status_code == 200
    assert len(resp_tag.json()["results"]) >= 1

# --- 4. Dashboard Stats Test ---

def test_dashboard_stats(auth_headers):
    resp = client.get("/api/v1/dashboard/stats", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert "total_notes" in data
    assert "total_tasks" in data
    assert "total_reminders" in data
    assert "weekly_activity" in data
    assert len(data["tag_counts"]) >= 1

# --- 5. Clean up ---

def test_cleanup():
    if os.path.exists("./test_capture.db"):
        os.remove("./test_capture.db")

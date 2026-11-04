import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import Base, SessionLocal, engine
from app.models.user import User

client = TestClient(app)

@pytest.fixture(scope='module', autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=engine)
    yield

def test_api_health():
    response = client.get('/api/health')
    assert response.status_code == 200
    data = response.json()
    assert data['status'] == 'healthy'
    assert 'model_loaded' in data

def test_empty_user_list():
    response = client.get('/api/users')
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_dashboard_stats():
    response = client.get('/api/dashboard/stats')
    assert response.status_code == 200
    data = response.json()
    assert 'total_registered_users' in data
    assert 'match_accuracy_rate' in data

def test_settings_get_and_put():
    get_res = client.get('/api/settings')
    assert get_res.status_code == 200
    current_settings = get_res.json()
    assert 'similarity_threshold' in current_settings

    # Update threshold
    current_settings['similarity_threshold'] = 0.40
    put_res = client.put('/api/settings', json=current_settings)
    assert put_res.status_code == 200
    assert put_res.json()['similarity_threshold'] == 0.40

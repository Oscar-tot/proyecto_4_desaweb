"""
Tests para Player Service
"""
import pytest
from app import create_app
from app.utils.database import get_db

@pytest.fixture
def app():
    """Crear aplicación de test"""
    app = create_app('testing')
    return app

@pytest.fixture
def client(app):
    """Cliente de test"""
    return app.test_client()

def test_health_check(client):
    """Test del endpoint de health"""
    response = client.get('/health')
    assert response.status_code == 200
    data = response.get_json()
    assert data['status'] == 'healthy'
    assert data['service'] == 'players-service'

def test_get_all_players(client):
    """Test para obtener todos los jugadores"""
    response = client.get('/api/players')
    assert response.status_code == 200
    data = response.get_json()
    assert 'data' in data
    assert 'count' in data

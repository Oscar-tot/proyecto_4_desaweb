"""
Configuración de la aplicación Flask
"""
import os
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv('.env.development')

class Config:
    """Configuración base"""
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    
    # MongoDB
    MONGO_HOST = os.getenv('MONGO_HOST', 'localhost')
    MONGO_PORT = int(os.getenv('MONGO_PORT', 27017))
    MONGO_DATABASE = os.getenv('MONGO_DATABASE', 'players_service_db')
    MONGO_USERNAME = os.getenv('MONGO_USERNAME', 'player_user')
    MONGO_PASSWORD = os.getenv('MONGO_PASSWORD', 'player123')
    MONGO_AUTH_SOURCE = os.getenv('MONGO_AUTH_SOURCE', 'admin')
    
    # URI de MongoDB
    MONGO_URI = f"mongodb://{MONGO_USERNAME}:{MONGO_PASSWORD}@{MONGO_HOST}:{MONGO_PORT}/{MONGO_DATABASE}?authSource={MONGO_AUTH_SOURCE}"
    
    # Flask
    PORT = int(os.getenv('PORT', 5002))
    DEBUG = os.getenv('FLASK_DEBUG', 'True') == 'True'
    
    # CORS
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', 'http://localhost:4200').split(',')
    
    # Servicios externos
    TEAMS_SERVICE_URL = os.getenv('TEAMS_SERVICE_URL', 'http://localhost:5001/api/teams')
    MATCHES_SERVICE_URL = os.getenv('MATCHES_SERVICE_URL', 'http://localhost:5004/api/matches')
    REPORT_SERVICE_URL = os.getenv('REPORT_SERVICE_URL', 'http://localhost:5003/api/reports')


class DevelopmentConfig(Config):
    """Configuración de desarrollo"""
    DEBUG = True
    TESTING = False


class ProductionConfig(Config):
    """Configuración de producción"""
    DEBUG = False
    TESTING = False


class TestingConfig(Config):
    """Configuración de testing"""
    TESTING = True
    MONGO_DATABASE = 'players_service_db_test'


config_by_name = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig
}

def get_config(config_name='development'):
    """Obtener configuración por nombre"""
    return config_by_name.get(config_name, DevelopmentConfig)

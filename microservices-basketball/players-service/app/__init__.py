"""
Inicialización de la aplicación Flask
"""
from flask import Flask
from flask_cors import CORS
from app.config import get_config
from app.utils.database import init_db
import os

def create_app(config_name=None):
    """Factory para crear la aplicación Flask"""
    
    # Crear instancia de Flask
    app = Flask(__name__)
    
    # Cargar configuración
    if config_name is None:
        config_name = os.getenv('FLASK_ENV', 'development')
    
    config = get_config(config_name)
    app.config.from_object(config)
    
    # Configurar CORS
    CORS(app, resources={
        r"/api/*": {
            "origins": app.config['CORS_ORIGINS'],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })
    
    # Inicializar MongoDB
    init_db(app)
    
    # Registrar blueprints
    from app.routes.health import health_bp
    from app.routes.players import players_bp
    
    app.register_blueprint(health_bp)
    app.register_blueprint(players_bp, url_prefix='/api/players')
    
    # Manejador de errores global
    @app.errorhandler(404)
    def not_found(error):
        return {'error': 'Recurso no encontrado', 'status': 404}, 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return {'error': 'Error interno del servidor', 'status': 500}, 500
    
    return app

"""
Blueprint para health check
"""
from flask import Blueprint, jsonify
from app.utils.database import get_db
from datetime import datetime

health_bp = Blueprint('health', __name__)

@health_bp.route('/health', methods=['GET'])
def health_check():
    """
    Endpoint de health check para verificar el estado del servicio
    """
    try:
        # Verificar conexión a MongoDB
        db = get_db()
        db.command('ping')
        
        return jsonify({
            'status': 'healthy',
            'service': 'players-service',
            'timestamp': datetime.utcnow().isoformat(),
            'database': 'connected',
            'version': '1.0.0'
        }), 200
        
    except Exception as e:
        return jsonify({
            'status': 'unhealthy',
            'service': 'players-service',
            'timestamp': datetime.utcnow().isoformat(),
            'database': 'disconnected',
            'error': str(e)
        }), 503

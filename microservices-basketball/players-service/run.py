"""
Punto de entrada de la aplicación Players Service
"""
from app import create_app
import os

# Crear la aplicación Flask
app = create_app()

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5002))
    debug = os.getenv('FLASK_DEBUG', 'True') == 'True'
    
    print(f"""
      Players Service Starting...
      Port: {port}
      Debug: {debug}
      Database: {os.getenv('MONGO_DATABASE', 'players_service_db')}
    
      Server running at: http://localhost:{port}
      Health check: http://localhost:{port}/health
    """)
    
    app.run(
        host='0.0.0.0',
        port=port,
        debug=debug
    )

"""
Utilidades para la conexión a MongoDB
"""
from flask import current_app
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
import logging

logger = logging.getLogger(__name__)

# Cliente MongoDB global
mongo_client = None
db = None

def init_db(app):
    """
    Inicializa la conexión a MongoDB
    """
    global mongo_client, db
    
    try:
        mongo_uri = app.config['MONGO_URI']
        database_name = app.config['MONGO_DATABASE']
        
        logger.info(f"Conectando a MongoDB: {database_name}")
        
        # Crear cliente MongoDB
        mongo_client = MongoClient(
            mongo_uri,
            serverSelectionTimeoutMS=5000,
            connectTimeoutMS=10000,
            socketTimeoutMS=10000
        )
        
        # Verificar conexión
        mongo_client.admin.command('ping')
        
        # Seleccionar base de datos
        db = mongo_client[database_name]
        
        # Crear índices
        create_indexes(db)
        
        logger.info(f"Conectado exitosamente a MongoDB: {database_name}")
        
        return db
        
    except (ConnectionFailure, ServerSelectionTimeoutError) as e:
        logger.error(f"Error conectando a MongoDB: {str(e)}")
        raise
    except Exception as e:
        logger.error(f"Error inesperado en MongoDB: {str(e)}")
        raise


def create_indexes(db):
    """
    Crea índices en las colecciones de MongoDB
    """
    try:
        # Índices para la colección players
        players_collection = db.players
        
        # Índice único por equipoId + numeroCamiseta (un número por equipo)
        players_collection.create_index([
            ('equipoId', 1),
            ('numeroCamiseta', 1)
        ], unique=True, name='idx_equipo_numero')
        
        # Índice para búsquedas por equipo
        players_collection.create_index('equipoId', name='idx_equipo')
        
        # Índice para búsquedas por nombre
        players_collection.create_index([
            ('nombre', 1),
            ('apellidos', 1)
        ], name='idx_nombre_completo')
        
        # Índice para filtrar activos
        players_collection.create_index('activo', name='idx_activo')
        
        logger.info("Índices de MongoDB creados exitosamente")
        
    except Exception as e:
        logger.warning(f"⚠️ Error creando índices: {str(e)}")


def get_db():
    """
    Obtiene la instancia de la base de datos
    """
    global db
    if db is None:
        raise Exception("Base de datos no inicializada. Llama a init_db() primero.")
    return db


def close_db():
    """
    Cierra la conexión a MongoDB
    """
    global mongo_client
    if mongo_client:
        mongo_client.close()
        logger.info("Conexión a MongoDB cerrada")

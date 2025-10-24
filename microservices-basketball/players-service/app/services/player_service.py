"""
Servicio de lógica de negocio para Jugadores
"""
from datetime import datetime
from bson import ObjectId
from bson.errors import InvalidId
from typing import List, Dict, Optional
from app.models.player import Player
from app.utils.database import get_db
import logging
import requests

logger = logging.getLogger(__name__)

class PlayerService:
    """Servicio para gestión de jugadores"""
    
    def __init__(self):
        self.collection_name = 'players'
    
    def get_collection(self):
        """Obtiene la colección de jugadores"""
        db = get_db()
        return db[self.collection_name]
    
    def get_all_players(self, filters: Dict = None) -> List[Dict]:
        """
        Obtiene todos los jugadores con filtros opcionales
        """
        try:
            collection = self.get_collection()
            
            # Preparar query
            query = {}
            if filters:
                if 'equipoId' in filters:
                    query['equipoId'] = int(filters['equipoId'])
                if 'activo' in filters:
                    query['activo'] = filters['activo'] == 'true'
                if 'posicion' in filters:
                    query['posicion'] = filters['posicion']
            
            # Buscar jugadores
            players = list(collection.find(query))
            
            # Convertir a lista de diccionarios
            result = []
            for player_doc in players:
                player = Player.from_mongo(player_doc)
                result.append(player.to_dict())
            
            logger.info(f"Encontrados {len(result)} jugadores")
            return result
            
        except Exception as e:
            logger.error(f"Error obteniendo jugadores: {str(e)}")
            raise
    
    def get_player_by_id(self, player_id: str) -> Optional[Dict]:
        """
        Obtiene un jugador por su ID
        """
        try:
            collection = self.get_collection()
            
            # Convertir string a ObjectId
            obj_id = ObjectId(player_id)
            
            # Buscar jugador
            player_doc = collection.find_one({'_id': obj_id})
            
            if not player_doc:
                logger.warning(f"Jugador no encontrado: {player_id}")
                return None
            
            player = Player.from_mongo(player_doc)
            return player.to_dict()
            
        except InvalidId:
            logger.error(f"ID inválido: {player_id}")
            return None
        except Exception as e:
            logger.error(f"Error obteniendo jugador: {str(e)}")
            raise
    
    def get_players_by_team(self, team_id: int) -> List[Dict]:
        """
        Obtiene todos los jugadores de un equipo
        """
        try:
            collection = self.get_collection()
            
            # Buscar jugadores del equipo
            players = list(collection.find({'equipoId': team_id}))
            
            result = []
            for player_doc in players:
                player = Player.from_mongo(player_doc)
                result.append(player.to_dict())
            
            logger.info(f"Encontrados {len(result)} jugadores del equipo {team_id}")
            return result
            
        except Exception as e:
            logger.error(f"Error obteniendo jugadores del equipo: {str(e)}")
            raise
    
    def create_player(self, player_data: Dict, teams_service_url: str = None) -> Dict:
        """
        Crea un nuevo jugador
        """
        try:
            # Validar que el equipo existe (opcional)
            if teams_service_url:
                team_id = player_data.get('equipoId')
                if not self._verify_team_exists(team_id, teams_service_url):
                    raise ValueError(f"El equipo con ID {team_id} no existe")
            
            collection = self.get_collection()
            
            # Crear modelo de jugador
            player = Player(player_data)
            player.createdAt = datetime.utcnow()
            player.updatedAt = datetime.utcnow()
            
            # Validar
            is_valid, error_msg = player.validate()
            if not is_valid:
                raise ValueError(error_msg)
            
            # Verificar que no exista el mismo número de camiseta en el equipo
            existing = collection.find_one({
                'equipoId': player.equipoId,
                'numeroCamiseta': player.numeroCamiseta
            })
            
            if existing:
                raise ValueError(
                    f"Ya existe un jugador con el número {player.numeroCamiseta} en este equipo"
                )
            
            # Insertar en MongoDB
            player_mongo = player.to_mongo()
            result = collection.insert_one(player_mongo)
            
            # Obtener jugador creado
            player._id = result.inserted_id
            created_player = player.to_dict()
            
            logger.info(f"Jugador creado: {created_player['_id']}")
            return created_player
            
        except ValueError as e:
            logger.error(f"Error de validación: {str(e)}")
            raise
        except Exception as e:
            logger.error(f"Error creando jugador: {str(e)}")
            raise
    
    def update_player(self, player_id: str, update_data: Dict) -> Optional[Dict]:
        """
        Actualiza un jugador existente
        """
        try:
            collection = self.get_collection()
            obj_id = ObjectId(player_id)
            
            # Verificar que existe
            existing = collection.find_one({'_id': obj_id})
            if not existing:
                return None
            
            # Procesar nombreCompleto si viene (dividir en nombre y apellidos)
            if 'nombreCompleto' in update_data and update_data['nombreCompleto']:
                partes = update_data['nombreCompleto'].split(' ', 1)
                update_data['nombre'] = partes[0] if len(partes) > 0 else ''
                update_data['apellidos'] = partes[1] if len(partes) > 1 else ''
                # Remover nombreCompleto del update (no se guarda en DB)
                del update_data['nombreCompleto']
            
            # Manejar alias: numero → numeroCamiseta
            if 'numero' in update_data:
                update_data['numeroCamiseta'] = update_data['numero']
                del update_data['numero']
            
            # Manejar alias: estatura → altura
            if 'estatura' in update_data:
                update_data['altura'] = update_data['estatura']
                del update_data['estatura']
            
            # Manejar alias: isActivo → activo (para compatibilidad con frontend Angular)
            if 'isActivo' in update_data:
                update_data['activo'] = update_data['isActivo']
                del update_data['isActivo']
            
            # Preparar actualización
            update_data['updatedAt'] = datetime.utcnow()
            
            # Si se cambia equipoId o numeroCamiseta, validar unicidad
            if 'equipoId' in update_data or 'numeroCamiseta' in update_data:
                equipo_id = update_data.get('equipoId', existing['equipoId'])
                numero = update_data.get('numeroCamiseta', existing['numeroCamiseta'])
                
                duplicate = collection.find_one({
                    'equipoId': equipo_id,
                    'numeroCamiseta': numero,
                    '_id': {'$ne': obj_id}
                })
                
                if duplicate:
                    raise ValueError(
                        f"Ya existe un jugador con el número {numero} en este equipo"
                    )
            
            # Actualizar
            collection.update_one(
                {'_id': obj_id},
                {'$set': update_data}
            )
            
            # Obtener jugador actualizado
            updated_doc = collection.find_one({'_id': obj_id})
            player = Player.from_mongo(updated_doc)
            
            logger.info(f"Jugador actualizado: {player_id}")
            return player.to_dict()
            
        except InvalidId:
            logger.error(f"ID inválido: {player_id}")
            return None
        except ValueError as e:
            logger.error(f"Error de validación: {str(e)}")
            raise
        except Exception as e:
            logger.error(f"Error actualizando jugador: {str(e)}")
            raise
    
    def delete_player(self, player_id: str) -> bool:
        """
        Elimina un jugador (soft delete - marca como inactivo)
        """
        try:
            collection = self.get_collection()
            obj_id = ObjectId(player_id)
            
            # Marcar como inactivo
            result = collection.update_one(
                {'_id': obj_id},
                {
                    '$set': {
                        'activo': False,
                        'updatedAt': datetime.utcnow()
                    }
                }
            )
            
            if result.modified_count > 0:
                logger.info(f"Jugador eliminado (soft): {player_id}")
                return True
            
            return False
            
        except InvalidId:
            logger.error(f"ID inválido: {player_id}")
            return False
        except Exception as e:
            logger.error(f"Error eliminando jugador: {str(e)}")
            raise
    
    def update_player_stats(self, player_id: str, stats: Dict) -> Optional[Dict]:
        """
        Actualiza las estadísticas de un jugador
        """
        try:
            collection = self.get_collection()
            obj_id = ObjectId(player_id)
            
            # Preparar actualización
            update_data = {
                'updatedAt': datetime.utcnow()
            }
            
            # Actualizar campos de estadísticas
            for key, value in stats.items():
                update_data[f'estadisticas.{key}'] = value
            
            # Actualizar
            result = collection.update_one(
                {'_id': obj_id},
                {'$set': update_data}
            )
            
            if result.modified_count == 0:
                return None
            
            # Obtener jugador actualizado
            updated_doc = collection.find_one({'_id': obj_id})
            player = Player.from_mongo(updated_doc)
            
            logger.info(f"Estadísticas actualizadas: {player_id}")
            return player.to_dict()
            
        except InvalidId:
            logger.error(f"ID inválido: {player_id}")
            return None
        except Exception as e:
            logger.error(f"Error actualizando estadísticas: {str(e)}")
            raise
    
    def _verify_team_exists(self, team_id: int, teams_service_url: str) -> bool:
        """
        Verifica que un equipo existe llamando al teams-service
        """
        try:
            response = requests.get(
                f"{teams_service_url}/{team_id}",
                timeout=5
            )
            return response.status_code == 200
        except Exception as e:
            logger.warning(f"No se pudo verificar equipo: {str(e)}")
            # En caso de error, permitir la operación
            return True

"""
Blueprint para endpoints de jugadores
"""
from flask import Blueprint, request, jsonify, current_app
from marshmallow import ValidationError
from app.services.player_service import PlayerService
from app.schemas.player_schema import (
    PlayerCreateSchema,
    PlayerUpdateSchema,
    PlayerResponseSchema,
    StatsUpdateSchema
)
import logging

logger = logging.getLogger(__name__)

players_bp = Blueprint('players', __name__)
player_service = PlayerService()

# Schemas
create_schema = PlayerCreateSchema()
update_schema = PlayerUpdateSchema()
response_schema = PlayerResponseSchema()
stats_schema = StatsUpdateSchema()


@players_bp.route('', methods=['GET'])
def get_all_players():
    """
    GET /api/players
    Obtiene todos los jugadores con filtros opcionales
    Query params: equipoId, activo, posicion
    """
    try:
        filters = {}
        
        # Filtros desde query params
        if request.args.get('equipoId'):
            filters['equipoId'] = request.args.get('equipoId')
        if request.args.get('activo'):
            filters['activo'] = request.args.get('activo')
        if request.args.get('posicion'):
            filters['posicion'] = request.args.get('posicion')
        
        players = player_service.get_all_players(filters)
        
        return jsonify({
            'success': True,
            'count': len(players),
            'data': players
        }), 200
        
    except Exception as e:
        logger.error(f"Error en GET /api/players: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Error obteniendo jugadores',
            'message': str(e)
        }), 500


@players_bp.route('/<player_id>', methods=['GET'])
def get_player(player_id):
    """
    GET /api/players/:id
    Obtiene un jugador por ID
    """
    try:
        player = player_service.get_player_by_id(player_id)
        
        if not player:
            return jsonify({
                'success': False,
                'error': 'Jugador no encontrado'
            }), 404
        
        return jsonify({
            'success': True,
            'data': player
        }), 200
        
    except Exception as e:
        logger.error(f"Error en GET /api/players/{player_id}: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Error obteniendo jugador',
            'message': str(e)
        }), 500


@players_bp.route('/team/<int:team_id>', methods=['GET'])
def get_players_by_team(team_id):
    """
    GET /api/players/team/:teamId
    Obtiene todos los jugadores de un equipo
    """
    try:
        players = player_service.get_players_by_team(team_id)
        
        return jsonify({
            'success': True,
            'teamId': team_id,
            'count': len(players),
            'data': players
        }), 200
        
    except Exception as e:
        logger.error(f"Error en GET /api/players/team/{team_id}: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Error obteniendo jugadores del equipo',
            'message': str(e)
        }), 500


@players_bp.route('', methods=['POST'])
def create_player():
    """
    POST /api/players
    Crea un nuevo jugador
    """
    try:
        # Validar datos
        data = create_schema.load(request.json)
        
        # Obtener URL del teams-service
        teams_url = current_app.config.get('TEAMS_SERVICE_URL')
        
        # Crear jugador
        player = player_service.create_player(data, teams_url)
        
        return jsonify({
            'success': True,
            'message': 'Jugador creado exitosamente',
            'data': player
        }), 201
        
    except ValidationError as e:
        logger.warning(f"Error de validación: {e.messages}")
        return jsonify({
            'success': False,
            'error': 'Datos inválidos',
            'details': e.messages
        }), 400
        
    except ValueError as e:
        logger.warning(f"Error de negocio: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400
        
    except Exception as e:
        logger.error(f"Error en POST /api/players: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Error creando jugador',
            'message': str(e)
        }), 500


@players_bp.route('/<player_id>', methods=['PUT'])
def update_player(player_id):
    """
    PUT /api/players/:id
    Actualiza un jugador existente
    """
    try:
        # Validar datos
        data = update_schema.load(request.json)
        
        # Actualizar jugador
        player = player_service.update_player(player_id, data)
        
        if not player:
            return jsonify({
                'success': False,
                'error': 'Jugador no encontrado'
            }), 404
        
        return jsonify({
            'success': True,
            'message': 'Jugador actualizado exitosamente',
            'data': player
        }), 200
        
    except ValidationError as e:
        logger.warning(f"Error de validación: {e.messages}")
        return jsonify({
            'success': False,
            'error': 'Datos inválidos',
            'details': e.messages
        }), 400
        
    except ValueError as e:
        logger.warning(f"Error de negocio: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400
        
    except Exception as e:
        logger.error(f"Error en PUT /api/players/{player_id}: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Error actualizando jugador',
            'message': str(e)
        }), 500


@players_bp.route('/<player_id>', methods=['DELETE'])
def delete_player(player_id):
    """
    DELETE /api/players/:id
    Elimina un jugador (soft delete)
    """
    try:
        success = player_service.delete_player(player_id)
        
        if not success:
            return jsonify({
                'success': False,
                'error': 'Jugador no encontrado'
            }), 404
        
        return jsonify({
            'success': True,
            'message': 'Jugador eliminado exitosamente'
        }), 200
        
    except Exception as e:
        logger.error(f"Error en DELETE /api/players/{player_id}: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Error eliminando jugador',
            'message': str(e)
        }), 500


@players_bp.route('/<player_id>/stats', methods=['GET'])
def get_player_stats(player_id):
    """
    GET /api/players/:id/stats
    Obtiene las estadísticas de un jugador
    """
    try:
        player = player_service.get_player_by_id(player_id)
        
        if not player:
            return jsonify({
                'success': False,
                'error': 'Jugador no encontrado'
            }), 404
        
        return jsonify({
            'success': True,
            'playerId': player_id,
            'nombre': f"{player['nombre']} {player['apellidos']}",
            'data': player.get('estadisticas', {})
        }), 200
        
    except Exception as e:
        logger.error(f"Error en GET /api/players/{player_id}/stats: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Error obteniendo estadísticas',
            'message': str(e)
        }), 500


@players_bp.route('/<player_id>/stats', methods=['PUT'])
def update_player_stats(player_id):
    """
    PUT /api/players/:id/stats
    Actualiza las estadísticas de un jugador
    """
    try:
        # Validar datos
        stats = stats_schema.load(request.json)
        
        # Actualizar estadísticas
        player = player_service.update_player_stats(player_id, stats)
        
        if not player:
            return jsonify({
                'success': False,
                'error': 'Jugador no encontrado'
            }), 404
        
        return jsonify({
            'success': True,
            'message': 'Estadísticas actualizadas exitosamente',
            'data': player
        }), 200
        
    except ValidationError as e:
        logger.warning(f"Error de validación: {e.messages}")
        return jsonify({
            'success': False,
            'error': 'Datos inválidos',
            'details': e.messages
        }), 400
        
    except Exception as e:
        logger.error(f"Error en PUT /api/players/{player_id}/stats: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Error actualizando estadísticas',
            'message': str(e)
        }), 500

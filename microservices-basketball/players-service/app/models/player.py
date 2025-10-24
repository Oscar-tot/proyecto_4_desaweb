"""
Modelo de Jugador para MongoDB
"""
from datetime import datetime
from bson import ObjectId
from typing import Dict, Optional

class Player:
    """Modelo de Jugador"""
    
    def __init__(self, data: Dict = None):
        if data is None:
            data = {}
        
        # Manejar nombreCompleto (dividir en nombre y apellidos)
        if data.get('nombreCompleto') and not (data.get('nombre') or data.get('apellidos')):
            partes = data.get('nombreCompleto', '').split(' ', 1)
            self.nombre = partes[0] if len(partes) > 0 else ''
            self.apellidos = partes[1] if len(partes) > 1 else ''
        else:
            self.nombre = data.get('nombre', '')
            self.apellidos = data.get('apellidos', '')
            
        self._id = data.get('_id')
        self.fechaNacimiento = data.get('fechaNacimiento')
        self.edad = data.get('edad')
        self.posicion = data.get('posicion', '')
        
        # Acepta 'numero' o 'numeroCamiseta'
        self.numeroCamiseta = data.get('numeroCamiseta') or data.get('numero')
        
        # Acepta 'estatura' o 'altura'
        self.altura = data.get('altura') or data.get('estatura') or 0.0
        
        self.peso = data.get('peso', 0.0)
        self.nacionalidad = data.get('nacionalidad', '')
        self.foto = data.get('foto', '')
        self.equipoId = data.get('equipoId')
        self.equipoNombre = data.get('equipoNombre', '')
        self.estadisticas = data.get('estadisticas', {})
        
        # Acepta 'activo' o 'isActivo' (compatibilidad con frontend Angular)
        self.activo = data.get('activo') if data.get('activo') is not None else data.get('isActivo', True)
        
        self.createdAt = data.get('createdAt', datetime.utcnow())
        self.updatedAt = data.get('updatedAt', datetime.utcnow())
    
    def to_dict(self) -> Dict:
        """Convierte el modelo a diccionario"""
        return {
            '_id': str(self._id) if self._id else None,
            'nombre': self.nombre,
            'apellidos': self.apellidos,
            'nombreCompleto': f"{self.nombre} {self.apellidos}".strip(),
            'fechaNacimiento': self.fechaNacimiento,
            'edad': self.edad,
            'posicion': self.posicion,
            'numeroCamiseta': self.numeroCamiseta,
            'numero': self.numeroCamiseta,  # Alias para frontend
            'altura': self.altura,
            'estatura': self.altura,  # Alias para frontend
            'peso': self.peso,
            'nacionalidad': self.nacionalidad,
            'foto': self.foto,
            'equipoId': self.equipoId,
            'equipoNombre': self.equipoNombre,
            'estadisticas': self.estadisticas,
            'activo': self.activo,
            'isActivo': self.activo,  # Alias para frontend Angular
            'createdAt': self.createdAt.isoformat() if isinstance(self.createdAt, datetime) else self.createdAt,
            'updatedAt': self.updatedAt.isoformat() if isinstance(self.updatedAt, datetime) else self.updatedAt
        }
    
    def to_mongo(self) -> Dict:
        """Convierte el modelo a formato MongoDB (sin _id si es None)"""
        data = {
            'nombre': self.nombre,
            'apellidos': self.apellidos,
            'fechaNacimiento': self.fechaNacimiento,
            'edad': self.edad,
            'posicion': self.posicion,
            'numeroCamiseta': self.numeroCamiseta,
            'altura': self.altura,
            'peso': self.peso,
            'nacionalidad': self.nacionalidad,
            'foto': self.foto,
            'equipoId': self.equipoId,
            'equipoNombre': self.equipoNombre,
            'estadisticas': self.estadisticas or self._default_stats(),
            'activo': self.activo,
            'createdAt': self.createdAt,
            'updatedAt': self.updatedAt
        }
        
        if self._id:
            data['_id'] = self._id if isinstance(self._id, ObjectId) else ObjectId(self._id)
        
        return data
    
    @staticmethod
    def _default_stats() -> Dict:
        """Estadísticas por defecto"""
        return {
            'partidosJugados': 0,
            'promedioMinutos': 0.0,
            'promedioAnotaciones': 0.0,
            'promedioRebotes': 0.0,
            'promedioAsistencias': 0.0,
            'promedioRobos': 0.0,
            'promedioBloqueos': 0.0,
            'porcentajeTirosCampo': 0.0,
            'porcentajeTiros3Puntos': 0.0,
            'porcentajeTirosLibres': 0.0
        }
    
    @staticmethod
    def from_mongo(data: Dict) -> 'Player':
        """Crea un Player desde un documento MongoDB"""
        if data is None:
            return None
        return Player(data)
    
    def validate(self) -> tuple[bool, Optional[str]]:
        """Valida los datos del jugador"""
        if not self.nombre or not self.nombre.strip():
            return False, "El nombre es requerido"
        
        if not self.apellidos or not self.apellidos.strip():
            return False, "Los apellidos son requeridos"
        
        if not self.posicion:
            return False, "La posición es requerida"
        
        if self.posicion not in ['Base', 'Escolta', 'Alero', 'Ala-Pívot', 'Pívot']:
            return False, "Posición inválida"
        
        if not self.numeroCamiseta or self.numeroCamiseta < 0 or self.numeroCamiseta > 99:
            return False, "El número de camiseta debe estar entre 0 y 99"
        
        if not self.equipoId:
            return False, "El ID del equipo es requerido"
        
        if self.altura and (self.altura < 1.50 or self.altura > 2.50):
            return False, "La altura debe estar entre 1.50 y 2.50 metros"
        
        if self.peso and (self.peso < 50 or self.peso > 200):
            return False, "El peso debe estar entre 50 y 200 kg"
        
        return True, None

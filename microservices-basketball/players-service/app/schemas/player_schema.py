"""
Schemas de validación para Players usando Marshmallow
"""
from marshmallow import Schema, fields, validate, ValidationError, validates_schema, EXCLUDE

class EstadisticasSchema(Schema):
    """Schema para estadísticas del jugador"""
    class Meta:
        unknown = EXCLUDE
    
    partidosJugados = fields.Integer(missing=0, data_key='partidosJugados')
    promedioMinutos = fields.Float(missing=0.0, data_key='promedioMinutos')
    promedioAnotaciones = fields.Float(missing=0.0, data_key='promedioAnotaciones')
    promedioRebotes = fields.Float(missing=0.0, data_key='promedioRebotes')
    promedioAsistencias = fields.Float(missing=0.0, data_key='promedioAsistencias')
    promedioRobos = fields.Float(missing=0.0, data_key='promedioRobos')
    promedioBloqueos = fields.Float(missing=0.0, data_key='promedioBloqueos')
    porcentajeTirosCampo = fields.Float(missing=0.0, data_key='porcentajeTirosCampo')
    porcentajeTiros3Puntos = fields.Float(missing=0.0, data_key='porcentajeTiros3Puntos')
    porcentajeTirosLibres = fields.Float(missing=0.0, data_key='porcentajeTirosLibres')


class PlayerCreateSchema(Schema):
    """Schema para crear jugador"""
    class Meta:
        unknown = EXCLUDE
    
    # Nombre completo (dividiremos en nombre y apellidos)
    nombreCompleto = fields.Str(required=False, validate=validate.Length(min=1, max=200))
    # O nombre y apellidos separados (para compatibilidad)
    nombre = fields.Str(required=False, validate=validate.Length(min=1, max=100))
    apellidos = fields.Str(required=False, validate=validate.Length(min=1, max=100))
    
    fechaNacimiento = fields.Date(required=False, allow_none=True)
    edad = fields.Integer(required=False, allow_none=True, validate=validate.Range(min=15, max=60))
    
    posicion = fields.Str(
        required=True,
        validate=validate.OneOf(['Base', 'Escolta', 'Alero', 'Ala-Pívot', 'Pívot'])
    )
    
    # Acepta tanto 'numero' como 'numeroCamiseta'
    numero = fields.Integer(required=False, validate=validate.Range(min=0, max=99))
    numeroCamiseta = fields.Integer(required=False, validate=validate.Range(min=0, max=99))
    
    # Acepta tanto 'estatura' como 'altura'
    estatura = fields.Float(required=False, validate=validate.Range(min=1.50, max=2.50))
    altura = fields.Float(required=False, validate=validate.Range(min=1.50, max=2.50))
    
    peso = fields.Float(required=False, validate=validate.Range(min=50, max=200))
    
    nacionalidad = fields.Str(required=False, allow_none=True, validate=validate.Length(max=100))
    foto = fields.Str(required=False, allow_none=True, validate=validate.Length(max=500))
    
    equipoId = fields.Integer(required=True)
    equipoNombre = fields.Str(required=False, allow_none=True)
    activo = fields.Boolean(missing=True)
    isActivo = fields.Boolean(missing=True)  # Alias para frontend Angular
    
    @validates_schema
    def validate_nombre(self, data, **kwargs):
        """Validar que haya nombre completo O nombre+apellidos"""
        if not data.get('nombreCompleto') and not (data.get('nombre') and data.get('apellidos')):
            raise ValidationError('Debe proporcionar nombreCompleto o nombre y apellidos')
    
    @validates_schema
    def validate_numero(self, data, **kwargs):
        """Validar que haya al menos numero o numeroCamiseta"""
        if not data.get('numero') and not data.get('numeroCamiseta'):
            raise ValidationError('Debe proporcionar numero o numeroCamiseta')


class PlayerUpdateSchema(Schema):
    """Schema para actualizar jugador"""
    class Meta:
        unknown = EXCLUDE
    
    # Nombre completo (dividiremos en nombre y apellidos)
    nombreCompleto = fields.Str(required=False, validate=validate.Length(min=1, max=200))
    # O nombre y apellidos separados
    nombre = fields.Str(validate=validate.Length(min=1, max=100))
    apellidos = fields.Str(validate=validate.Length(min=1, max=100))
    
    fechaNacimiento = fields.Date(allow_none=True)
    edad = fields.Integer(allow_none=True, validate=validate.Range(min=15, max=60))
    
    posicion = fields.Str(
        validate=validate.OneOf(['Base', 'Escolta', 'Alero', 'Ala-Pívot', 'Pívot'])
    )
    
    # Acepta tanto 'numero' como 'numeroCamiseta'
    numero = fields.Integer(validate=validate.Range(min=0, max=99))
    numeroCamiseta = fields.Integer(validate=validate.Range(min=0, max=99))
    
    # Acepta tanto 'estatura' como 'altura'
    estatura = fields.Float(validate=validate.Range(min=1.50, max=2.50))
    altura = fields.Float(validate=validate.Range(min=1.50, max=2.50))
    
    peso = fields.Float(validate=validate.Range(min=50, max=200))
    
    nacionalidad = fields.Str(allow_none=True, validate=validate.Length(max=100))
    foto = fields.Str(allow_none=True, validate=validate.Length(max=500))
    
    equipoId = fields.Integer()
    equipoNombre = fields.Str(allow_none=True)
    activo = fields.Boolean()
    isActivo = fields.Boolean()  # Alias para frontend Angular


class PlayerResponseSchema(Schema):
    """Schema para respuesta de jugador"""
    class Meta:
        unknown = EXCLUDE
    
    _id = fields.Str()
    nombre = fields.Str()
    apellidos = fields.Str()
    nombreCompleto = fields.Str()
    fechaNacimiento = fields.Date(allow_none=True)
    edad = fields.Integer(allow_none=True)
    posicion = fields.Str()
    numeroCamiseta = fields.Integer()
    numero = fields.Integer()  # Alias
    altura = fields.Float()
    estatura = fields.Float()  # Alias
    peso = fields.Float()
    nacionalidad = fields.Str(allow_none=True)
    foto = fields.Str(allow_none=True)
    equipoId = fields.Integer()
    equipoNombre = fields.Str()
    estadisticas = fields.Nested(EstadisticasSchema)
    activo = fields.Boolean()
    createdAt = fields.DateTime()
    updatedAt = fields.DateTime()


class StatsUpdateSchema(Schema):
    """Schema para actualizar estadísticas"""
    class Meta:
        unknown = EXCLUDE
    
    partidosJugados = fields.Integer()
    promedioMinutos = fields.Float()
    promedioAnotaciones = fields.Float()
    promedioRebotes = fields.Float()
    promedioAsistencias = fields.Float()
    promedioRobos = fields.Float()
    promedioBloqueos = fields.Float()
    porcentajeTirosCampo = fields.Float()
    porcentajeTiros3Puntos = fields.Float()
    porcentajeTirosLibres = fields.Float()

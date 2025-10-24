using TeamsService.DTOs;
using TeamsService.Models;
using TeamsService.Repositories;
using TeamsService.Services.Events;

namespace TeamsService.Services
{
    public class EquipoService : IEquipoService
    {
        private readonly IEquipoRepository _equipoRepository;
        private readonly IEventPublisher _eventPublisher;
        private readonly ILogger<EquipoService> _logger;

        public EquipoService(
            IEquipoRepository equipoRepository,
            IEventPublisher eventPublisher,
            ILogger<EquipoService> logger)
        {
            _equipoRepository = equipoRepository;
            _eventPublisher = eventPublisher;
            _logger = logger;
        }

        public async Task<IEnumerable<EquipoResponseDto>> GetAllEquiposAsync()
        {
            var equipos = await _equipoRepository.GetAllAsync();
            return equipos.Select(MapToResponseDto);
        }

        public async Task<EquipoResponseDto?> GetEquipoByIdAsync(int id)
        {
            var equipo = await _equipoRepository.GetByIdAsync(id);
            return equipo == null ? null : MapToResponseDto(equipo);
        }

        public async Task<IEnumerable<EquipoResponseDto>> SearchEquiposAsync(string searchTerm)
        {
            var equipos = await _equipoRepository.SearchAsync(searchTerm);
            return equipos.Select(MapToResponseDto);
        }

        public async Task<EquipoResponseDto> CreateEquipoAsync(EquipoCreateDto equipoDto)
        {
            // Validar nombre único
            if (await _equipoRepository.NombreExistsAsync(equipoDto.Nombre))
            {
                throw new InvalidOperationException($"Ya existe un equipo con el nombre '{equipoDto.Nombre}'");
            }

            var equipo = new Equipo
            {
                Nombre = equipoDto.Nombre,
                Ciudad = equipoDto.Ciudad,
                Logo = equipoDto.Logo,
                Descripcion = equipoDto.Descripcion,
                FechaCreacion = DateTime.UtcNow,
                IsActivo = true
            };

            var createdEquipo = await _equipoRepository.CreateAsync(equipo);

            // Publicar evento para otros microservicios
            await _eventPublisher.PublishTeamCreatedAsync(new TeamCreatedEvent
            {
                TeamId = createdEquipo.Id,
                TeamName = createdEquipo.Nombre,
                City = createdEquipo.Ciudad,
                Logo = createdEquipo.Logo,
                Timestamp = DateTime.UtcNow
            });

            _logger.LogInformation("Equipo creado: {EquipoId} - {EquipoNombre}", createdEquipo.Id, createdEquipo.Nombre);

            return MapToResponseDto(createdEquipo);
        }

        public async Task<EquipoResponseDto?> UpdateEquipoAsync(int id, EquipoUpdateDto equipoDto)
        {
            var equipo = await _equipoRepository.GetByIdAsync(id);
            if (equipo == null)
                return null;

            // Validar nombre único (excluyendo el equipo actual)
            if (await _equipoRepository.NombreExistsAsync(equipoDto.Nombre, id))
            {
                throw new InvalidOperationException($"Ya existe otro equipo con el nombre '{equipoDto.Nombre}'");
            }

            equipo.Nombre = equipoDto.Nombre;
            equipo.Ciudad = equipoDto.Ciudad;
            equipo.Logo = equipoDto.Logo;
            equipo.Descripcion = equipoDto.Descripcion;
            equipo.IsActivo = equipoDto.IsActivo;

            var updatedEquipo = await _equipoRepository.UpdateAsync(equipo);

            // Publicar evento de actualización
            await _eventPublisher.PublishTeamUpdatedAsync(new TeamUpdatedEvent
            {
                TeamId = updatedEquipo.Id,
                TeamName = updatedEquipo.Nombre,
                City = updatedEquipo.Ciudad,
                Logo = updatedEquipo.Logo,
                IsActive = updatedEquipo.IsActivo,
                Timestamp = DateTime.UtcNow
            });

            _logger.LogInformation("Equipo actualizado: {EquipoId} - {EquipoNombre}", updatedEquipo.Id, updatedEquipo.Nombre);

            return MapToResponseDto(updatedEquipo);
        }

        public async Task<bool> DeleteEquipoAsync(int id)
        {
            var result = await _equipoRepository.DeleteAsync(id);
            
            if (result)
            {
                // Publicar evento de eliminación (soft delete)
                await _eventPublisher.PublishTeamDeletedAsync(new TeamDeletedEvent
                {
                    TeamId = id,
                    Timestamp = DateTime.UtcNow
                });

                _logger.LogInformation("Equipo eliminado (soft delete): {EquipoId}", id);
            }

            return result;
        }

        private static EquipoResponseDto MapToResponseDto(Equipo equipo)
        {
            return new EquipoResponseDto
            {
                Id = equipo.Id,
                Nombre = equipo.Nombre,
                Ciudad = equipo.Ciudad,
                Logo = equipo.Logo,
                Descripcion = equipo.Descripcion,
                FechaCreacion = equipo.FechaCreacion,
                IsActivo = equipo.IsActivo
            };
        }
    }
}

using Microsoft.AspNetCore.Mvc;
using TeamsService.DTOs;
using TeamsService.Services;

namespace TeamsService.Controllers
{
    [ApiController]
    [Route("api/teams")]
    public class EquiposController : ControllerBase
    {
        private readonly IEquipoService _equipoService;
        private readonly ILogger<EquiposController> _logger;

        public EquiposController(IEquipoService equipoService, ILogger<EquiposController> logger)
        {
            _equipoService = equipoService;
            _logger = logger;
        }

        /// <summary>
        /// Obtiene todos los equipos activos
        /// </summary>
        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<EquipoResponseDto>), 200)]
        public async Task<ActionResult<IEnumerable<EquipoResponseDto>>> GetEquipos()
        {
            try
            {
                var equipos = await _equipoService.GetAllEquiposAsync();
                return Ok(equipos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener equipos");
                return StatusCode(500, new { message = "Error al obtener equipos" });
            }
        }

        /// <summary>
        /// Busca equipos por nombre o ciudad
        /// </summary>
        [HttpGet("search")]
        [ProducesResponseType(typeof(IEnumerable<EquipoResponseDto>), 200)]
        public async Task<ActionResult<IEnumerable<EquipoResponseDto>>> SearchEquipos([FromQuery] string searchTerm)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(searchTerm))
                {
                    return BadRequest(new { message = "El término de búsqueda es requerido" });
                }

                var equipos = await _equipoService.SearchEquiposAsync(searchTerm);
                return Ok(equipos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al buscar equipos con término: {SearchTerm}", searchTerm);
                return StatusCode(500, new { message = "Error al buscar equipos" });
            }
        }

        /// <summary>
        /// Obtiene un equipo específico por ID
        /// </summary>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(EquipoResponseDto), 200)]
        [ProducesResponseType(404)]
        public async Task<ActionResult<EquipoResponseDto>> GetEquipo(int id)
        {
            try
            {
                var equipo = await _equipoService.GetEquipoByIdAsync(id);
                
                if (equipo == null)
                {
                    return NotFound(new { message = $"Equipo con ID {id} no encontrado" });
                }

                return Ok(equipo);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener equipo con ID: {EquipoId}", id);
                return StatusCode(500, new { message = "Error al obtener equipo" });
            }
        }

        /// <summary>
        /// Crea un nuevo equipo
        /// </summary>
        [HttpPost]
        [ProducesResponseType(typeof(EquipoResponseDto), 201)]
        [ProducesResponseType(400)]
        public async Task<ActionResult<EquipoResponseDto>> CreateEquipo([FromBody] EquipoCreateDto equipoDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var equipo = await _equipoService.CreateEquipoAsync(equipoDto);
                return CreatedAtAction(nameof(GetEquipo), new { id = equipo.Id }, equipo);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear equipo: {EquipoNombre}", equipoDto.Nombre);
                return StatusCode(500, new { message = "Error al crear equipo" });
            }
        }

        /// <summary>
        /// Actualiza un equipo existente
        /// </summary>
        [HttpPut("{id}")]
        [ProducesResponseType(typeof(EquipoResponseDto), 200)]
        [ProducesResponseType(404)]
        public async Task<ActionResult<EquipoResponseDto>> UpdateEquipo(int id, [FromBody] EquipoUpdateDto equipoDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var equipo = await _equipoService.UpdateEquipoAsync(id, equipoDto);
                
                if (equipo == null)
                {
                    return NotFound(new { message = $"Equipo con ID {id} no encontrado" });
                }

                return Ok(equipo);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al actualizar equipo con ID: {EquipoId}", id);
                return StatusCode(500, new { message = "Error al actualizar equipo" });
            }
        }

        /// <summary>
        /// Elimina un equipo (soft delete)
        /// </summary>
        [HttpDelete("{id}")]
        [ProducesResponseType(204)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> DeleteEquipo(int id)
        {
            try
            {
                var result = await _equipoService.DeleteEquipoAsync(id);
                
                if (!result)
                {
                    return NotFound(new { message = $"Equipo con ID {id} no encontrado" });
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al eliminar equipo con ID: {EquipoId}", id);
                return StatusCode(500, new { message = "Error al eliminar equipo" });
            }
        }

        /// <summary>
        /// Health check endpoint
        /// </summary>
        [HttpGet("/health")]
        public IActionResult HealthCheck()
        {
            return Ok(new
            {
                service = "teams-service",
                status = "healthy",
                timestamp = DateTime.UtcNow
            });
        }
    }
}

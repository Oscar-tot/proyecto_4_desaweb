using System.ComponentModel.DataAnnotations;

namespace TeamsService.Models
{
    public class Equipo
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Nombre { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string Ciudad { get; set; } = string.Empty;

        [StringLength(500)]
        public string? Logo { get; set; } // URL del logo

        [StringLength(200)]
        public string? Descripcion { get; set; }

        public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

        public bool IsActivo { get; set; } = true;

        // NOTA: Removemos la relación con Jugadores ya que ahora está en otro microservicio
        // La relación se mantendrá mediante el EquipoId en players-service
    }
}

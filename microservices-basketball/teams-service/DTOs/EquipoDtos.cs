using System.ComponentModel.DataAnnotations;

namespace TeamsService.DTOs
{
    public class EquipoCreateDto
    {
        [Required(ErrorMessage = "El nombre del equipo es requerido")]
        [StringLength(100, ErrorMessage = "El nombre no puede exceder 100 caracteres")]
        public string Nombre { get; set; } = string.Empty;

        [Required(ErrorMessage = "La ciudad es requerida")]
        [StringLength(100, ErrorMessage = "La ciudad no puede exceder 100 caracteres")]
        public string Ciudad { get; set; } = string.Empty;

        [StringLength(500, ErrorMessage = "La URL del logo no puede exceder 500 caracteres")]
        public string? Logo { get; set; }

        [StringLength(200, ErrorMessage = "La descripción no puede exceder 200 caracteres")]
        public string? Descripcion { get; set; }
    }

    public class EquipoUpdateDto
    {
        [Required(ErrorMessage = "El nombre del equipo es requerido")]
        [StringLength(100, ErrorMessage = "El nombre no puede exceder 100 caracteres")]
        public string Nombre { get; set; } = string.Empty;

        [Required(ErrorMessage = "La ciudad es requerida")]
        [StringLength(100, ErrorMessage = "La ciudad no puede exceder 100 caracteres")]
        public string Ciudad { get; set; } = string.Empty;

        [StringLength(500, ErrorMessage = "La URL del logo no puede exceder 500 caracteres")]
        public string? Logo { get; set; }

        [StringLength(200, ErrorMessage = "La descripción no puede exceder 200 caracteres")]
        public string? Descripcion { get; set; }

        public bool IsActivo { get; set; } = true;
    }

    public class EquipoResponseDto
    {
        public int Id { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string Ciudad { get; set; } = string.Empty;
        public string? Logo { get; set; }
        public string? Descripcion { get; set; }
        public DateTime FechaCreacion { get; set; }
        public bool IsActivo { get; set; }
    }
}

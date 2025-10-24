using TeamsService.DTOs;

namespace TeamsService.Services
{
    public interface IEquipoService
    {
        Task<IEnumerable<EquipoResponseDto>> GetAllEquiposAsync();
        Task<EquipoResponseDto?> GetEquipoByIdAsync(int id);
        Task<IEnumerable<EquipoResponseDto>> SearchEquiposAsync(string searchTerm);
        Task<EquipoResponseDto> CreateEquipoAsync(EquipoCreateDto equipoDto);
        Task<EquipoResponseDto?> UpdateEquipoAsync(int id, EquipoUpdateDto equipoDto);
        Task<bool> DeleteEquipoAsync(int id);
    }
}

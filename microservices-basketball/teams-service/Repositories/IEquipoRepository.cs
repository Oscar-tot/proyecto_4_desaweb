using TeamsService.Models;

namespace TeamsService.Repositories
{
    public interface IEquipoRepository
    {
        Task<IEnumerable<Equipo>> GetAllAsync();
        Task<Equipo?> GetByIdAsync(int id);
        Task<Equipo?> GetByNombreAsync(string nombre);
        Task<IEnumerable<Equipo>> SearchAsync(string searchTerm);
        Task<Equipo> CreateAsync(Equipo equipo);
        Task<Equipo> UpdateAsync(Equipo equipo);
        Task<bool> DeleteAsync(int id);
        Task<bool> ExistsAsync(int id);
        Task<bool> NombreExistsAsync(string nombre, int? excludeId = null);
    }
}

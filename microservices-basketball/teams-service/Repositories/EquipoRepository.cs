using Microsoft.EntityFrameworkCore;
using TeamsService.Data;
using TeamsService.Models;

namespace TeamsService.Repositories
{
    public class EquipoRepository : IEquipoRepository
    {
        private readonly TeamsDbContext _context;

        public EquipoRepository(TeamsDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Equipo>> GetAllAsync()
        {
            return await _context.Equipos
                .Where(e => e.IsActivo)
                .OrderBy(e => e.Nombre)
                .ToListAsync();
        }

        public async Task<Equipo?> GetByIdAsync(int id)
        {
            return await _context.Equipos
                .FirstOrDefaultAsync(e => e.Id == id && e.IsActivo);
        }

        public async Task<Equipo?> GetByNombreAsync(string nombre)
        {
            return await _context.Equipos
                .FirstOrDefaultAsync(e => e.Nombre == nombre && e.IsActivo);
        }

        public async Task<IEnumerable<Equipo>> SearchAsync(string searchTerm)
        {
            return await _context.Equipos
                .Where(e => e.IsActivo && 
                    (e.Nombre.Contains(searchTerm) || e.Ciudad.Contains(searchTerm)))
                .OrderBy(e => e.Nombre)
                .ToListAsync();
        }

        public async Task<Equipo> CreateAsync(Equipo equipo)
        {
            _context.Equipos.Add(equipo);
            await _context.SaveChangesAsync();
            return equipo;
        }

        public async Task<Equipo> UpdateAsync(Equipo equipo)
        {
            _context.Entry(equipo).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return equipo;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var equipo = await _context.Equipos.FindAsync(id);
            if (equipo == null)
                return false;

            // Soft delete
            equipo.IsActivo = false;
            _context.Entry(equipo).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.Equipos.AnyAsync(e => e.Id == id && e.IsActivo);
        }

        public async Task<bool> NombreExistsAsync(string nombre, int? excludeId = null)
        {
            if (excludeId.HasValue)
            {
                return await _context.Equipos
                    .AnyAsync(e => e.Nombre == nombre && e.Id != excludeId.Value && e.IsActivo);
            }
            
            return await _context.Equipos
                .AnyAsync(e => e.Nombre == nombre && e.IsActivo);
        }
    }
}

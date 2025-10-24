using Microsoft.EntityFrameworkCore;
using TeamsService.Models;

namespace TeamsService.Data
{
    public class TeamsDbContext : DbContext
    {
        public TeamsDbContext(DbContextOptions<TeamsDbContext> options) : base(options)
        {
        }

        public DbSet<Equipo> Equipos { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            
            // Configuración de índice único para Equipo
            modelBuilder.Entity<Equipo>()
                .HasIndex(e => e.Nombre)
                .IsUnique();

            // Configuración de la tabla
            modelBuilder.Entity<Equipo>()
                .ToTable("Equipos");
        }
    }
}

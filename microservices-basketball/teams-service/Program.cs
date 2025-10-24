using Microsoft.EntityFrameworkCore;
using TeamsService.Data;
using TeamsService.Repositories;
using TeamsService.Services;
using TeamsService.Services.Events;

var builder = WebApplication.CreateBuilder(args);

// Configuración de servicios
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "Teams Service API",
        Version = "v1",
        Description = "Microservicio para la gestión de equipos de baloncesto"
    });
});

// Entity Framework + SQL Server
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<TeamsDbContext>(options =>
    options.UseSqlServer(connectionString));

// Inyección de dependencias
builder.Services.AddScoped<IEquipoRepository, EquipoRepository>();
builder.Services.AddScoped<IEquipoService, EquipoService>();

// Event Publisher - Puedes cambiar entre RabbitMQ y NoOp
// Para usar RabbitMQ (requiere Docker con RabbitMQ corriendo):
// builder.Services.AddSingleton<IEventPublisher, RabbitMQEventPublisher>();

// Para desarrollo sin RabbitMQ (solo logs en consola):
builder.Services.AddSingleton<IEventPublisher, NoOpEventPublisher>();

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

// Logging
builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.AddDebug();

var app = builder.Build();

// Configurar el pipeline HTTP
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Teams Service API v1");
        c.RoutePrefix = "swagger";
    });
}

app.UseCors("AllowAll");

app.UseAuthorization();

app.MapControllers();

// Ejecutar migraciones automáticamente en desarrollo
if (app.Environment.IsDevelopment())
{
    using (var scope = app.Services.CreateScope())
    {
        var context = scope.ServiceProvider.GetRequiredService<TeamsDbContext>();
        try
        {
            context.Database.Migrate();
            app.Logger.LogInformation("Migraciones aplicadas exitosamente");
        }
        catch (Exception ex)
        {
            app.Logger.LogError(ex, "Error al aplicar migraciones");
        }
    }
}

app.Logger.LogInformation("Teams Service iniciado en {Environment}", app.Environment.EnvironmentName);

app.Run();

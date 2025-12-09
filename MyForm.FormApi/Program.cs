using System.Text.Json;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using MyForm.FormApi.Data;
using MyForm.FormApi.DTOs;
using MyForm.FormApi.Entities;
using MyForm.FormApi.Middleware;

var builder = WebApplication.CreateBuilder(args);

builder.AddServiceDefaults();

builder.AddNpgsqlDbContext<MyFormDbContext>("myform");

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddValidatorsFromAssemblyContaining<CreateSimpleFormRequestValidator>();

builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
});


var app = builder.Build();

// Add global exception handling middleware (early in pipeline)
app.UseMiddleware<GlobalExceptionHandlerMiddleware>();

app.MapDefaultEndpoints();



// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    // app.MapOpenApi();
    using var scope = app.Services.CreateScope();
    var dbContext = scope.ServiceProvider.GetRequiredService<MyFormDbContext>();
    dbContext.Database.Migrate();

    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

var summaries = new[]
{
    "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
};

app.MapGet("/weatherforecast", () =>
    {
        var forecast = Enumerable.Range(1, 5).Select(index =>
                new WeatherForecast
                (
                    DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
                    Random.Shared.Next(-20, 55),
                    summaries[Random.Shared.Next(summaries.Length)]
                ))
            .ToArray();
        return forecast;
    })
    .WithName("GetWeatherForecast");


app.MapGet("/forms", async (MyFormDbContext db, ILogger<Program> logger) =>
    {
        logger.LogInformation("Fetching all forms");

        var forms = await db.Forms.ToListAsync();
        var response = forms.Select(f => new SimpleFormResponse(f.Id, f.FirstName, f.LastName, f.CreatedAt)).ToList();

        logger.LogInformation("Retrieved {Count} forms", response.Count);

        return response;
    })
    .WithName("GetAllSubmissions")
    .Produces<List<SimpleFormResponse>>()
    .Produces<ErrorResponse>(StatusCodes.Status500InternalServerError);

app.MapPost("/forms", async (CreateSimpleFormRequest request, IValidator<CreateSimpleFormRequest> validator, MyFormDbContext db, ILogger<Program> logger) =>
{
    // Validation will throw ValidationException if invalid, handled by middleware
    await validator.ValidateAndThrowAsync(request);

    var form = new SimpleForm
    {
        FirstName = request.FirstName,
        LastName = request.LastName
    };

    db.Forms.Add(form);
    await db.SaveChangesAsync();

    logger.LogInformation("Form created successfully. FormId: {FormId}", form.Id);

    return Results.Created($"/forms/{form.Id}", new SimpleFormResponse(form.Id, form.FirstName, form.LastName, form.CreatedAt));
})
    .WithName("CreateForm")
    .Produces<SimpleFormResponse>(StatusCodes.Status201Created)
    .Produces<ErrorResponse>(StatusCodes.Status400BadRequest)
    .Produces<ErrorResponse>(StatusCodes.Status500InternalServerError);

app.Run();

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}
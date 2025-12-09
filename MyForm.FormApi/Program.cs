using System.Text.Json;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using MyForm.FormApi.Data;
using MyForm.FormApi.DTOs;
using MyForm.FormApi.Entities;

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


app.MapGet("/forms", async (MyFormDbContext db) =>
    {
        var forms = await db.Forms.ToListAsync();
        return forms.Select(f => new SimpleFormResponse(f.Id, f.FirstName, f.LastName));
    })
    .WithName("GetAllSubmissions")
    .Produces<List<SimpleFormResponse>>();

app.MapPost("/forms", async (CreateSimpleFormRequest request, IValidator<CreateSimpleFormRequest> validator, MyFormDbContext db) =>
{
    var validationResult = await validator.ValidateAsync(request);
    if (!validationResult.IsValid)
    {
        var namingPolicy = JsonNamingPolicy.CamelCase;
        return Results.BadRequest(new
        {
            errors = validationResult.Errors.GroupBy(e => e.PropertyName)
                .ToDictionary(
                    g => namingPolicy.ConvertName(g.Key),
                    g => g.Select(e => e.ErrorMessage).ToArray()
                )
        });
    }

    var form = new SimpleForm
    {
        FirstName = request.FirstName,
        LastName = request.LastName
    };

    db.Forms.Add(form);
    await db.SaveChangesAsync();

    return Results.Created($"/forms/{form.Id}", new SimpleFormResponse(form.Id, form.FirstName, form.LastName));
})
    .WithName("CreateForm")
    .Produces<SimpleFormResponse>(StatusCodes.Status201Created)
    .Produces<object>(StatusCodes.Status400BadRequest);

app.Run();

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}
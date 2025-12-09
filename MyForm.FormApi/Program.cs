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
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Version = "v1",
        Title = "MyForm API",
        Description = "API for managing form submissions",
        Contact = new Microsoft.OpenApi.Models.OpenApiContact
        {
            Name = "MyForm API Support"
        }
    });

    // Include XML comments if available
    var xmlFile = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (File.Exists(xmlPath))
    {
        options.IncludeXmlComments(xmlPath);
    }
});

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
    app.MapOpenApi();
    using var scope = app.Services.CreateScope();
    var dbContext = scope.ServiceProvider.GetRequiredService<MyFormDbContext>();
    dbContext.Database.Migrate();

    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "MyForm API v1");
        options.RoutePrefix = "swagger";
    });
}

app.UseHttpsRedirection();

// API v1 endpoints
var apiV1 = app.MapGroup("/api/v1")
    .WithTags("Forms API v1");

apiV1.MapGet("/forms", async (MyFormDbContext db, ILogger<Program> logger) =>
    {
        logger.LogInformation("Fetching all forms");

        var forms = await db.Forms.ToListAsync();
        var response = forms.Select(f => new SimpleFormResponse(f.Id, f.FirstName, f.LastName, f.CreatedAt)).ToList();

        logger.LogInformation("Retrieved {Count} forms", response.Count);

        return response;
    })
    .WithName("GetAllSubmissions")
    .WithSummary("Get all form submissions")
    .WithDescription("Retrieves all form submissions from the database")
    .Produces<List<SimpleFormResponse>>(StatusCodes.Status200OK, "application/json")
    .Produces<ErrorResponse>(StatusCodes.Status500InternalServerError);

apiV1.MapPost("/forms", async (CreateSimpleFormRequest request, IValidator<CreateSimpleFormRequest> validator, MyFormDbContext db, ILogger<Program> logger) =>
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

    return Results.Created($"/api/v1/forms/{form.Id}", new SimpleFormResponse(form.Id, form.FirstName, form.LastName, form.CreatedAt));
})
    .WithName("CreateForm")
    .WithSummary("Create a new form submission")
    .WithDescription("Creates a new form submission with first name and last name. Validates input and returns the created form.")
    .Produces<SimpleFormResponse>(StatusCodes.Status201Created, "application/json")
    .Produces<ErrorResponse>(StatusCodes.Status400BadRequest)
    .Produces<ErrorResponse>(StatusCodes.Status500InternalServerError);

app.Run();
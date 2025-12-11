using System.Text.Json;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using MyForm.FormApi.CQRS;
using MyForm.FormApi.CQRS.Commands;
using MyForm.FormApi.CQRS.Queries;
using MyForm.FormApi.CQRS.Results;
using MyForm.FormApi.Data;
using MyForm.FormApi.DTOs;
using MyForm.FormApi.Mappings;
using MyForm.FormApi.Middleware;
using MyForm.FormApi.Repositories;
using MyForm.FormApi.Services;

var builder = WebApplication.CreateBuilder(args);

builder.AddServiceDefaults();

builder.AddNpgsqlDbContext<MyFormDbContext>("myform");

// Register repositories
builder.Services.AddScoped<ISimpleFormRepository, SimpleFormRepository>();

// Register CQRS handlers
builder.Services.AddScoped<ICommandHandler<CreateSimpleFormCommand, CreateSimpleFormResult>, CreateSimpleFormCommandHandler>();
builder.Services.AddScoped<ICommandHandler<DeleteSimpleFormCommand, DeleteSimpleFormResult>, DeleteSimpleFormCommandHandler>();
builder.Services.AddScoped<IQueryHandler<GetAllFormsQuery, GetAllFormsResult>, GetAllFormsQueryHandler>();

// Register services
builder.Services.AddScoped<ISimpleFormService, SimpleFormService>();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new()
    {
        Version = "v1",
        Title = "MyForm API",
        Description = "API for managing form submissions"
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
    // app.MapOpenApi();
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

apiV1.MapGet("/forms", async (ISimpleFormService service, CancellationToken cancellationToken) =>
    {
        var result = await service.GetAllFormsAsync(cancellationToken);
        return result.ToDtoList();
    })
    .WithName("GetAllSubmissions")
    .WithSummary("Get all form submissions")
    .WithDescription("Retrieves all form submissions from the database")
    .Produces<List<SimpleFormResponse>>(StatusCodes.Status200OK, "application/json")
    .Produces<ErrorResponse>(StatusCodes.Status500InternalServerError);

apiV1.MapPost("/forms", async (
    CreateSimpleFormRequest request,
    IValidator<CreateSimpleFormRequest> validator,
    ISimpleFormService service,
    CancellationToken cancellationToken) =>
{
    // Validation will throw ValidationException if invalid, handled by middleware
    await validator.ValidateAndThrowAsync(request);

    var command = new CreateSimpleFormCommand(request.FirstName, request.LastName);
    var result = await service.CreateFormAsync(command, cancellationToken);

    return Results.Created($"/api/v1/forms/{result.Id}", result.ToDto());
})
    .WithName("CreateForm")
    .WithSummary("Create a new form submission")
    .WithDescription("Creates a new form submission with first name and last name. Validates input and returns the created form.")
    .Produces<SimpleFormResponse>(StatusCodes.Status201Created, "application/json")
    .Produces<ErrorResponse>(StatusCodes.Status400BadRequest)
    .Produces<ErrorResponse>(StatusCodes.Status500InternalServerError);

apiV1.MapDelete("/forms/{id}", async (
    int id,
    ISimpleFormService service,
    CancellationToken cancellationToken) =>
{
    var command = new DeleteSimpleFormCommand(id);
    var result = await service.DeleteFormAsync(command, cancellationToken);

    if (!result.Success)
    {
        return Results.NotFound();
    }

    return Results.NoContent();
})
    .WithName("DeleteForm")
    .WithSummary("Delete a form submission")
    .WithDescription("Deletes a form submission by ID. Returns 204 No Content on success, 404 if not found.")
    .Produces(StatusCodes.Status204NoContent)
    .Produces<ErrorResponse>(StatusCodes.Status404NotFound)
    .Produces<ErrorResponse>(StatusCodes.Status500InternalServerError);

app.Run();
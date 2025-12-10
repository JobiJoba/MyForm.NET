# Day 06

## Architecture Refactoring: Enterprise Patterns Implementation

### Overview

Refactored the application to implement enterprise-level architecture patterns for better separation of concerns, testability, and scalability. Moved from a monolithic `Program.cs` with direct EF Core access to a layered architecture with Repository Pattern, Service Layer, and CQRS.

---

## Repository Pattern

### Purpose

Abstracts Entity Framework Core behind interfaces, making the data access layer testable and allowing for easy swapping of data access technologies.

### Implementation

**Interface: `ISimpleFormRepository`**

```csharp
public interface ISimpleFormRepository
{
    Task<IEnumerable<SimpleForm>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<SimpleForm?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<SimpleForm> CreateAsync(SimpleForm form, CancellationToken cancellationToken = default);
    Task<bool> ExistsAsync(int id, CancellationToken cancellationToken = default);
}
```

**Implementation: `SimpleFormRepository`**

- Wraps `MyFormDbContext` operations
- Provides async methods for all CRUD operations
- Handles cancellation tokens for proper async cancellation support
- Returns domain entities (`SimpleForm`) rather than DTOs

### Benefits

- **Testability**: Can easily mock `ISimpleFormRepository` in unit tests
- **Flexibility**: Can swap EF Core for Dapper, ADO.NET, or any other data access technology
- **Single Responsibility**: Repository only handles data access concerns
- **Dependency Inversion**: High-level code depends on abstractions, not concrete implementations

---

## CQRS Pattern (Command Query Responsibility Segregation)

### Purpose

Separates read operations (queries) from write operations (commands), enabling:

- Independent scaling of read/write operations
- Different data models for reads and writes
- Clear separation of business logic
- Future optimization opportunities (caching, read replicas, etc.)

### Implementation Structure

**Handler Interfaces:**

```csharp
public interface ICommandHandler<in TCommand, TResult>
{
    Task<TResult> HandleAsync(TCommand command, CancellationToken cancellationToken = default);
}

public interface IQueryHandler<in TQuery, TResult>
{
    Task<TResult> HandleAsync(TQuery query, CancellationToken cancellationToken = default);
}
```

**Commands (Write Operations):**

- `CreateSimpleFormCommand`: Contains data needed to create a form
- `CreateSimpleFormCommandHandler`: Business logic for creating forms
  - Creates `SimpleForm` entity
  - Saves via repository
  - Logs operation
  - Returns `CreateSimpleFormResult`

**Queries (Read Operations):**

- `GetAllFormsQuery`: Empty query object (could contain filters/pagination in future)
- `GetAllFormsQueryHandler`: Business logic for retrieving forms
  - Fetches all forms via repository
  - Maps to result objects
  - Logs operation
  - Returns `GetAllFormsResult`

**Result Objects:**

- `SimpleFormResult`: Read model for a single form
- `CreateSimpleFormResult`: Result of form creation
- `GetAllFormsResult`: Collection of form results

### Benefits

- **Scalability**: Can scale read and write operations independently
- **Performance**: Can optimize reads separately (caching, denormalization)
- **Clarity**: Clear distinction between operations that modify state vs. those that read it
- **Future-Proof**: Easy to add features like:
  - Event sourcing
  - Read replicas
  - CQRS with separate databases
  - MediatR integration

---

## Service Layer

### Purpose

Provides a clean API for the application layer (endpoints) and orchestrates CQRS handlers. Acts as a facade that simplifies interaction with the CQRS layer.

### Implementation

**Interface: `ISimpleFormService`**

```csharp
public interface ISimpleFormService
{
    Task<CreateSimpleFormResult> CreateFormAsync(CreateSimpleFormCommand command, CancellationToken cancellationToken = default);
    Task<GetAllFormsResult> GetAllFormsAsync(CancellationToken cancellationToken = default);
}
```

**Implementation: `SimpleFormService`**

- Delegates to appropriate CQRS handlers
- Provides a single point of entry for business operations
- Can coordinate multiple handlers if needed
- Maintains clean separation between API layer and business logic

### Benefits

- **Abstraction**: API endpoints don't need to know about CQRS internals
- **Orchestration**: Can coordinate multiple operations if needed
- **Testability**: Easy to mock for endpoint testing
- **Consistency**: Single service interface for all form operations

---

## Dependency Injection Configuration

### Registration in `Program.cs`

**Repositories:**

```csharp
builder.Services.AddScoped<ISimpleFormRepository, SimpleFormRepository>();
```

**CQRS Handlers:**

```csharp
builder.Services.AddScoped<ICommandHandler<CreateSimpleFormCommand, CreateSimpleFormResult>, CreateSimpleFormCommandHandler>();
builder.Services.AddScoped<IQueryHandler<GetAllFormsQuery, GetAllFormsResult>, GetAllFormsQueryHandler>();
```

**Services:**

```csharp
builder.Services.AddScoped<ISimpleFormService, SimpleFormService>();
```

### Lifetime Choices

- **Scoped**: All services use scoped lifetime
  - One instance per HTTP request
  - Ensures proper DbContext sharing within a request
  - Thread-safe for request-scoped operations
  - Aligns with EF Core DbContext lifetime

---

## Mapping Layer

### Purpose

Converts CQRS result objects to API DTOs, maintaining separation between internal domain models and external API contracts.

### Implementation: `SimpleFormMappings`

```csharp
public static class SimpleFormMappings
{
    public static SimpleFormResponse ToDto(this SimpleFormResult result);
    public static SimpleFormResponse ToDto(this CreateSimpleFormResult result);
    public static List<SimpleFormResponse> ToDtoList(this GetAllFormsResult result);
}
```

### Benefits

- **Separation**: Internal CQRS results are separate from external DTOs
- **Flexibility**: Can change internal models without breaking API contracts
- **Reusability**: Extension methods can be used throughout the application
- **Type Safety**: Compile-time checking of mapping operations

---

## Refactored Endpoints

### Before (Direct EF Core Access)

```csharp
apiV1.MapGet("/forms", async (MyFormDbContext db, ILogger<Program> logger) =>
{
    var forms = await db.Forms.ToListAsync();
    return forms.Select(f => new SimpleFormResponse(...)).ToList();
});
```

### After (Service Layer)

```csharp
apiV1.MapGet("/forms", async (ISimpleFormService service, CancellationToken cancellationToken) =>
{
    var result = await service.GetAllFormsAsync(cancellationToken);
    return result.ToDtoList();
});
```

### Improvements

- **No Direct DbContext**: Endpoints don't access database directly
- **Cancellation Support**: Proper async cancellation token propagation
- **Cleaner Code**: Endpoints are thin, focused on HTTP concerns
- **Testable**: Can easily test endpoints with mocked services

---

## Architecture Layers

```
┌─────────────────────────────────────┐
│         API Endpoints                │  (Program.cs)
│    - HTTP concerns only              │
│    - Request/Response mapping       │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│         Service Layer                │  (ISimpleFormService)
│    - Orchestrates handlers          │
│    - Business operation facade       │
└──────────────┬──────────────────────┘
               │
       ┌───────┴────────┐
       │                │
       ▼                ▼
┌─────────────┐  ┌─────────────┐
│  Commands   │  │   Queries   │  (CQRS)
│  (Writes)   │  │   (Reads)   │
└──────┬──────┘  └──────┬───────┘
       │                │
       └────────┬───────┘
                │
                ▼
┌─────────────────────────────────────┐
│      Repository Layer                │  (ISimpleFormRepository)
│    - Data access abstraction        │
│    - EF Core implementation         │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│      Data Access (EF Core)           │  (MyFormDbContext)
│    - Database operations            │
└─────────────────────────────────────┘
```

---

## Benefits of New Architecture

### Testability

- **Unit Tests**: Can mock `ISimpleFormRepository`, `ISimpleFormService`, and handlers
- **Integration Tests**: Can test each layer independently
- **Isolation**: Business logic tests don't require database

### Maintainability

- **Single Responsibility**: Each class has one clear purpose
- **Separation of Concerns**: Data access, business logic, and API concerns are separated
- **Easy to Navigate**: Clear folder structure (Repositories, Services, CQRS)

### Scalability

- **CQRS Ready**: Can easily split read/write databases
- **Handler-Based**: Easy to add cross-cutting concerns (logging, validation, authorization)
- **Repository Pattern**: Can optimize data access without changing business logic

### Flexibility

- **Swappable Implementations**: Can replace EF Core with other ORMs
- **Extensible**: Easy to add new commands/queries
- **Future-Proof**: Architecture supports advanced patterns (event sourcing, domain events)

---

## File Structure

```
MyForm.FormApi/
├── CQRS/
│   ├── Commands/
│   │   ├── CreateSimpleFormCommand.cs
│   │   └── CreateSimpleFormCommandHandler.cs
│   ├── Queries/
│   │   ├── GetAllFormsQuery.cs
│   │   └── GetAllFormsQueryHandler.cs
│   ├── Results/
│   │   ├── CreateSimpleFormResult.cs
│   │   ├── GetAllFormsResult.cs
│   │   └── SimpleFormResult.cs
│   ├── ICommandHandler.cs
│   └── IQueryHandler.cs
├── Repositories/
│   ├── ISimpleFormRepository.cs
│   └── SimpleFormRepository.cs
├── Services/
│   ├── ISimpleFormService.cs
│   └── SimpleFormService.cs
├── Mappings/
│   └── SimpleFormMappings.cs
└── Program.cs (refactored)
```

---

## Migration Notes

### What Changed

1. **Business Logic**: Moved from `Program.cs` endpoints to CQRS handlers
2. **Data Access**: Abstracted behind `ISimpleFormRepository`
3. **Service Layer**: Added orchestration layer between API and CQRS
4. **Dependency Injection**: All components registered with interfaces

### What Stayed the Same

- API endpoints and routes remain unchanged
- DTOs (`CreateSimpleFormRequest`, `SimpleFormResponse`) unchanged
- Database schema and entities unchanged
- Validation and error handling middleware unchanged

### Backward Compatibility

- **API Contract**: No breaking changes to API endpoints
- **Response Format**: Same DTOs returned to clients
- **Behavior**: Functionality remains identical from client perspective

---

## Next Steps (Future Enhancements)

### Potential Improvements

1. **MediatR Integration**: Use MediatR library for CQRS handler dispatching
2. **Unit of Work Pattern**: Add transaction management abstraction
3. **Specification Pattern**: Add query specifications for complex queries
4. **Domain Events**: Add event publishing for side effects
5. **Read Models**: Separate read models for complex queries
6. **Caching**: Add caching layer for read operations
7. **Validation Pipeline**: Move validation into command handlers
8. **Authorization**: Add authorization checks in handlers

### Testing Strategy

- **Unit Tests**: Test handlers, services, and repositories in isolation
- **Integration Tests**: Test full request flow with test database
- **API Tests**: Test endpoints with mocked services

---

## Technical Decisions

### Why Scoped Lifetime?

- Aligns with EF Core `DbContext` scoped lifetime
- One instance per HTTP request ensures proper transaction boundaries
- Thread-safe for request-scoped operations

### Why Extension Methods for Mapping?

- Keeps mapping logic close to DTOs
- Easy to discover and use
- Type-safe compile-time checking
- Can be easily tested

### Why Separate Result Objects?

- Allows different shapes for reads vs. writes
- Future-proof for read model optimization
- Clear intent (command result vs. query result)
- Can evolve independently

### Why Service Layer Over Direct Handler Access?

- Provides abstraction for API layer
- Can coordinate multiple operations
- Easier to add cross-cutting concerns
- Simpler testing of endpoints

---

## Summary

Successfully refactored the application from a monolithic structure to a clean, layered architecture following enterprise patterns:

✅ **Repository Pattern**: Data access abstracted behind interfaces  
✅ **CQRS Pattern**: Commands and queries separated for scalability  
✅ **Service Layer**: Clean orchestration of business operations  
✅ **Dependency Injection**: Interface-based DI for testability  
✅ **Separation of Concerns**: Clear boundaries between layers  
✅ **Backward Compatible**: No breaking changes to API contract

The codebase is now more maintainable, testable, and ready for future scaling and feature additions.

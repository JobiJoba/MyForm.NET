# Day 02

- Added the postgresdb with aspire but now I've to make a choice
  - Use npgsql or use entity framework. (I've to read about those two, long time I didn't use EF)
- I went with EF Core
- Install tool dotnet tool install --global dotnet-ef to be able to create migration
- Exec command dotnet ef migrations add InitialCreate --project .
  - Issue had to install first Microsoft.EntityFrameworkCore.Design 
- You can launch migration with Aspire

```csharp
  using var scope = app.Services.CreateScope();
  var dbContext = scope.ServiceProvider.GetRequiredService<MyFormDbContext>();
  dbContext.Database.Migrate();
```

- Created a simple api that get submissions to the form. 
- Added Swagger (with this horrible name for nuget package Swashbuckle )
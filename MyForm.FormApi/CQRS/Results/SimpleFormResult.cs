namespace MyForm.FormApi.CQRS.Results;

public record SimpleFormResult(
    int Id,
    string FirstName,
    string LastName,
    DateTime CreatedAt
);

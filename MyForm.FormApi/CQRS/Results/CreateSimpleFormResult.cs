namespace MyForm.FormApi.CQRS.Results;

public record CreateSimpleFormResult(
    int Id,
    string FirstName,
    string LastName,
    DateTime CreatedAt
);

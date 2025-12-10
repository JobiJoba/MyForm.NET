namespace MyForm.FormApi.CQRS.Commands;

public record CreateSimpleFormCommand(
    string FirstName,
    string LastName
);

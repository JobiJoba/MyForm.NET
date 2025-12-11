using Microsoft.Extensions.Logging;
using MyForm.FormApi.CQRS.Results;
using MyForm.FormApi.Entities;
using MyForm.FormApi.Repositories;

namespace MyForm.FormApi.CQRS.Commands;

public class CreateSimpleFormCommandHandler(
    ISimpleFormRepository repository,
    ILogger<CreateSimpleFormCommandHandler> logger)
    : ICommandHandler<CreateSimpleFormCommand, CreateSimpleFormResult>
{
    public async Task<CreateSimpleFormResult> HandleAsync(CreateSimpleFormCommand command, CancellationToken cancellationToken = default)
    {
        var form = new SimpleForm
        {
            FirstName = command.FirstName,
            LastName = command.LastName
        };

        var createdForm = await repository.CreateAsync(form, cancellationToken);

        logger.LogInformation("Form created successfully. FormId: {FormId}", createdForm.Id);

        return new CreateSimpleFormResult(
            createdForm.Id,
            createdForm.FirstName,
            createdForm.LastName,
            createdForm.CreatedAt
        );
    }
}

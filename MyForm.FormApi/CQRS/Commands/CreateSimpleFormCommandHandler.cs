using Microsoft.Extensions.Logging;
using MyForm.FormApi.CQRS.Results;
using MyForm.FormApi.Entities;
using MyForm.FormApi.Repositories;

namespace MyForm.FormApi.CQRS.Commands;

public class CreateSimpleFormCommandHandler : ICommandHandler<CreateSimpleFormCommand, CreateSimpleFormResult>
{
    private readonly ISimpleFormRepository _repository;
    private readonly ILogger<CreateSimpleFormCommandHandler> _logger;

    public CreateSimpleFormCommandHandler(
        ISimpleFormRepository repository,
        ILogger<CreateSimpleFormCommandHandler> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task<CreateSimpleFormResult> HandleAsync(CreateSimpleFormCommand command, CancellationToken cancellationToken = default)
    {
        var form = new SimpleForm
        {
            FirstName = command.FirstName,
            LastName = command.LastName
        };

        var createdForm = await _repository.CreateAsync(form, cancellationToken);

        _logger.LogInformation("Form created successfully. FormId: {FormId}", createdForm.Id);

        return new CreateSimpleFormResult(
            createdForm.Id,
            createdForm.FirstName,
            createdForm.LastName,
            createdForm.CreatedAt
        );
    }
}

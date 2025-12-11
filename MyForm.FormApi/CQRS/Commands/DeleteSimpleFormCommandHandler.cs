using Microsoft.Extensions.Logging;
using MyForm.FormApi.CQRS.Results;
using MyForm.FormApi.Repositories;

namespace MyForm.FormApi.CQRS.Commands;

public class DeleteSimpleFormCommandHandler(
    ISimpleFormRepository repository,
    ILogger<DeleteSimpleFormCommandHandler> logger)
    : ICommandHandler<DeleteSimpleFormCommand, DeleteSimpleFormResult>
{
    public async Task<DeleteSimpleFormResult> HandleAsync(DeleteSimpleFormCommand command, CancellationToken cancellationToken = default)
    {
        var deleted = await repository.DeleteAsync(command.Id, cancellationToken);

        if (deleted)
        {
            logger.LogInformation("Form deleted successfully. FormId: {FormId}", command.Id);
        }
        else
        {
            logger.LogWarning("Form not found for deletion. FormId: {FormId}", command.Id);
        }

        return new DeleteSimpleFormResult(deleted, command.Id);
    }
}

using MyForm.FormApi.CQRS;
using MyForm.FormApi.CQRS.Commands;
using MyForm.FormApi.CQRS.Queries;
using MyForm.FormApi.CQRS.Results;

namespace MyForm.FormApi.Services;

public class SimpleFormService(
    ICommandHandler<CreateSimpleFormCommand, CreateSimpleFormResult> createHandler,
    ICommandHandler<DeleteSimpleFormCommand, DeleteSimpleFormResult> deleteHandler,
    IQueryHandler<GetAllFormsQuery, GetAllFormsResult> getAllHandler)
    : ISimpleFormService
{
    public Task<CreateSimpleFormResult> CreateFormAsync(CreateSimpleFormCommand command, CancellationToken cancellationToken = default)
    {
        return createHandler.HandleAsync(command, cancellationToken);
    }

    public Task<GetAllFormsResult> GetAllFormsAsync(CancellationToken cancellationToken = default)
    {
        return getAllHandler.HandleAsync(new GetAllFormsQuery(), cancellationToken);
    }

    public Task<DeleteSimpleFormResult> DeleteFormAsync(DeleteSimpleFormCommand command, CancellationToken cancellationToken = default)
    {
        return deleteHandler.HandleAsync(command, cancellationToken);
    }
}

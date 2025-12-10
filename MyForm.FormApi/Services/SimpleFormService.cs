using MyForm.FormApi.CQRS;
using MyForm.FormApi.CQRS.Commands;
using MyForm.FormApi.CQRS.Queries;
using MyForm.FormApi.CQRS.Results;

namespace MyForm.FormApi.Services;

public class SimpleFormService : ISimpleFormService
{
    private readonly ICommandHandler<CreateSimpleFormCommand, CreateSimpleFormResult> _createHandler;
    private readonly IQueryHandler<GetAllFormsQuery, GetAllFormsResult> _getAllHandler;

    public SimpleFormService(
        ICommandHandler<CreateSimpleFormCommand, CreateSimpleFormResult> createHandler,
        IQueryHandler<GetAllFormsQuery, GetAllFormsResult> getAllHandler)
    {
        _createHandler = createHandler;
        _getAllHandler = getAllHandler;
    }

    public Task<CreateSimpleFormResult> CreateFormAsync(CreateSimpleFormCommand command, CancellationToken cancellationToken = default)
    {
        return _createHandler.HandleAsync(command, cancellationToken);
    }

    public Task<GetAllFormsResult> GetAllFormsAsync(CancellationToken cancellationToken = default)
    {
        return _getAllHandler.HandleAsync(new GetAllFormsQuery(), cancellationToken);
    }
}

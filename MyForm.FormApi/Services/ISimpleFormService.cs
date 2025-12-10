using MyForm.FormApi.CQRS.Commands;
using MyForm.FormApi.CQRS.Queries;
using MyForm.FormApi.CQRS.Results;

namespace MyForm.FormApi.Services;

public interface ISimpleFormService
{
    Task<CreateSimpleFormResult> CreateFormAsync(CreateSimpleFormCommand command, CancellationToken cancellationToken = default);
    Task<GetAllFormsResult> GetAllFormsAsync(CancellationToken cancellationToken = default);
}

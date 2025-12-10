using Microsoft.Extensions.Logging;
using MyForm.FormApi.CQRS.Results;
using MyForm.FormApi.Repositories;

namespace MyForm.FormApi.CQRS.Queries;

public class GetAllFormsQueryHandler : IQueryHandler<GetAllFormsQuery, GetAllFormsResult>
{
    private readonly ISimpleFormRepository _repository;
    private readonly ILogger<GetAllFormsQueryHandler> _logger;

    public GetAllFormsQueryHandler(
        ISimpleFormRepository repository,
        ILogger<GetAllFormsQueryHandler> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task<GetAllFormsResult> HandleAsync(GetAllFormsQuery query, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Fetching all forms");

        var forms = await _repository.GetAllAsync(cancellationToken);
        var result = forms.Select(f => new SimpleFormResult(f.Id, f.FirstName, f.LastName, f.CreatedAt)).ToList();

        _logger.LogInformation("Retrieved {Count} forms", result.Count);

        return new GetAllFormsResult(result);
    }
}

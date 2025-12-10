using MyForm.FormApi.Entities;

namespace MyForm.FormApi.Repositories;

public interface ISimpleFormRepository
{
    Task<IEnumerable<SimpleForm>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<SimpleForm?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<SimpleForm> CreateAsync(SimpleForm form, CancellationToken cancellationToken = default);
    Task<bool> ExistsAsync(int id, CancellationToken cancellationToken = default);
}

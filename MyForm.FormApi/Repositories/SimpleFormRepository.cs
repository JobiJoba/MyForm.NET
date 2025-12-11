using Microsoft.EntityFrameworkCore;
using MyForm.FormApi.Data;
using MyForm.FormApi.Entities;

namespace MyForm.FormApi.Repositories;

public class SimpleFormRepository(MyFormDbContext context) : ISimpleFormRepository
{
    public async Task<IEnumerable<SimpleForm>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await context.Forms.ToListAsync(cancellationToken);
    }

    public async Task<SimpleForm?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await context.Forms.FindAsync([id], cancellationToken);
    }

    public async Task<SimpleForm> CreateAsync(SimpleForm form, CancellationToken cancellationToken = default)
    {
        context.Forms.Add(form);
        await context.SaveChangesAsync(cancellationToken);
        return form;
    }

    public async Task<bool> ExistsAsync(int id, CancellationToken cancellationToken = default)
    {
        return await context.Forms.AnyAsync(f => f.Id == id, cancellationToken);
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var form = await context.Forms.FindAsync([id], cancellationToken);
        if (form == null)
        {
            return false;
        }

        context.Forms.Remove(form);
        await context.SaveChangesAsync(cancellationToken);
        return true;
    }
}

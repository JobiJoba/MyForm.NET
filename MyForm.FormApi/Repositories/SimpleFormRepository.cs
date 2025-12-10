using Microsoft.EntityFrameworkCore;
using MyForm.FormApi.Data;
using MyForm.FormApi.Entities;

namespace MyForm.FormApi.Repositories;

public class SimpleFormRepository : ISimpleFormRepository
{
    private readonly MyFormDbContext _context;

    public SimpleFormRepository(MyFormDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<SimpleForm>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Forms.ToListAsync(cancellationToken);
    }

    public async Task<SimpleForm?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _context.Forms.FindAsync([id], cancellationToken);
    }

    public async Task<SimpleForm> CreateAsync(SimpleForm form, CancellationToken cancellationToken = default)
    {
        _context.Forms.Add(form);
        await _context.SaveChangesAsync(cancellationToken);
        return form;
    }

    public async Task<bool> ExistsAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _context.Forms.AnyAsync(f => f.Id == id, cancellationToken);
    }
}

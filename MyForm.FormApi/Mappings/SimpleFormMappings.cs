using MyForm.FormApi.CQRS.Results;
using MyForm.FormApi.DTOs;

namespace MyForm.FormApi.Mappings;

public static class SimpleFormMappings
{
    public static SimpleFormResponse ToDto(this SimpleFormResult result)
    {
        return new SimpleFormResponse(
            result.Id,
            result.FirstName,
            result.LastName,
            result.CreatedAt
        );
    }

    public static SimpleFormResponse ToDto(this CreateSimpleFormResult result)
    {
        return new SimpleFormResponse(
            result.Id,
            result.FirstName,
            result.LastName,
            result.CreatedAt
        );
    }

    public static List<SimpleFormResponse> ToDtoList(this GetAllFormsResult result)
    {
        return result.Forms.Select(f => f.ToDto()).ToList();
    }
}

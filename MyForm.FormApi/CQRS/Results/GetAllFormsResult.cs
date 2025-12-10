namespace MyForm.FormApi.CQRS.Results;

public record GetAllFormsResult(IEnumerable<SimpleFormResult> Forms);

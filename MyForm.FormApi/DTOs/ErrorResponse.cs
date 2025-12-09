namespace MyForm.FormApi.DTOs;

public record ErrorResponse(
    string Message,
    Dictionary<string, string[]>? Errors = null,
    string? TraceId = null
);


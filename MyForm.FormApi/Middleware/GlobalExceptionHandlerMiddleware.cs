using System.Diagnostics;
using System.Net;
using System.Text.Json;
using System.Text.Json.Serialization;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using MyForm.FormApi.DTOs;

namespace MyForm.FormApi.Middleware;

public class GlobalExceptionHandlerMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionHandlerMiddleware> _logger;
    private readonly IWebHostEnvironment _environment;

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
    };

    public GlobalExceptionHandlerMiddleware(
        RequestDelegate next,
        ILogger<GlobalExceptionHandlerMiddleware> logger,
        IWebHostEnvironment environment)
    {
        _next = next;
        _logger = logger;
        _environment = environment;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        // Use OpenTelemetry trace ID if available, fallback to HTTP trace identifier
        var traceId = Activity.Current?.TraceId.ToString() ?? context.TraceIdentifier;
        var response = context.Response;
        response.ContentType = "application/json";

        var errorResponse = exception switch
        {
            ValidationException validationEx => HandleValidationException(validationEx, traceId),
            DbUpdateException dbEx => HandleDatabaseException(dbEx, traceId),
            UnauthorizedAccessException => HandleUnauthorizedException(traceId),
            KeyNotFoundException => HandleNotFoundException(traceId),
            ArgumentException argEx => HandleArgumentException(argEx, traceId),
            _ => HandleGenericException(exception, traceId)
        };

        response.StatusCode = (int)errorResponse.StatusCode;

        // Structured logging
        LogException(exception, errorResponse.StatusCode, traceId);

        var jsonResponse = JsonSerializer.Serialize(errorResponse.ErrorResponse, JsonOptions);
        await response.WriteAsync(jsonResponse);
    }

    private (ErrorResponse ErrorResponse, HttpStatusCode StatusCode) HandleValidationException(
        ValidationException exception,
        string traceId)
    {
        var errors = exception.Errors
            .GroupBy(e => e.PropertyName)
            .ToDictionary(
                g => JsonNamingPolicy.CamelCase.ConvertName(g.Key),
                g => g.Select(e => e.ErrorMessage).ToArray()
            );

        return (
            new ErrorResponse("Validation failed", errors, traceId),
            HttpStatusCode.BadRequest
        );
    }

    private (ErrorResponse ErrorResponse, HttpStatusCode StatusCode) HandleDatabaseException(
        DbUpdateException exception,
        string traceId)
    {
        _logger.LogError(exception, "Database error occurred. TraceId: {TraceId}", traceId);

        var message = _environment.IsDevelopment()
            ? $"Database error: {exception.GetBaseException().Message}"
            : "An error occurred while processing your request. Please try again later.";

        return (
            new ErrorResponse(message, null, traceId),
            HttpStatusCode.InternalServerError
        );
    }

    private (ErrorResponse ErrorResponse, HttpStatusCode StatusCode) HandleUnauthorizedException(
        string traceId)
    {
        return (
            new ErrorResponse("You are not authorized to perform this action", null, traceId),
            HttpStatusCode.Unauthorized
        );
    }

    private (ErrorResponse ErrorResponse, HttpStatusCode StatusCode) HandleNotFoundException(
        string traceId)
    {
        return (
            new ErrorResponse("The requested resource was not found", null, traceId),
            HttpStatusCode.NotFound
        );
    }

    private (ErrorResponse ErrorResponse, HttpStatusCode StatusCode) HandleArgumentException(
        ArgumentException exception,
        string traceId)
    {
        return (
            new ErrorResponse(exception.Message, null, traceId),
            HttpStatusCode.BadRequest
        );
    }

    private (ErrorResponse ErrorResponse, HttpStatusCode StatusCode) HandleGenericException(
        Exception exception,
        string traceId)
    {
        _logger.LogError(exception, "Unhandled exception occurred. TraceId: {TraceId}", traceId);

        var message = _environment.IsDevelopment()
            ? exception.Message
            : "An unexpected error occurred. Please try again later.";

        return (
            new ErrorResponse(message, null, traceId),
            HttpStatusCode.InternalServerError
        );
    }

    private void LogException(Exception exception, HttpStatusCode statusCode, string traceId)
    {
        var logLevel = statusCode >= HttpStatusCode.InternalServerError
            ? LogLevel.Error
            : LogLevel.Warning;

        _logger.Log(
            logLevel,
            exception,
            "Exception handled. StatusCode: {StatusCode}, TraceId: {TraceId}, Message: {Message}",
            (int)statusCode,
            traceId,
            exception.Message
        );
    }
}


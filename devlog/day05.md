# Day 05

## Backend Improvements

### Error Handling & Validation
- Added **FluentValidation** package for request validation
- Created `CreateSimpleFormRequestValidator` with validation rules:
  - First name: required, max 100 characters
  - Last name: required, max 100 characters
- Implemented `GlobalExceptionHandlerMiddleware` for centralized error handling:
  - Handles ValidationException (400 Bad Request) with structured error messages
  - Handles DbUpdateException (500 Internal Server Error)
  - Handles UnauthorizedAccessException (401 Unauthorized)
  - Handles KeyNotFoundException (404 Not Found)
  - Handles ArgumentException (400 Bad Request)
  - Generic exception handler for unexpected errors
  - Includes trace IDs for debugging (OpenTelemetry or HTTP trace identifier)
  - Environment-aware error messages (detailed in dev, generic in production)
- Created `ErrorResponse` DTO with message, validation errors dictionary, and trace ID
- Configured JSON serialization to use camelCase naming policy
- Updated `Program.cs` to:
  - Register FluentValidation validators
  - Add global exception handler middleware early in the pipeline
  - Use `ValidateAndThrowAsync` for automatic validation

## Frontend Improvements

### Error Handling & Retry Logic
- Enhanced `FormService` with comprehensive error handling:
  - Retry logic with exponential backoff:
    - GET requests: 3 retries (1s, 2s, 4s delays)
    - POST requests: 2 retries (1s, 2s delays)
    - Smart retry logic: doesn't retry on 4xx errors (except 408, 429)
  - User-friendly error messages for all HTTP status codes:
    - Network errors (0)
    - 400 Bad Request (with validation error extraction)
    - 401 Unauthorized
    - 403 Forbidden
    - 404 Not Found
    - 408 Timeout
    - 429 Too Many Requests
    - 500-599 Server Errors
  - Extracts validation errors from API responses
- Created `MockErrorService` for testing error scenarios:
  - Network errors
  - Validation errors
  - Server errors
  - Not found errors
  - Unauthorized errors
  - Timeout errors
  - Rate limit errors

### State Management Refactoring
- Created `BaseFormState` class for reusable form state management:
  - Loading states (submitting)
  - Error states (message, validation errors)
  - Form submission state
  - Computed signals for derived state (hasError, hasValidationErrors)
- Created `FormState` extending `BaseFormState`:
  - Manages forms list state
  - Loading state for forms fetching
  - Combined loading state computation
- Refactored `SimpleFormComponent` to use the new state management:
  - Cleaner separation of concerns
  - Better state encapsulation
  - Uses Angular signals for reactive state

### UI Enhancements
- Added Material Snackbar notifications:
  - Success notification on form submission
  - Error notifications with appropriate styling
- Improved validation error display:
  - Shows API validation errors on form fields
  - Displays validation errors from server response
  - Client-side validation with proper error messages
- Added loading indicators for form submission and forms loading
- Added "Trigger Random Error" button (dev mode only) for testing error scenarios

### Configuration
- Updated `proxy.conf.js` to use Aspire service discovery:
  - Uses environment variables from Aspire (`services__formapi__https__0` or `services__formapi__http__0`)
  - Maintains `/api` prefix when forwarding to backend
- Created centralized API endpoints configuration (`api-endpoints.ts`)

## Technical Details

### Error Response Format
```json
{
  "message": "Validation failed",
  "errors": {
    "firstName": ["First name is required."],
    "lastName": ["Last name must not exceed 100 characters."]
  },
  "traceId": "00-abc123..."
}
```

### State Management Pattern
- Uses Angular signals for reactive state
- Encapsulated state management with clear public API
- Computed signals for derived state
- Type-safe state updates


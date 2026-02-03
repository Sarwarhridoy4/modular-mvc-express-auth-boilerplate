# API Log API Documentation

This document provides details about the API endpoints for managing API logs and error tracking.

## Features

- ✅ Comprehensive request/response logging
- ✅ Error log filtering and pagination
- ✅ IP address and user tracking
- ✅ Query parameter validation with Zod
- ✅ Super Admin and Cashier error-log access

## Endpoints

### Clear all API logs

-   **URL:** `/logs`
-   **Method:** `DELETE`
-   **Description:** Clears all API logs from the system. This operation is restricted to `SUPER_ADMIN` users only.
-   **Authentication:** Requires a valid JWT token with `SUPER_ADMIN` role.
-   **Responses:**
    -   `200 OK`: API logs cleared successfully.
        ```json
        {
          "success": true,
          "statusCode": 200,
          "message": "API logs cleared successfully",
          "data": { "count": 150 }
        }
        ```
    -   `401 Unauthorized`: Authentication required.
    -   `403 Forbidden`: User does not have `SUPER_ADMIN` privileges.
    -   `500 Internal Server Error`: An unexpected error occurred.

### Get paginated error logs

-   **URL:** `/logs/admin/error-logs`
-   **Method:** `GET`
-   **Description:** Retrieves paginated error logs with advanced filtering options. Accessible by `SUPER_ADMIN` and `CASHIER` roles.
-   **Authentication:** Requires a valid JWT token with `SUPER_ADMIN` or `CASHIER` role.
-   **Query Parameters:**
    -   `page` (number, optional, default: 1): Page number for pagination
    -   `limit` (number, optional, default: 10): Number of items per page
    -   `statusCode` (number, optional): Filter by HTTP status code (e.g., 404, 500)
    -   `method` (string, optional): Filter by request method (e.g., GET, POST)
    -   `url` (string, optional): Filter by URL (partial match)
    -   `ip` (string, optional): Filter by IP address (partial match)
    -   `error` (string, optional): Filter by error message content (partial match)
    -   `userId` (string, optional): Filter by the ID of the user associated with the log
    -   `startDate` (string, optional): Filter logs from this date (ISO 8601 format)
    -   `endDate` (string, optional): Filter logs up to this date (ISO 8601 format)
    -   `sort` (string, optional): Sort order for results
-   **Example Request:**
    ```
    GET /api/v1/logs/admin/error-logs?page=1&limit=10&statusCode=500
    ```
-   **Responses:**
    -   `200 OK`: Error logs retrieved successfully.
        ```json
        {
          "success": true,
          "statusCode": 200,
          "message": "Error logs retrieved successfully",
          "data": {
            "logs": [
              {
                "id": "log-id",
                "method": "GET",
                "url": "/api/v1/posts",
                "ip": "127.0.0.1",
                "statusCode": 500,
                "error": "Database connection failed",
                "userId": "user-id",
                "createdAt": "2026-02-03T10:30:00.000Z"
              }
            ],
            "meta": {
              "page": 1,
              "limit": 10,
              "total": 45
            }
          }
        }
        ```
    -   `400 Bad Request`: Invalid query parameters.
    -   `401 Unauthorized`: Authentication required.
    -   `403 Forbidden`: User does not have required privileges.
    -   `500 Internal Server Error`: An unexpected error occurred.

## Technical Details

### Query Parameter Validation

- All query parameters are validated using Zod schemas
- String-to-number transformations are handled automatically
- Default values are provided for `page` and `limit`
- Invalid parameters return detailed validation error messages

### Logging Mechanism

- Automatic logging of all API requests and responses
- IP address detection (supports proxies and load balancers)
- User association for authenticated requests
- Error stack traces stored for debugging
- Request/response body logging (configurable)

### Performance Considerations

- Pagination prevents memory issues with large datasets
- Indexed database queries for fast filtering
- Efficient date range queries
- Automatic log cleanup (configurable via cron jobs)

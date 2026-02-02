# Api Log API Documentation

This document provides details about the API endpoints for managing API logs.

## Endpoints

### Clear all API logs

-   **URL:** `/logs`
-   **Method:** `DELETE`
-   **Description:** Clears all API logs from the system. This operation is restricted to `SUPER_ADMIN` users only.
-   **Authentication:** Requires a valid JWT token with `SUPER_ADMIN` role.
-   **Responses:**
    -   `200 OK`: API logs cleared successfully.
    -   `401 Unauthorized`: Authentication required.
    -   `403 Forbidden`: User does not have `SUPER_ADMIN` privileges.
    -   `500 Internal Server Error`: An unexpected error occurred.
# Post API Documentation

This document provides details about the API endpoints for managing posts.

## Endpoints

### Create a new post

-   **URL:** `/posts`
-   **Method:** `POST`
-   **Description:** Creates a new post. Only users with the `ADMIN` role can create posts.
-   **Authentication:** Requires a valid JWT token with `ADMIN` role.
-   **Request Body (`multipart/form-data`):**
    -   `title` (string, required): The title of the post.
    -   `content` (string, required): The content of the post.
    -   `published` (boolean, optional, default: `false`): Whether the post is published.
    -   `thumbnail` (file, optional): An image file for the post's thumbnail.
-   **Responses:**
    -   `201 Created`: Post created successfully.
    -   `400 Bad Request`: Invalid input data.
    -   `401 Unauthorized`: Authentication required.
    -   `403 Forbidden`: User does not have `ADMIN` privileges.
    -   `500 Internal Server Error`: An unexpected error occurred.

### Get all posts

-   **URL:** `/posts`
-   **Method:** `GET`
-   **Description:** Retrieves a list of all posts.
-   **Authentication:** None required.
-   **Responses:**
    -   `200 OK`: A list of posts.
    -   `500 Internal Server Error`: An unexpected error occurred.

### Get a single post by ID

-   **URL:** `/posts/{id}`
-   **Method:** `GET`
-   **Description:** Retrieves a single post by its ID.
-   **Authentication:** None required.
-   **Parameters:**
    -   `id` (integer, path, required): The ID of the post to retrieve.
-   **Responses:**
    -   `200 OK`: Post retrieved successfully.
    -   `404 Not Found`: Post with the specified ID not found.
    -   `500 Internal Server Error`: An unexpected error occurred.

### Update an existing post

-   **URL:** `/posts/{id}`
-   **Method:** `PATCH`
-   **Description:** Updates an existing post by its ID. Only users with the `ADMIN` role can update posts.
-   **Authentication:** Requires a valid JWT token with `ADMIN` role.
-   **Parameters:**
    -   `id` (integer, path, required): The ID of the post to update.
-   **Request Body (`multipart/form-data`):**
    -   `title` (string, optional): The updated title of the post.
    -   `content` (string, optional): The updated content of the post.
    -   `published` (boolean, optional): Whether the post is published.
    -   `thumbnail` (file, optional): A new image file for the post's thumbnail.
    -   `deleteThumbnail` (boolean, optional): Set to `true` to delete the existing thumbnail.
-   **Responses:**
    -   `200 OK`: Post updated successfully.
    -   `400 Bad Request`: Invalid input data.
    -   `401 Unauthorized`: Authentication required.
    -   `403 Forbidden`: User does not have `ADMIN` privileges or is not authorized to update this post.
    -   `404 Not Found`: Post with the specified ID not found.
    -   `500 Internal Server Error`: An unexpected error occurred.

### Delete a post

-   **URL:** `/posts/{id}`
-   **Method:** `DELETE`
-   **Description:** Deletes a post by its ID. Only users with the `ADMIN` role can delete posts.
-   **Authentication:** Requires a valid JWT token with `ADMIN` role.
-   **Parameters:**
    -   `id` (integer, path, required): The ID of the post to delete.
-   **Responses:**
    -   `200 OK`: Post deleted successfully.
    -   `401 Unauthorized`: Authentication required.
    -   `403 Forbidden`: User does not have `ADMIN` privileges or is not authorized to delete this post.
    -   `404 Not Found`: Post with the specified ID not found.
    -   `500 Internal Server Error`: An unexpected error occurred.
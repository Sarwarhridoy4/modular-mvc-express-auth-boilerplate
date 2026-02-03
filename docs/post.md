# Post API Documentation

This document provides details about the API endpoints for managing posts with Cloudinary integration.

## Features

- ✅ Create posts with thumbnail images
- ✅ Automatic Cloudinary asset management
- ✅ Transaction-based deletion for data consistency
- ✅ Old thumbnails automatically deleted when updating
- ✅ Author-based authorization
- ✅ ADMIN and SUPER_ADMIN roles can manage posts
- ✅ RESTful API design

## Endpoints

### Create a new post

-   **URL:** `/posts`
-   **Method:** `POST`
-   **Description:** Creates a new post with optional thumbnail image. Only users with `ADMIN` or `SUPER_ADMIN` role can create posts.
-   **Authentication:** Requires a valid JWT token with `ADMIN` or `SUPER_ADMIN` role.
-   **Request Body (`multipart/form-data`):**
    -   `title` (string, required): The title of the post.
    -   `content` (string, optional): The content of the post.
    -   `published` (string, optional, default: `"false"`): Whether the post is published. Use `"true"` or `"false"`.
    -   `thumbnail` (file, optional): An image file for the post's thumbnail.
-   **Responses:**
    -   `201 Created`: Post created successfully.
    -   `400 Bad Request`: Invalid input data.
    -   `401 Unauthorized`: Authentication required.
    -   `403 Forbidden`: User does not have required privileges.
    -   `500 Internal Server Error`: An unexpected error occurred.

### Get all posts

-   **URL:** `/posts`
-   **Method:** `GET`
-   **Description:** Retrieves a list of all posts. This is a public endpoint.
-   **Authentication:** None required.
-   **Responses:**
    -   `200 OK`: A list of posts with author information.
    -   `500 Internal Server Error`: An unexpected error occurred.

### Get a single post by ID

-   **URL:** `/posts/{id}`
-   **Method:** `GET`
-   **Description:** Retrieves a single post by its ID with author details.
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
-   **Description:** Updates an existing post. Only the post author can update it. When uploading a new thumbnail, the old one is automatically deleted from Cloudinary using Prisma transactions.
-   **Authentication:** Requires a valid JWT token with `ADMIN` or `SUPER_ADMIN` role.
-   **Authorization:** Only the post author can update the post.
-   **Parameters:**
    -   `id` (integer, path, required): The ID of the post to update.
-   **Request Body (`multipart/form-data`):**
    -   `title` (string, optional): The updated title of the post.
    -   `content` (string, optional): The updated content of the post.
    -   `published` (string, optional): Whether the post is published. Use `"true"` or `"false"`.
    -   `thumbnail` (file, optional): A new image file for the post's thumbnail. The old thumbnail will be automatically deleted from Cloudinary.
    -   `deleteThumbnail` (string, optional): Set to `"true"` to delete the existing thumbnail without uploading a new one.
-   **Process:**
    1. Validates user authorization
    2. If new thumbnail uploaded: Deletes old thumbnail from Cloudinary BEFORE database update
    3. Updates post in database using Prisma transaction
    4. If Cloudinary deletion fails, database update is rolled back
-   **Responses:**
    -   `200 OK`: Post updated successfully.
    -   `400 Bad Request`: Invalid input data.
    -   `401 Unauthorized`: Authentication required.
    -   `403 Forbidden`: User is not authorized to update this post.
    -   `404 Not Found`: Post with the specified ID not found.
    -   `500 Internal Server Error`: An unexpected error occurred.

### Delete a post

-   **URL:** `/posts/{id}`
-   **Method:** `DELETE`
-   **Description:** Permanently deletes a post and its associated thumbnail from Cloudinary. Only the post author can delete it.
-   **Authentication:** Requires a valid JWT token with `ADMIN` or `SUPER_ADMIN` role.
-   **Authorization:** Only the post author can delete the post.
-   **Parameters:**
    -   `id` (integer, path, required): The ID of the post to delete.
-   **Process:**
    1. Searches for the post in the database
    2. Deletes thumbnail from Cloudinary (if exists)
    3. Deletes post from database using Prisma transaction
    4. If Cloudinary deletion fails, database deletion is rolled back
-   **Responses:**
    -   `200 OK`: Post and associated Cloudinary assets deleted successfully.
    -   `401 Unauthorized`: Authentication required.
    -   `403 Forbidden`: User is not authorized to delete this post.
    -   `404 Not Found`: Post with the specified ID not found.
    -   `500 Internal Server Error`: An unexpected error occurred.

## Technical Details

### Cloudinary Integration

- All image uploads are handled through Cloudinary
- Images are stored in `post-thumbnails/{userId}` folders
- Automatic cleanup of old assets when updating or deleting posts
- Comprehensive logging for debugging upload/delete operations

### Transaction Safety

- Post updates and deletions use Prisma transactions
- Cloudinary operations happen BEFORE database changes
- Automatic rollback if any operation fails
- Ensures data consistency between database and cloud storage

### Field Type Conversions

- `published` field accepts string values `"true"` or `"false"` from multipart/form-data
- Automatically converted to boolean for database storage
- Compatible with Swagger UI form submissions

# Sage API Forge

**Version:** 1.0.0
**Category:** AI Development
**Tagline:** Scaffold robust REST & GraphQL APIs in minutes

## Overview

Sage API Forge automates the creation of production-ready API infrastructure. Generate controllers, routes, data models, validation logic, OpenAPI/GraphQL specifications, and comprehensive test suites for FastAPI, Express, or Apollo Server projects.

## When to Use

Use this Skill when you need to:

- Bootstrap a new backend API service
- Add RESTful or GraphQL endpoints to existing services
- Create microservice scaffolding
- Standardize API patterns across your organization
- Generate API documentation and tests automatically

## Supported Frameworks

| Framework | Language | Features |
|-----------|----------|----------|
| **FastAPI** | Python 3.12+ | Async, Pydantic validation, auto OpenAPI |
| **Express** | Node.js/TypeScript | Middleware, Zod validation, swagger-jsdoc |
| **Apollo Server** | Node.js/TypeScript | GraphQL SDL, resolvers, type safety |

## Quick Start

### Example 1: FastAPI Resource

**Prompt:**
```
Create a FastAPI API for managing blog posts with title, content, author, and published_at fields.
```

**Generated Files:**
- `app/models/post.py` - Database model
- `app/schemas/post.py` - Pydantic schemas (Create, Update, InDB)
- `app/services/post.py` - Business logic service
- `app/api/routes/v1/post.py` - API routes
- `tests/unit/test_post_service.py` - Unit tests
- `tests/integration/test_post_api.py` - Integration tests

### Example 2: Express Resource

**Prompt:**
```
Create an Express TypeScript API for user management with name, email, role fields and JWT authentication.
```

**Generated Files:**
- `src/types/user.types.ts` - Zod schemas & TypeScript types
- `src/models/user.model.ts` - Database model
- `src/services/user.service.ts` - Business logic
- `src/controllers/user.controller.ts` - Request handlers
- `src/routes/v1/user.routes.ts` - Route definitions
- `src/middleware/auth.ts` - JWT middleware
- `tests/unit/user.service.test.ts` - Unit tests
- `tests/integration/user.routes.test.ts` - Integration tests

### Example 3: GraphQL Schema

**Prompt:**
```
Create a GraphQL schema for a task management system with projects, tasks, and assignments.
```

**Generated Files:**
- `schema/project.graphql` - Project type definitions
- `schema/task.graphql` - Task type definitions
- `resolvers/project.ts` - Project resolvers
- `resolvers/task.ts` - Task resolvers
- `tests/resolvers/project.test.ts` - Resolver tests

## What Gets Generated

### 1. Models & Schemas

**Python (Pydantic):**
```python
class ResourceBase(BaseModel):
    """Base schema with shared fields."""
    name: str = Field(..., min_length=1, max_length=255)

class ResourceCreate(ResourceBase):
    """Schema for creation."""
    pass

class ResourceUpdate(BaseModel):
    """Schema for updates (all optional)."""
    name: str | None = None

class ResourceInDB(ResourceBase):
    """Schema for database records."""
    id: UUID
    created_at: datetime
    updated_at: datetime
```

**TypeScript (Zod):**
```typescript
const ResourceSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255),
  createdAt: z.date(),
  updatedAt: z.date(),
});

type Resource = z.infer<typeof ResourceSchema>;
```

### 2. CRUD Routes

All standard REST operations:
- `POST /api/v1/resources` - Create
- `GET /api/v1/resources` - List (with pagination)
- `GET /api/v1/resources/{id}` - Read
- `PUT /api/v1/resources/{id}` - Update
- `DELETE /api/v1/resources/{id}` - Delete

### 3. Validation

- Input validation at API boundary
- Type safety throughout the stack
- Proper error messages for validation failures
- HTTP 400 responses with field-level errors

### 4. OpenAPI Documentation

Auto-generated Swagger UI with:
- Request/response schemas
- Status codes and error responses
- Example payloads
- Authentication requirements
- Try-it-out functionality

### 5. Test Suites

**Unit Tests:**
- Service method tests
- Mock database/external dependencies
- Edge case coverage
- 80%+ code coverage

**Integration Tests:**
- Full HTTP request/response cycle
- Real database (or test DB)
- Authentication flows
- Error scenarios

### 6. Configuration

- Environment variable setup
- Database connection configuration
- CORS and security headers
- Logging and monitoring hooks

## Usage Examples

### Basic Resource

```
Create a REST API for managing products with name, price, description, and stock fields.
```

### With Relationships

```
Create a REST API for orders that references users and products, with order items as a nested relationship.
```

### With Authentication

```
Create a REST API for user profiles with authentication middleware and role-based access control.
```

### GraphQL

```
Create a GraphQL schema for a social media app with users, posts, comments, and likes.
```

## Best Practices Applied

1. **Type Safety**: Strong typing with Pydantic/Zod
2. **Separation of Concerns**: Models, schemas, services, routes in separate files
3. **Dependency Injection**: Services injected via FastAPI Depends() or Express middleware
4. **Error Handling**: Structured error responses with proper HTTP codes
5. **Testing**: Comprehensive unit and integration tests
6. **Documentation**: Auto-generated OpenAPI/GraphQL docs
7. **Security**: Input validation, no SQL injection, parameterized queries
8. **Standards**: RESTful conventions, semantic versioning (v1, v2)

## Dependencies

### Python (FastAPI)

```bash
uv add fastapi pydantic uvicorn[standard] python-multipart
uv add --dev pytest pytest-asyncio httpx
```

### Node.js (Express)

```bash
npm install express zod swagger-jsdoc swagger-ui-express
npm install --save-dev typescript @types/express jest supertest
```

### Node.js (Apollo Server)

```bash
npm install @apollo/server graphql
npm install --save-dev @graphql-tools/schema @graphql-tools/mock jest
```

## Tips

1. **Start Simple**: Begin with basic CRUD, add complexity incrementally
2. **Test Early**: Run tests after each endpoint is generated
3. **Review Models**: Verify field types and constraints match requirements
4. **Customize**: Treat generated code as a starting point, refine as needed
5. **Versioning**: Always use versioned routes (v1, v2) for stability

## Common Patterns

### Pagination

```python
@router.get("/", response_model=list[ResourceInDB])
async def list_resources(
    skip: int = 0,
    limit: int = 100,
    service: ResourceService = Depends(),
):
    return await service.get_multi(skip=skip, limit=limit)
```

### Filtering

```python
@router.get("/", response_model=list[ResourceInDB])
async def list_resources(
    status: str | None = None,
    service: ResourceService = Depends(),
):
    return await service.get_by_status(status) if status else await service.get_all()
```

### Soft Deletes

```python
@router.delete("/{resource_id}")
async def delete_resource(
    resource_id: UUID,
    service: ResourceService = Depends(),
):
    await service.soft_delete(resource_id)
    return {"status": "deleted"}
```

## Limitations

- Does not generate database migrations (use Alembic/Prisma separately)
- Does not include authentication implementation (provides structure only)
- Does not generate frontend clients (use OpenAPI generators for that)
- Assumes standard CRUD patterns (complex workflows need manual coding)

## Next Steps After Generation

1. **Review Generated Code**: Verify field types and validation rules
2. **Run Tests**: `pytest` or `npm test` to ensure everything works
3. **Add Database**: Configure SQLAlchemy/Prisma/TypeORM
4. **Implement Auth**: Add JWT/OAuth2 middleware
5. **Customize Logic**: Extend services with business-specific logic
6. **Document**: Update README with project-specific details

## Related Skills

- **Sage Test Factory**: Generate more comprehensive test suites
- **Sage Doc Weaver**: Create detailed API documentation
- **Sage Python Quality Suite**: Enforce typing and test coverage

## Support

For issues or feature requests, see the main [Sage-Dev repository](https://github.com/Mathews-Tom/sage-dev).

---

**Build production-ready APIs in minutes, not hours.** 🚀

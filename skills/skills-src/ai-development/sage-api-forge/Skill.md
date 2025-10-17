---
name: Sage API Forge
description: Generate production-ready REST and GraphQL API scaffolding, including models, routes, validation, OpenAPI specs, and tests.
version: 1.0.0
dependencies: python>=3.12, node>=18.x
---

# Sage API Forge

Scaffold robust REST & GraphQL APIs in minutes with production-ready boilerplate.

## Purpose

Automate the creation of backend API infrastructure including controllers, routes, data models, validation logic, OpenAPI/GraphQL specifications, and comprehensive test suites.

## When to Use

- Initializing new backend services
- Adding endpoints to existing services
- Scaffolding microservices
- Creating API prototypes
- Standardizing API patterns across services

## Core Workflow

### 1. Tech Stack Detection

First, analyze the project context to determine the appropriate framework:

**Python (FastAPI):**
- Check for `pyproject.toml`, `requirements.txt`, `*.py` files
- Default to async patterns with Pydantic models
- Generate OpenAPI 3.1 specs automatically

**Node.js (Express):**
- Check for `package.json`, `*.js`, `*.ts` files
- Support for TypeScript or JavaScript
- Generate OpenAPI specs with swagger-jsdoc

**GraphQL (Apollo Server):**
- Check for GraphQL schema files or Apollo dependencies
- Generate SDL (Schema Definition Language)
- Support for TypeScript resolvers

### 2. Directory Structure Scaffolding

Generate standard, production-ready directory structure:

**FastAPI:**
```
app/
├── api/
│   ├── routes/
│   │   └── v1/
│   │       ├── __init__.py
│   │       └── {resource}.py
│   └── deps.py
├── core/
│   ├── config.py
│   └── security.py
├── models/
│   └── {resource}.py
├── schemas/
│   ├── __init__.py
│   └── {resource}.py
├── services/
│   └── {resource}.py
├── tests/
│   ├── unit/
│   └── integration/
└── main.py
```

**Express:**
```
src/
├── routes/
│   └── v1/
│       └── {resource}.routes.ts
├── controllers/
│   └── {resource}.controller.ts
├── models/
│   └── {resource}.model.ts
├── middleware/
│   ├── auth.ts
│   └── validation.ts
├── services/
│   └── {resource}.service.ts
├── types/
│   └── {resource}.types.ts
├── tests/
│   ├── unit/
│   └── integration/
└── app.ts
```

### 3. Model Generation

Create strongly-typed data models with validation:

**Python (Pydantic):**
```python
from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from uuid import UUID

class {Resource}Base(BaseModel):
    """Base schema for {Resource}."""
    name: str = Field(..., min_length=1, max_length=255)
    description: str | None = None

class {Resource}Create(BaseModel):
    """Schema for creating {Resource}."""
    model_config = ConfigDict(from_attributes=True)

class {Resource}Update(BaseModel):
    """Schema for updating {Resource}."""
    name: str | None = None
    description: str | None = None

class {Resource}InDB({Resource}Base):
    """Schema for {Resource} in database."""
    id: UUID
    created_at: datetime
    updated_at: datetime
```

**TypeScript (Zod):**
```typescript
import { z } from 'zod';

export const {Resource}Schema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type {Resource} = z.infer<typeof {Resource}Schema>;
export type {Resource}Create = Omit<{Resource}, 'id' | 'createdAt' | 'updatedAt'>;
export type {Resource}Update = Partial<{Resource}Create>;
```

### 4. Route/Controller Generation

Generate RESTful route handlers with proper HTTP methods:

**FastAPI:**
```python
from fastapi import APIRouter, Depends, HTTPException, status
from uuid import UUID
from app.schemas.{resource} import {Resource}Create, {Resource}Update, {Resource}InDB
from app.services.{resource} import {Resource}Service

router = APIRouter(prefix="/api/v1/{resources}", tags=["{resources}"])

@router.post("/", response_model={Resource}InDB, status_code=status.HTTP_201_CREATED)
async def create_{resource}(
    data: {Resource}Create,
    service: {Resource}Service = Depends(),
) -> {Resource}InDB:
    """Create a new {resource}."""
    return await service.create(data)

@router.get("/{{{resource}_id}}", response_model={Resource}InDB)
async def get_{resource}(
    {resource}_id: UUID,
    service: {Resource}Service = Depends(),
) -> {Resource}InDB:
    """Get {resource} by ID."""
    {resource} = await service.get_by_id({resource}_id)
    if not {resource}:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="{Resource} not found"
        )
    return {resource}

@router.put("/{{{resource}_id}}", response_model={Resource}InDB)
async def update_{resource}(
    {resource}_id: UUID,
    data: {Resource}Update,
    service: {Resource}Service = Depends(),
) -> {Resource}InDB:
    """Update {resource}."""
    {resource} = await service.update({resource}_id, data)
    if not {resource}:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="{Resource} not found"
        )
    return {resource}

@router.delete("/{{{resource}_id}}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_{resource}(
    {resource}_id: UUID,
    service: {Resource}Service = Depends(),
) -> None:
    """Delete {resource}."""
    deleted = await service.delete({resource}_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="{Resource} not found"
        )
```

### 5. OpenAPI/GraphQL Schema Generation

**OpenAPI (FastAPI):**
- Automatically generated from Pydantic models
- Add custom tags, descriptions, and examples
- Configure security schemes (OAuth2, API Key, JWT)

**OpenAPI (Express):**
```typescript
/**
 * @swagger
 * /api/v1/{resources}:
 *   post:
 *     summary: Create a new {resource}
 *     tags: [{Resources}]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/{Resource}Create'
 *     responses:
 *       201:
 *         description: {Resource} created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/{Resource}'
 */
```

**GraphQL SDL:**
```graphql
type {Resource} {
  id: ID!
  name: String!
  description: String
  createdAt: DateTime!
  updatedAt: DateTime!
}

input {Resource}CreateInput {
  name: String!
  description: String
}

input {Resource}UpdateInput {
  name: String
  description: String
}

type Query {
  {resource}(id: ID!): {Resource}
  {resources}(limit: Int = 10, offset: Int = 0): [{Resource}!]!
}

type Mutation {
  create{Resource}(input: {Resource}CreateInput!): {Resource}!
  update{Resource}(id: ID!, input: {Resource}UpdateInput!): {Resource}!
  delete{Resource}(id: ID!): Boolean!
}
```

### 6. Test Generation

Generate comprehensive test suites:

**Unit Tests (pytest):**
```python
import pytest
from uuid import uuid4
from app.schemas.{resource} import {Resource}Create, {Resource}Update
from app.services.{resource} import {Resource}Service

@pytest.fixture
def {resource}_service():
    return {Resource}Service()

@pytest.fixture
def sample_{resource}_data():
    return {Resource}Create(
        name="Test {Resource}",
        description="Test description"
    )

async def test_create_{resource}({resource}_service, sample_{resource}_data):
    result = await {resource}_service.create(sample_{resource}_data)
    assert result.name == sample_{resource}_data.name
    assert result.id is not None

async def test_get_{resource}({resource}_service, sample_{resource}_data):
    created = await {resource}_service.create(sample_{resource}_data)
    retrieved = await {resource}_service.get_by_id(created.id)
    assert retrieved is not None
    assert retrieved.id == created.id

async def test_update_{resource}({resource}_service, sample_{resource}_data):
    created = await {resource}_service.create(sample_{resource}_data)
    update_data = {Resource}Update(name="Updated Name")
    updated = await {resource}_service.update(created.id, update_data)
    assert updated.name == "Updated Name"

async def test_delete_{resource}({resource}_service, sample_{resource}_data):
    created = await {resource}_service.create(sample_{resource}_data)
    deleted = await {resource}_service.delete(created.id)
    assert deleted is True
    retrieved = await {resource}_service.get_by_id(created.id)
    assert retrieved is None
```

**Integration Tests (FastAPI TestClient):**
```python
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_create_{resource}_endpoint():
    response = client.post(
        "/api/v1/{resources}/",
        json={"name": "Test {Resource}", "description": "Test"}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Test {Resource}"
    assert "id" in data

def test_get_{resource}_endpoint():
    # Create first
    create_response = client.post(
        "/api/v1/{resources}/",
        json={"name": "Test {Resource}"}
    )
    {resource}_id = create_response.json()["id"]

    # Then get
    response = client.get(f"/api/v1/{resources}/{{{resource}_id}}")
    assert response.status_code == 200
    assert response.json()["id"] == {resource}_id

def test_update_{resource}_endpoint():
    # Create first
    create_response = client.post(
        "/api/v1/{resources}/",
        json={"name": "Test {Resource}"}
    )
    {resource}_id = create_response.json()["id"]

    # Then update
    response = client.put(
        f"/api/v1/{resources}/{{{resource}_id}}",
        json={"name": "Updated Name"}
    )
    assert response.status_code == 200
    assert response.json()["name"] == "Updated Name"

def test_delete_{resource}_endpoint():
    # Create first
    create_response = client.post(
        "/api/v1/{resources}/",
        json={"name": "Test {Resource}"}
    )
    {resource}_id = create_response.json()["id"]

    # Then delete
    response = client.delete(f"/api/v1/{resources}/{{{resource}_id}}")
    assert response.status_code == 204

    # Verify deletion
    get_response = client.get(f"/api/v1/{resources}/{{{resource}_id}}")
    assert get_response.status_code == 404
```

## Best Practices

1. **Type Safety**: Use strong typing throughout (Pydantic for Python, Zod/TypeScript for Node)
2. **Validation**: Validate at API boundary, not in business logic
3. **Error Handling**: Use proper HTTP status codes and structured error responses
4. **Testing**: Maintain 80%+ coverage with unit and integration tests
5. **Documentation**: Auto-generate OpenAPI docs, keep them in sync with code
6. **Versioning**: Use URL versioning (v1, v2) for API stability
7. **Security**: Implement authentication/authorization from the start

## Configuration Files

### FastAPI Dependencies

```toml
[project]
dependencies = [
    "fastapi>=0.115.0",
    "pydantic>=2.0.0",
    "uvicorn[standard]>=0.30.0",
    "python-multipart>=0.0.9",
]

[project.optional-dependencies]
dev = [
    "pytest>=8.0.0",
    "pytest-asyncio>=0.24.0",
    "httpx>=0.27.0",
]
```

### Express Dependencies

```json
{
  "dependencies": {
    "express": "^4.18.0",
    "zod": "^3.22.0",
    "swagger-jsdoc": "^6.2.0",
    "swagger-ui-express": "^5.0.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.0",
    "typescript": "^5.3.0",
    "jest": "^29.7.0",
    "supertest": "^6.3.0"
  }
}
```

## Output Format

When scaffolding APIs, always:

1. Confirm the tech stack with the user
2. List all files that will be created
3. Generate files in dependency order (models → services → routes → tests)
4. Provide installation commands for dependencies
5. Include example curl commands or HTTP requests for testing
6. Generate README with API documentation

## Error Handling

Follow these patterns:

**FastAPI:**
```python
from fastapi import HTTPException, status

# 400 Bad Request
raise HTTPException(
    status_code=status.HTTP_400_BAD_REQUEST,
    detail="Invalid request data"
)

# 404 Not Found
raise HTTPException(
    status_code=status.HTTP_404_NOT_FOUND,
    detail="Resource not found"
)

# 409 Conflict
raise HTTPException(
    status_code=status.HTTP_409_CONFLICT,
    detail="Resource already exists"
)
```

**Express:**
```typescript
class APIError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public details?: unknown
  ) {
    super(message);
  }
}

// Usage
if (!resource) {
  throw new APIError(404, 'Resource not found');
}
```

## Integration Points

Consider these common integrations:

- **Database**: SQLAlchemy (Python), Prisma/TypeORM (Node)
- **Authentication**: OAuth2, JWT, API Keys
- **Caching**: Redis for response caching
- **Rate Limiting**: slowapi (Python), express-rate-limit (Node)
- **CORS**: Built-in middleware for both frameworks
- **Logging**: structlog (Python), winston (Node)
- **Monitoring**: Prometheus metrics, APM integration

## Quality Checklist

Before completing API scaffolding, verify:

- [ ] All CRUD operations implemented
- [ ] Input validation on all endpoints
- [ ] Proper HTTP status codes
- [ ] Error responses follow consistent format
- [ ] OpenAPI/GraphQL schema generated
- [ ] Unit tests for all service methods
- [ ] Integration tests for all endpoints
- [ ] README with setup and usage instructions
- [ ] Dependencies documented in pyproject.toml/package.json
- [ ] Type hints/annotations throughout
- [ ] No hardcoded secrets or credentials

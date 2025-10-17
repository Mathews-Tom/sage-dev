# FastAPI Resource Template
# Replace {Resource}, {resource}, {resources} with actual names

from fastapi import APIRouter, Depends, HTTPException, status
from uuid import UUID
from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime

# ==================== SCHEMAS ====================

class {Resource}Base(BaseModel):
    """Base schema for {Resource}."""
    name: str = Field(..., min_length=1, max_length=255, description="Name of the {resource}")
    description: str | None = Field(None, description="Optional description")

class {Resource}Create({Resource}Base):
    """Schema for creating {Resource}."""
    model_config = ConfigDict(from_attributes=True)

class {Resource}Update(BaseModel):
    """Schema for updating {Resource}."""
    name: str | None = Field(None, min_length=1, max_length=255)
    description: str | None = None

class {Resource}InDB({Resource}Base):
    """Schema for {Resource} in database."""
    id: UUID = Field(..., description="Unique identifier")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")

    model_config = ConfigDict(from_attributes=True)

# ==================== SERVICE ====================

class {Resource}Service:
    """Business logic for {resource} operations."""

    async def create(self, data: {Resource}Create) -> {Resource}InDB:
        """Create a new {resource}."""
        # TODO: Implement database insertion
        raise NotImplementedError("Database layer not configured")

    async def get_by_id(self, {resource}_id: UUID) -> {Resource}InDB | None:
        """Get {resource} by ID."""
        # TODO: Implement database query
        raise NotImplementedError("Database layer not configured")

    async def get_multi(self, skip: int = 0, limit: int = 100) -> list[{Resource}InDB]:
        """Get multiple {resources} with pagination."""
        # TODO: Implement database query with pagination
        raise NotImplementedError("Database layer not configured")

    async def update(self, {resource}_id: UUID, data: {Resource}Update) -> {Resource}InDB | None:
        """Update {resource}."""
        # TODO: Implement database update
        raise NotImplementedError("Database layer not configured")

    async def delete(self, {resource}_id: UUID) -> bool:
        """Delete {resource}."""
        # TODO: Implement database deletion
        raise NotImplementedError("Database layer not configured")

# ==================== ROUTER ====================

router = APIRouter(
    prefix="/api/v1/{resources}",
    tags=["{resources}"],
    responses={404: {"description": "Not found"}},
)

def get_{resource}_service() -> {Resource}Service:
    """Dependency to inject {resource} service."""
    return {Resource}Service()

@router.post(
    "/",
    response_model={Resource}InDB,
    status_code=status.HTTP_201_CREATED,
    summary="Create {resource}",
    response_description="The created {resource}",
)
async def create_{resource}(
    data: {Resource}Create,
    service: {Resource}Service = Depends(get_{resource}_service),
) -> {Resource}InDB:
    """
    Create a new {resource} with the following fields:

    - **name**: Required name field
    - **description**: Optional description field
    """
    try:
        return await service.create(data)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create {resource}: {str(e)}"
        )

@router.get(
    "/{{{resource}_id}}",
    response_model={Resource}InDB,
    summary="Get {resource} by ID",
)
async def get_{resource}(
    {resource}_id: UUID,
    service: {Resource}Service = Depends(get_{resource}_service),
) -> {Resource}InDB:
    """Get a {resource} by its unique ID."""
    {resource} = await service.get_by_id({resource}_id)
    if not {resource}:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"{Resource} with ID {{{resource}_id}} not found"
        )
    return {resource}

@router.get(
    "/",
    response_model=list[{Resource}InDB],
    summary="List {resources}",
)
async def list_{resources}(
    skip: int = 0,
    limit: int = 100,
    service: {Resource}Service = Depends(get_{resource}_service),
) -> list[{Resource}InDB]:
    """
    List {resources} with pagination.

    - **skip**: Number of records to skip (default: 0)
    - **limit**: Maximum number of records to return (default: 100, max: 1000)
    """
    if limit > 1000:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Limit cannot exceed 1000"
        )
    return await service.get_multi(skip=skip, limit=limit)

@router.put(
    "/{{{resource}_id}}",
    response_model={Resource}InDB,
    summary="Update {resource}",
)
async def update_{resource}(
    {resource}_id: UUID,
    data: {Resource}Update,
    service: {Resource}Service = Depends(get_{resource}_service),
) -> {Resource}InDB:
    """Update a {resource} by ID. Only provided fields will be updated."""
    {resource} = await service.update({resource}_id, data)
    if not {resource}:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"{Resource} with ID {{{resource}_id}} not found"
        )
    return {resource}

@router.delete(
    "/{{{resource}_id}}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete {resource}",
)
async def delete_{resource}(
    {resource}_id: UUID,
    service: {Resource}Service = Depends(get_{resource}_service),
) -> None:
    """Delete a {resource} by ID."""
    deleted = await service.delete({resource}_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"{Resource} with ID {{{resource}_id}} not found"
        )

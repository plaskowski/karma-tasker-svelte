# Persistence API Layer

This directory contains the persistence abstraction layer that separates data storage concerns from the application logic.

## Architecture

```
Application Layer (routes, components)
    ↓ uses domain types (Task, Project, Workspace)
Service Layer (optional business logic)
    ↓ maps between domain and DTOs
Persistence API (interface)
    ↓ uses DTO types (*Dto, *Request)
Adapter Implementation (localStorage, REST, IndexedDB)
    ↓
Storage Backend
```

## Key Concepts

### DTOs (Data Transfer Objects)
- `*Dto` types represent data as stored/transmitted
- Snake_case for API compatibility (`workspace_id`, `created_at`)
- ISO date strings instead of Date objects
- Flat structure optimized for serialization

### Domain Models
- Business entities used throughout the application
- CamelCase naming (`workspaceId`, `createdAt`)
- Rich types (Date objects, enums)
- May include computed properties

### Mappers
- Convert between DTOs and domain models
- Handle naming convention transformations
- Parse/format dates and other types
- Located in `mappers.ts`

## Benefits

1. **Backend Compatibility**: DTOs can match exact API contracts
2. **Type Safety**: Clear boundaries between layers
3. **Evolution**: API can change without breaking domain logic
4. **Testing**: Easy to mock the persistence layer
5. **Migration**: Simple to switch storage backends

## Usage Example

```typescript
import { db } from '$lib/api/localStorageAdapter';
import { toDomainTask, toUpdateTaskRequest } from '$lib/api/mappers';

// Reading data
const taskDto = await db.getTask(id);
const task = taskDto ? toDomainTask(taskDto) : null;

// Writing data
const request = toUpdateTaskRequest({ completed: true });
const updatedDto = await db.updateTask(id, request);
const updatedTask = toDomainTask(updatedDto);
```

## Implementing a New Adapter

1. Implement the `PersistenceAPI` interface
2. Work with DTO types only
3. Handle serialization in your adapter
4. Export a singleton instance

```typescript
export class MyAdapter implements PersistenceAPI {
  async getTasks(): Promise<TaskDto[]> {
    // Your implementation
  }
  // ... other methods
}

export const db = new MyAdapter();
```
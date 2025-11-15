---
name: "Dependency Injection"
category: "architecture"
languages:
  - python
  - typescript
prerequisites:
  tools:
    - python>=3.8
  knowledge:
    - basic-unit-testing
evidence:
  - "https://martinfowler.com/articles/injection.html"
  - "Book: Dependency Injection Principles, Practices, and Patterns by Mark Seemann"
  - "https://www.jamesshore.com/v2/blog/2006/dependency-injection-demystified"
validated: true
validated_by:
  - type-enforcer
---

# Dependency Injection

## Purpose

**When to use:**
- Classes depend on external services (database, API, file system)
- Unit testing requires isolation from dependencies
- Swapping implementations at runtime
- Configuring behavior without modifying code
- Reducing coupling between modules

**When NOT to use:**
- Simple scripts with no testing requirements
- Dependencies that never change (math utilities, string helpers)
- Over-engineering simple problems
- When it adds complexity without benefit

**Benefits:**
- Enables unit testing with test doubles (mocks, stubs)
- Reduces tight coupling between components
- Makes dependencies explicit and visible
- Supports open/closed principle
- Simplifies configuration and composition

## Prerequisites

### Tools Required

```bash
which python3 && python3 --version
```

### Knowledge Required

- Basic unit testing concepts
- Understanding of interfaces/protocols
- Object-oriented programming principles

## Algorithm

### Step 1: Identify Hidden Dependencies

**What:** Find hardcoded dependencies inside classes/functions
**Why:** Hidden dependencies prevent testing and flexibility
**How:**
```python
# BEFORE: Hidden dependencies
class OrderProcessor:
    def process(self, order):
        # Hidden dependency: Database access
        db = DatabaseConnection()
        user = db.find_user(order.user_id)

        # Hidden dependency: External API
        payment = PaymentGateway()
        result = payment.charge(user.card, order.total)

        # Hidden dependency: Email service
        email = EmailService()
        email.send_confirmation(user.email, order)

        return result

# Problems:
# 1. Cannot test without real database
# 2. Cannot test without real payment gateway
# 3. Cannot test without real email service
# 4. Cannot swap implementations
```

**Verification:**
- All `new`/constructor calls inside methods identified
- External service calls identified
- File system, network, database access identified

### Step 2: Extract Interfaces/Protocols

**What:** Define contracts for dependencies
**Why:** Enables substitution and makes expectations explicit
**How:**
```python
from typing import Protocol

# Define what we need, not how it's implemented
class UserRepository(Protocol):
    def find_by_id(self, user_id: str) -> User: ...

class PaymentProcessor(Protocol):
    def charge(self, card: Card, amount: float) -> PaymentResult: ...

class NotificationService(Protocol):
    def send_order_confirmation(self, email: str, order: Order) -> None: ...

# Benefits:
# 1. Clear contract for each dependency
# 2. Can have multiple implementations
# 3. Test doubles can implement same protocol
```

**Verification:**
- Each dependency has explicit interface
- Interface defines only what's needed (Interface Segregation)
- No implementation details in interface

### Step 3: Accept Dependencies via Constructor

**What:** Pass dependencies into class during instantiation
**Why:** Makes dependencies explicit and injectable
**How:**
```python
class OrderProcessor:
    def __init__(
        self,
        user_repo: UserRepository,
        payment: PaymentProcessor,
        notifier: NotificationService
    ):
        self._user_repo = user_repo
        self._payment = payment
        self._notifier = notifier

    def process(self, order: Order) -> PaymentResult:
        user = self._user_repo.find_by_id(order.user_id)
        result = self._payment.charge(user.card, order.total)
        self._notifier.send_order_confirmation(user.email, order)
        return result

# Benefits:
# 1. Dependencies are explicit in constructor signature
# 2. Cannot create OrderProcessor without providing dependencies
# 3. Easy to swap implementations
# 4. Easy to test with mock implementations
```

**Verification:**
- Dependencies passed through constructor
- Dependencies stored as private instance variables
- No hidden creation of dependencies inside methods
- Constructor parameter types match protocols

### Step 4: Create Production Implementations

**What:** Implement interfaces for real production use
**Why:** Separate production concerns from business logic
**How:**
```python
# Production implementations
class PostgresUserRepository:
    def __init__(self, connection_string: str):
        self._conn = psycopg2.connect(connection_string)

    def find_by_id(self, user_id: str) -> User:
        cursor = self._conn.cursor()
        cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))
        row = cursor.fetchone()
        return User.from_row(row)

class StripePaymentProcessor:
    def __init__(self, api_key: str):
        self._api_key = api_key

    def charge(self, card: Card, amount: float) -> PaymentResult:
        stripe.api_key = self._api_key
        charge = stripe.Charge.create(
            amount=int(amount * 100),
            currency="usd",
            source=card.token
        )
        return PaymentResult(success=True, transaction_id=charge.id)

class SendGridNotificationService:
    def __init__(self, api_key: str):
        self._client = SendGridClient(api_key)

    def send_order_confirmation(self, email: str, order: Order) -> None:
        self._client.send(
            to=email,
            subject=f"Order {order.id} Confirmed",
            body=f"Your order total: ${order.total}"
        )
```

**Verification:**
- Each production implementation satisfies its protocol
- Implementation details encapsulated
- Configuration (API keys, connection strings) injected

### Step 5: Wire Up in Composition Root

**What:** Assemble object graph at application entry point
**Why:** Centralize configuration and dependency creation
**How:**
```python
# composition_root.py (called at startup)
def create_order_processor() -> OrderProcessor:
    """Create fully configured OrderProcessor for production."""
    config = load_config()

    user_repo = PostgresUserRepository(config.database_url)
    payment = StripePaymentProcessor(config.stripe_api_key)
    notifier = SendGridNotificationService(config.sendgrid_api_key)

    return OrderProcessor(user_repo, payment, notifier)

# main.py
def main():
    processor = create_order_processor()
    # Use processor...

# Benefits:
# 1. All wiring in one place
# 2. Easy to see full dependency graph
# 3. Configuration centralized
# 4. Can have different roots for prod/dev/test
```

**Verification:**
- Composition happens at application entry
- Business logic doesn't know about wiring
- Configuration loaded from environment/config files
- No scattered dependency creation

### Step 6: Test with Test Doubles

**What:** Substitute real dependencies with test implementations
**Why:** Unit tests become fast, isolated, and deterministic
**How:**
```python
import pytest

# Test doubles
class FakeUserRepository:
    def __init__(self):
        self.users = {}

    def find_by_id(self, user_id: str) -> User:
        return self.users[user_id]

class FakePaymentProcessor:
    def __init__(self):
        self.should_succeed = True
        self.charges = []

    def charge(self, card: Card, amount: float) -> PaymentResult:
        self.charges.append((card, amount))
        if self.should_succeed:
            return PaymentResult(success=True, transaction_id="fake-123")
        return PaymentResult(success=False, error="Declined")

class SpyNotificationService:
    def __init__(self):
        self.sent_notifications = []

    def send_order_confirmation(self, email: str, order: Order) -> None:
        self.sent_notifications.append((email, order))

# Unit test with full control
def test_process_order_charges_correct_amount():
    # Arrange
    user_repo = FakeUserRepository()
    user_repo.users["user1"] = User(
        id="user1",
        email="test@example.com",
        card=Card(token="card_token")
    )
    payment = FakePaymentProcessor()
    notifier = SpyNotificationService()

    processor = OrderProcessor(user_repo, payment, notifier)
    order = Order(user_id="user1", total=99.99)

    # Act
    result = processor.process(order)

    # Assert
    assert result.success is True
    assert payment.charges == [(user_repo.users["user1"].card, 99.99)]
    assert len(notifier.sent_notifications) == 1
    assert notifier.sent_notifications[0][0] == "test@example.com"
```

**Verification:**
- Tests run without external dependencies
- Tests are fast (milliseconds, not seconds)
- Tests are deterministic (same result every time)
- Test doubles are simple implementations

## Validation

### Success Criteria

- [ ] No hidden dependencies (no hardcoded `new` inside methods)
- [ ] Interfaces/protocols define dependency contracts
- [ ] Dependencies passed through constructor
- [ ] Composition root wires object graph
- [ ] Unit tests use test doubles
- [ ] Tests are fast and isolated

### Automated Validation

```bash
pytest tests/ --tb=short
mypy src/ --strict  # Verify protocols implemented correctly
```

### Manual Verification

1. Can swap any dependency without changing business logic
2. Unit tests don't require external services
3. Dependencies visible in constructor signatures
4. Configuration centralized in composition root

## Common Pitfalls

### Pitfall 1: Service Locator Anti-Pattern

**Symptom:** Dependencies fetched from global container inside methods
**Cause:** Trying to avoid constructor parameters
**Solution:** Always inject through constructor; service locator hides dependencies

### Pitfall 2: Too Many Constructor Parameters

**Symptom:** Constructor has 10+ parameters
**Cause:** Class doing too much (violates Single Responsibility)
**Solution:** Split class into smaller, focused classes

### Pitfall 3: Injecting Configuration Instead of Services

**Symptom:** Injecting config objects and creating services inside class
**Cause:** Incomplete DI; still hiding dependency creation
**Solution:** Inject fully constructed dependencies, not their configs

### Pitfall 4: Abstract All The Things

**Symptom:** Interfaces for simple, stable utilities (string formatters, math)
**Cause:** Over-applying DI where not needed
**Solution:** Only inject volatile dependencies (I/O, external services, time)

## Examples

### Python Example

**Scenario:** Repository pattern with DI

```python
from typing import Protocol
from datetime import datetime

# Protocol definitions
class Clock(Protocol):
    def now(self) -> datetime: ...

class OrderRepository(Protocol):
    def save(self, order: Order) -> None: ...
    def find_by_id(self, order_id: str) -> Order | None: ...

class EventPublisher(Protocol):
    def publish(self, event: Event) -> None: ...

# Business logic with injected dependencies
class OrderService:
    def __init__(
        self,
        clock: Clock,
        orders: OrderRepository,
        events: EventPublisher
    ):
        self._clock = clock
        self._orders = orders
        self._events = events

    def create_order(self, items: list[OrderItem]) -> Order:
        order = Order(
            id=generate_id(),
            items=items,
            created_at=self._clock.now(),
            status=OrderStatus.PENDING
        )
        self._orders.save(order)
        self._events.publish(OrderCreatedEvent(order))
        return order

# Production implementations
class SystemClock:
    def now(self) -> datetime:
        return datetime.utcnow()

class SqlOrderRepository:
    def __init__(self, session):
        self._session = session

    def save(self, order: Order) -> None:
        self._session.add(order)
        self._session.commit()

    def find_by_id(self, order_id: str) -> Order | None:
        return self._session.query(Order).filter_by(id=order_id).first()

class KafkaEventPublisher:
    def __init__(self, producer):
        self._producer = producer

    def publish(self, event: Event) -> None:
        self._producer.send(event.topic, event.serialize())

# Test with controlled clock
def test_order_created_with_current_time():
    # Arrange
    fixed_time = datetime(2025, 1, 1, 12, 0, 0)

    class FixedClock:
        def now(self) -> datetime:
            return fixed_time

    class InMemoryOrderRepository:
        def __init__(self):
            self.orders = {}

        def save(self, order: Order) -> None:
            self.orders[order.id] = order

        def find_by_id(self, order_id: str) -> Order | None:
            return self.orders.get(order_id)

    class RecordingEventPublisher:
        def __init__(self):
            self.events = []

        def publish(self, event: Event) -> None:
            self.events.append(event)

    service = OrderService(
        clock=FixedClock(),
        orders=InMemoryOrderRepository(),
        events=RecordingEventPublisher()
    )

    # Act
    order = service.create_order([OrderItem(product="Book", quantity=1)])

    # Assert
    assert order.created_at == fixed_time  # Deterministic!
```

### TypeScript Example

**Scenario:** HTTP client with DI

```typescript
// Interface definitions
interface HttpClient {
  get<T>(url: string): Promise<T>;
  post<T>(url: string, body: unknown): Promise<T>;
}

interface Logger {
  info(message: string): void;
  error(message: string, error: Error): void;
}

interface Cache {
  get<T>(key: string): T | undefined;
  set<T>(key: string, value: T, ttlSeconds: number): void;
}

// Business logic with injected dependencies
class UserApiClient {
  constructor(
    private http: HttpClient,
    private logger: Logger,
    private cache: Cache
  ) {}

  async getUser(userId: string): Promise<User> {
    const cacheKey = `user:${userId}`;
    const cached = this.cache.get<User>(cacheKey);

    if (cached) {
      this.logger.info(`Cache hit for user ${userId}`);
      return cached;
    }

    this.logger.info(`Fetching user ${userId} from API`);
    const user = await this.http.get<User>(`/users/${userId}`);
    this.cache.set(cacheKey, user, 3600);
    return user;
  }
}

// Production implementations
class FetchHttpClient implements HttpClient {
  async get<T>(url: string): Promise<T> {
    const response = await fetch(url);
    return response.json();
  }

  async post<T>(url: string, body: unknown): Promise<T> {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return response.json();
  }
}

class ConsoleLogger implements Logger {
  info(message: string): void {
    console.log(`[INFO] ${message}`);
  }

  error(message: string, error: Error): void {
    console.error(`[ERROR] ${message}`, error);
  }
}

class RedisCache implements Cache {
  constructor(private client: RedisClient) {}

  get<T>(key: string): T | undefined {
    const value = this.client.get(key);
    return value ? JSON.parse(value) : undefined;
  }

  set<T>(key: string, value: T, ttlSeconds: number): void {
    this.client.setex(key, ttlSeconds, JSON.stringify(value));
  }
}

// Composition root
function createUserApiClient(): UserApiClient {
  return new UserApiClient(
    new FetchHttpClient(),
    new ConsoleLogger(),
    new RedisCache(createRedisClient())
  );
}

// Unit test with test doubles
describe("UserApiClient", () => {
  it("returns cached user if available", async () => {
    // Arrange
    const mockHttp: HttpClient = {
      get: jest.fn(),
      post: jest.fn(),
    };

    const mockLogger: Logger = {
      info: jest.fn(),
      error: jest.fn(),
    };

    const cachedUser = { id: "123", name: "John" };
    const mockCache: Cache = {
      get: jest.fn().mockReturnValue(cachedUser),
      set: jest.fn(),
    };

    const client = new UserApiClient(mockHttp, mockLogger, mockCache);

    // Act
    const user = await client.getUser("123");

    // Assert
    expect(user).toBe(cachedUser);
    expect(mockHttp.get).not.toHaveBeenCalled(); // No HTTP call!
    expect(mockLogger.info).toHaveBeenCalledWith("Cache hit for user 123");
  });
});
```

## References

- [Inversion of Control Containers and the Dependency Injection Pattern](https://martinfowler.com/articles/injection.html) - Martin Fowler's seminal article
- [Dependency Injection Principles, Practices, and Patterns](https://www.manning.com/books/dependency-injection-principles-practices-patterns) - Mark Seemann's comprehensive guide
- [Dependency Injection Demystified](https://www.jamesshore.com/v2/blog/2006/dependency-injection-demystified) - James Shore's accessible explanation
- [Clean Architecture](https://www.oreilly.com/library/view/clean-architecture-a/9780134494272/) - Robert C. Martin's architectural principles
- [Growing Object-Oriented Software, Guided by Tests](http://www.growing-object-oriented-software.com/) - Freeman & Pryce on TDD with DI

## Changelog

- **v1.0** (2025-11-15): Initial version with 6-step DI implementation process

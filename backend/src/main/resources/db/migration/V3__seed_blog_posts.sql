-- Seeds the three demo/draft notes that previously lived only in the
-- frontend's local fixture data (src/data/blogPosts.ts), so local
-- development has content to exercise the blog UI against.
--
-- These are demo articles, not real published writing — kept as DRAFT on
-- purpose. Since the public API only returns PUBLISHED posts, the public
-- blog page legitimately shows its empty state until a real post is
-- published through the admin API.

INSERT INTO blog_posts (title, slug, excerpt, category, content_markdown, status, featured, reading_time)
VALUES
(
  'Building an AI Agent with Tool Calling',
  'building-an-ai-agent-with-tool-calling',
  'How application tools, retrieval and an AI agent can work together.',
  'AI / Agents',
$md$An AI agent becomes useful the moment it can do more than generate text — when it can call a `search` function, look up a record, or trigger an action and reason about the result.

## What tool calling actually means

Tool calling is a contract: the model is given a set of function signatures — names, descriptions, and expected arguments — and instead of answering directly, it can respond with a request to call one of them. The application executes the real function and feeds the result back in.

## A simple flow

1. The user asks a question in natural language.
2. The model decides whether it needs a tool to answer accurately.
3. If so, it emits a structured call — a tool name and arguments.
4. The application runs the real function and returns the result.
5. The model uses that result to produce a final answer.

```text
User → Agent → [decides] → Tool call → Application executes
                                   ↓
                          Result returned to Agent → Final answer
```

> The hard part isn't calling the tool — it's deciding when a tool call is actually necessary, and what to do when the result is ambiguous or empty.

This note will grow as the agent work on this site matures — the goal here is just to capture the shape of the problem before writing the real implementation notes.
$md$,
  'DRAFT',
  TRUE,
  8
),
(
  'Understanding RAG in a Real Application',
  'understanding-rag-in-a-real-application',
  'Breaking down retrieval-augmented generation and where it fits in an application.',
  'AI / RAG',
$md$Retrieval-augmented generation (RAG) pairs a language model with a search step: before answering, the application retrieves relevant documents and includes them as context.

## Why retrieval first

A model only knows what it was trained on. RAG sidesteps that limit by fetching current, domain-specific information — like a policy document or a knowledge base article — at query time, so the model reasons over real data instead of guessing from memory.

## The moving parts

- A store of documents, chunked into smaller passages.
- An embedding step that turns text into vectors for similarity search.
- A retriever that finds the most relevant chunks for a given question.
- A prompt that combines the question with the retrieved context.

```text
question
  → embed(question)
  → search(vector store)
  → top-k relevant chunks
  → prompt = question + chunks
  → model answer
```

The interesting engineering problems tend to live in retrieval quality and chunking strategy, not in the generation step itself. This is a placeholder note — a fuller write-up will follow once the retrieval pipeline for this site's own agent is further along.
$md$,
  'DRAFT',
  FALSE,
  6
),
(
  'Designing Microservices with Spring Boot',
  'designing-microservices-with-spring-boot',
  'Notes on service boundaries, APIs and the tradeoffs of splitting a monolith.',
  'Backend / Architecture',
$md$Splitting an application into services is easy to do and hard to do well. The question worth asking before drawing any boxes is: what actually changes independently?

## Where to draw boundaries

A reasonable starting point is to group functionality by business capability rather than by technical layer — a `Policy` service and a `Claims` service, for example, rather than a shared `Controller` service and a shared `Repository` service.

- Each service owns its own data — no shared database tables across services.
- Services talk over well-defined REST (or messaging) contracts, not shared code.
- A service should be small enough for one team to reason about fully.

## A minimal service sketch

```java
@RestController
@RequestMapping("/api/policies")
class PolicyController {

    private final PolicyService policyService;

    @GetMapping("/{id}")
    ResponseEntity<PolicyDto> getPolicy(@PathVariable String id) {
        return ResponseEntity.ok(policyService.findById(id));
    }
}
```

> Every service boundary is also an API you now have to version and support. The tradeoff for independence is coordination overhead — worth it, but not free.

This is a demo note capturing general architecture thinking, not a description of a specific production system.
$md$,
  'DRAFT',
  FALSE,
  7
);

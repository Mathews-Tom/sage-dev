# AI Development Skills Guide

**Version:** 2.0.0
**Total AI Skills:** 5
**Category:** AI Development

Specialized Skills for building AI-powered applications - API development, RAG systems, LLM integration, testing, and documentation.

---

## Overview

The AI Development Skills suite extends Sage-Dev with specialized tools for modern AI application development. These Skills provide scaffolding, best practices, and production-ready code for common AI engineering tasks.

### What's Included

1. **sage-api-forge** - REST & GraphQL API scaffolding
2. **sage-rag-architect** - RAG pipeline builder
3. **sage-model-bridge** - LLM provider integration
4. **sage-test-factory** - Comprehensive test generation
5. **sage-doc-weaver** - Documentation automation

---

## Installation

### For Claude (claude.ai, Claude Desktop, Claude Code)

1. Open Claude Settings → Capabilities → Skills
2. Navigate to `skills/ai-development/` directory
3. Upload desired `.zip` files:
   - `sage-api-forge.zip`
   - `sage-rag-architect.zip`
   - `sage-model-bridge.zip`
   - `sage-test-factory.zip`
   - `sage-doc-weaver.zip`
4. Enable each Skill via toggle
5. Skills auto-activate based on conversation context

### For ChatGPT / Gemini / Other LLMs

1. Start a new conversation
2. Upload desired `.zip` files from `skills/ai-development/`
3. Mention the Skill name in your prompt
4. LLM extracts and applies guidance

---

## Skills Reference

### 1. sage-api-forge

**Scaffold robust REST & GraphQL APIs in minutes**

**Use when:**
- Initializing new backend services
- Adding endpoints to existing APIs
- Creating microservice scaffolding
- Standardizing API patterns

**Generates:**
- Controllers and routes (FastAPI, Express, Apollo)
- Data models with validation (Pydantic, Zod)
- OpenAPI/GraphQL schemas
- Unit and integration tests
- Configuration files

**Example prompts:**
```
Create a FastAPI resource for managing blog posts with CRUD operations.

Generate an Express TypeScript API for user management with JWT auth.

Scaffold a GraphQL schema for a task management system.
```

**Triggers:** `API`, `REST`, `GraphQL`, `FastAPI`, `Express`, `endpoints`, `routes`

**File size:** ~15 KB

---

### 2. sage-rag-architect

**Blueprint modern RAG pipelines effortlessly**

**Use when:**
- Building knowledge retrieval layers
- Implementing semantic search
- Creating document Q&A systems
- Adding context to LLM applications

**Generates:**
- Document processing pipelines (PDF, MD, HTML, DOCX)
- Chunking strategies (fixed, semantic, structural, adaptive)
- Embedding pipelines (OpenAI, Sentence Transformers, Cohere)
- Vector database integration (FAISS, Pinecone, Weaviate, Qdrant, Chroma)
- Hybrid search (vector + keyword)
- Retrieval strategies (similarity, MMR, parent document)

**Example prompts:**
```
Create a RAG system for technical docs with semantic chunking and FAISS.

Build a hybrid search pipeline with Pinecone for 10,000 articles.

Implement parent document retrieval with OpenAI embeddings.
```

**Triggers:** `RAG`, `retrieval`, `embeddings`, `vector search`, `semantic search`, `knowledge base`

**File size:** ~25 KB

---

### 3. sage-model-bridge

**Seamless LLM provider integration**

**Use when:**
- Connecting to LLM providers (OpenAI, Anthropic, Cohere)
- Building multi-provider routers
- Implementing fallback strategies
- Adding streaming support
- Tracking LLM costs

**Generates:**
- Provider clients (OpenAI, Anthropic, Cohere, local models)
- Unified interface for cross-provider compatibility
- Retry logic with exponential backoff
- Rate limiting (token bucket algorithm)
- Cost tracking per model
- Streaming support
- Error handling

**Example prompts:**
```
Create an LLM router that tries OpenAI first, falls back to Anthropic.

Implement streaming completions with cost tracking for GPT-4 and Claude.

Set up a local Llama-2 integration with HuggingFace Transformers.
```

**Triggers:** `LLM`, `OpenAI`, `Anthropic`, `Claude`, `GPT`, `model integration`, `streaming`

**File size:** ~20 KB

---

### 4. sage-test-factory

**Auto-generate comprehensive test suites**

**Use when:**
- Adding tests to new codebases
- Testing legacy code
- Generating API test suites
- Creating E2E test scenarios
- Enforcing coverage requirements

**Generates:**
- Unit tests for functions/methods
- Integration tests for APIs
- E2E tests with Playwright
- Test fixtures and mocks
- Coverage configuration (pytest, jest)
- CI/CD test workflows

**Example prompts:**
```
Generate unit and integration tests for my FastAPI user service with 80% coverage.

Create Playwright E2E tests for registration and checkout flows.

Generate tests for legacy Python code with fixtures and mocks.
```

**Triggers:** `tests`, `testing`, `pytest`, `jest`, `coverage`, `fixtures`, `E2E`, `integration tests`

**File size:** ~18 KB

---

### 5. sage-doc-weaver

**Living documentation at your fingertips**

**Use when:**
- Maintaining API documentation
- Creating architecture diagrams
- Generating README files
- Writing SOPs
- Keeping docs synchronized with code

**Generates:**
- API references from code annotations
- Mermaid diagrams (sequence, class, flowchart)
- README files with examples
- Standard Operating Procedures (SOPs)
- Google-style docstrings
- Architecture Decision Records (ADRs)
- Changelogs from git commits

**Example prompts:**
```
Generate API reference docs from my FastAPI app with examples.

Create a mermaid sequence diagram for the user authentication flow.

Generate an SOP for deploying to production.

Write docstrings for all functions in my Python module.
```

**Triggers:** `documentation`, `docs`, `README`, `SOP`, `diagram`, `mermaid`, `API reference`

**File size:** ~22 KB

---

## Recommended Skill Combinations

### Full-Stack AI Application

1. **sage-api-forge** - Create backend API
2. **sage-rag-architect** - Add knowledge retrieval
3. **sage-model-bridge** - Integrate LLM
4. **sage-test-factory** - Generate tests
5. **sage-doc-weaver** - Document everything

### API Development Workflow

1. **sage-api-forge** - Scaffold API endpoints
2. **sage-test-factory** - Generate test suites
3. **sage-doc-weaver** - Create API docs

### RAG System Development

1. **sage-rag-architect** - Build retrieval pipeline
2. **sage-model-bridge** - Connect LLM for generation
3. **sage-test-factory** - Test retrieval quality
4. **sage-doc-weaver** - Document architecture

### LLM Integration Project

1. **sage-model-bridge** - Set up provider clients
2. **sage-api-forge** - Wrap in REST API
3. **sage-test-factory** - Test integration
4. **sage-doc-weaver** - Document usage

---

## Platform-Specific Notes

### Claude

- ✅ Skills persist across conversations
- ✅ Auto-discovery works seamlessly
- ✅ Multiple Skills compose automatically
- ✅ Upload once in Settings → Capabilities
- **Best for:** Long-term projects, complex workflows

### ChatGPT

- ⚠️ Skills must be re-uploaded per conversation
- ⚠️ May need to explicitly reference Skill names
- 💡 **Tip:** Upload 2-3 task-specific Skills per chat
- **Best for:** Focused, single-session tasks

### Gemini

- ⚠️ Skills must be re-uploaded per conversation
- ⚠️ Auto-discovery may vary by model version
- 💡 **Tip:** Test with single Skills first
- **Best for:** Experimentation, proof-of-concepts

---

## Workflow Examples

### Example 1: Building a Document Q&A System

**Skills needed:** sage-rag-architect, sage-model-bridge, sage-api-forge, sage-doc-weaver

1. **RAG Pipeline**: "Create a RAG system for PDF documents with semantic chunking and Pinecone storage"
2. **LLM Integration**: "Add OpenAI GPT-4 integration with streaming and cost tracking"
3. **API Layer**: "Wrap the Q&A system in a FastAPI REST API with endpoints for upload and query"
4. **Documentation**: "Generate API docs and architecture diagrams"

### Example 2: Microservice Development

**Skills needed:** sage-api-forge, sage-test-factory, sage-doc-weaver

1. **API Scaffolding**: "Create a FastAPI microservice for user management with CRUD operations"
2. **Tests**: "Generate unit tests for services and integration tests for all endpoints"
3. **Documentation**: "Create OpenAPI docs and a comprehensive README"

### Example 3: AI Assistant Backend

**Skills needed:** sage-rag-architect, sage-model-bridge, sage-test-factory

1. **Knowledge Base**: "Build a RAG pipeline with hybrid search for company documentation"
2. **LLM Router**: "Create a multi-provider LLM client with fallback from GPT-4 to Claude"
3. **Testing**: "Generate tests for retrieval quality and LLM response consistency"

---

## Best Practices

### Skill Selection

- **Start focused**: Use 1-2 Skills for specific tasks
- **Compose incrementally**: Add Skills as needs grow
- **Match to phase**: Use sage-api-forge early, sage-doc-weaver late

### Prompt Engineering

- **Be specific**: Mention framework, language, and patterns
- **Include context**: Reference existing code structure
- **Request examples**: Ask for working code snippets
- **Iterate**: Refine generated code based on your needs

### Code Review

- **Verify dependencies**: Check package versions
- **Test thoroughly**: Run generated tests
- **Customize**: Treat generated code as a starting point
- **Document changes**: Update docs after modifications

---

## Troubleshooting

### Skill Not Activating

- **Claude**: Verify Skill is enabled in Settings → Capabilities
- **ChatGPT/Gemini**: Re-upload Skill file in current conversation
- **All platforms**: Explicitly mention Skill name in prompt

### Generated Code Issues

- **Missing imports**: Install dependencies from generated requirements
- **Type errors**: Verify Python 3.12+ or Node 18+ is being used
- **Tests failing**: Check database/API connections in test config

### Cross-Platform Compatibility

- **Skill format differences**: Skills follow Claude format but work on all platforms
- **Extraction issues**: Some platforms may need explicit Skill invocation
- **File size limits**: Check platform upload limits (usually 20-50 MB)

---

## Regenerating Skills

If you modify source files or want to rebuild Skills:

```bash
# From sage-dev root directory
./sage-skillify.sh
```

This will regenerate all Skills including AI Development Skills from:
- `commands/*.md` - Slash command definitions
- `agents/python/*.md` - Python-specific agents
- `agents/shared/*.md` - Language-agnostic agents
- `rules/*.md` - Development standards
- `skills/skills-src/ai-development/` - AI Development Skills source

---

## Source Code Structure

AI Development Skills are organized as follows:

```
skills/
├── ai-development/          # Packaged Skills (zips)
│   ├── sage-api-forge.zip
│   ├── sage-rag-architect.zip
│   ├── sage-model-bridge.zip
│   ├── sage-test-factory.zip
│   └── sage-doc-weaver.zip
│
└── skills-src/              # Source before packaging
    └── ai-development/
        ├── sage-api-forge/
        │   ├── Skill.md
        │   ├── README.md
        │   └── resources/
        ├── sage-rag-architect/
        │   ├── Skill.md
        │   ├── README.md
        │   └── resources/
        ├── sage-model-bridge/
        │   ├── Skill.md
        │   ├── README.md
        │   └── resources/
        ├── sage-test-factory/
        │   ├── Skill.md
        │   ├── README.md
        │   └── resources/
        └── sage-doc-weaver/
            ├── Skill.md
            ├── README.md
            └── resources/
```

---

## Support

- **Core Skills Documentation:** [SKILLS_GUIDE.md](SKILLS_GUIDE.md)
- **Commands Reference:** [../commands/SAGE.COMMANDS.md](../commands/SAGE.COMMANDS.md)
- **Issues:** [GitHub Issues](https://github.com/Mathews-Tom/sage-dev/issues)

---

**Build AI-powered applications faster, with confidence.** 🚀

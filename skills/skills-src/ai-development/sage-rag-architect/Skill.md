---
name: Sage RAG Architect
description: Scaffold RAG pipelines - text chunking, embeddings, vector database config, hybrid search, and retrieval strategies.
version: 1.0.0
dependencies: python>=3.12, faiss, pinecone-client
---

# Sage RAG Architect

Blueprint modern RAG (Retrieval-Augmented Generation) pipelines effortlessly.

## Purpose

Scaffold complete retrieval-augmented generation systems including document processing, chunking strategies, embedding generation, vector database integration, and hybrid search implementations.

## When to Use

- Building knowledge retrieval layers for LLM applications
- Implementing semantic search systems
- Creating document Q&A systems
- Building AI assistants with knowledge bases
- Implementing context-aware chat systems

## Core Workflow

### 1. Document Processing Pipeline

**Supported Document Types:**
- PDF (pypdf, pdfplumber)
- Markdown (markdown-it)
- HTML (beautifulsoup4)
- DOCX (python-docx)
- Plain text
- Code files (with syntax preservation)

**Processing Strategy:**
```python
from pathlib import Path
from typing import Protocol

class DocumentProcessor(Protocol):
    def extract_text(self, file_path: Path) -> str:
        """Extract text from document."""
        ...

    def extract_metadata(self, file_path: Path) -> dict[str, str]:
        """Extract metadata (author, date, title, etc.)."""
        ...
```

### 2. Chunking Strategies

#### Fixed-Size Chunking
Best for: General-purpose retrieval
```python
def fixed_chunk(text: str, chunk_size: int = 512, overlap: int = 50) -> list[str]:
    """Split text into fixed-size chunks with overlap."""
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end])
        start = end - overlap
    return chunks
```

#### Semantic Chunking
Best for: Maintaining context, narrative documents
```python
def semantic_chunk(text: str, model: SentenceTransformer) -> list[str]:
    """
    Split text at semantic boundaries using sentence similarity.
    Groups sentences with high similarity into same chunk.
    """
    sentences = sent_tokenize(text)
    embeddings = model.encode(sentences)

    # Calculate similarity between consecutive sentences
    similarities = cosine_similarity(embeddings[:-1], embeddings[1:])

    # Split at low-similarity boundaries
    chunks = []
    current_chunk = [sentences[0]]

    for i, sim in enumerate(similarities.diagonal()):
        if sim < 0.6:  # Threshold for semantic boundary
            chunks.append(' '.join(current_chunk))
            current_chunk = [sentences[i + 1]]
        else:
            current_chunk.append(sentences[i + 1])

    if current_chunk:
        chunks.append(' '.join(current_chunk))

    return chunks
```

#### Structural Chunking
Best for: Technical docs, code, structured content
```python
def structural_chunk(markdown_text: str) -> list[dict[str, str]]:
    """
    Split by markdown structure (headings, code blocks).
    Preserve hierarchy and structure metadata.
    """
    chunks = []
    current_section = {"heading": "", "content": "", "level": 0}

    for line in markdown_text.split('\n'):
        if line.startswith('#'):
            if current_section["content"]:
                chunks.append(current_section.copy())

            level = len(line) - len(line.lstrip('#'))
            heading = line.lstrip('#').strip()
            current_section = {
                "heading": heading,
                "content": "",
                "level": level
            }
        else:
            current_section["content"] += line + '\n'

    if current_section["content"]:
        chunks.append(current_section)

    return chunks
```

#### Adaptive Chunking
Best for: Mixed content, maximum relevance
```python
def adaptive_chunk(
    text: str,
    min_chunk_size: int = 256,
    max_chunk_size: int = 1024,
    target_chunk_size: int = 512
) -> list[str]:
    """
    Adapt chunk size based on content density and structure.
    Dense content gets smaller chunks, sparse content larger chunks.
    """
    # Implementation uses NLP to detect content density
    # and adjusts chunk boundaries accordingly
    ...
```

### 3. Embedding Generation

**Supported Models:**
- OpenAI (text-embedding-3-small, text-embedding-3-large)
- Sentence Transformers (all-MiniLM-L6-v2, all-mpnet-base-v2)
- Cohere (embed-english-v3.0, embed-multilingual-v3.0)
- Custom models via HuggingFace

**Embedding Pipeline:**
```python
from sentence_transformers import SentenceTransformer
from typing import Protocol

class EmbeddingModel(Protocol):
    def encode(self, texts: list[str]) -> list[list[float]]:
        """Generate embeddings for text chunks."""
        ...

class OpenAIEmbeddings:
    def __init__(self, model: str = "text-embedding-3-small"):
        self.model = model
        self.client = OpenAI()

    def encode(self, texts: list[str]) -> list[list[float]]:
        """Generate embeddings using OpenAI API."""
        response = self.client.embeddings.create(
            model=self.model,
            input=texts
        )
        return [item.embedding for item in response.data]

class LocalEmbeddings:
    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        self.model = SentenceTransformer(model_name)

    def encode(self, texts: list[str]) -> list[list[float]]:
        """Generate embeddings using local model."""
        return self.model.encode(texts).tolist()
```

**Batch Processing:**
```python
async def batch_embed(
    chunks: list[str],
    embedder: EmbeddingModel,
    batch_size: int = 100
) -> list[list[float]]:
    """Process embeddings in batches for efficiency."""
    embeddings = []
    for i in range(0, len(chunks), batch_size):
        batch = chunks[i:i + batch_size]
        batch_embeddings = embedder.encode(batch)
        embeddings.extend(batch_embeddings)
    return embeddings
```

### 4. Vector Database Integration

**Supported Databases:**
- FAISS (local, high-performance)
- Pinecone (cloud, managed)
- Weaviate (self-hosted, feature-rich)
- Qdrant (cloud/self-hosted, fast)
- Chroma (local, simple)

**FAISS Configuration:**
```python
import faiss
import numpy as np
from typing import TypedDict

class FAISSConfig(TypedDict):
    dimension: int
    index_type: str  # "Flat", "IVF", "HNSW"
    metric: str  # "L2", "IP" (inner product)

def create_faiss_index(config: FAISSConfig) -> faiss.Index:
    """Create FAISS index with specified configuration."""
    if config["index_type"] == "Flat":
        # Exact search, best for small datasets (<100k vectors)
        if config["metric"] == "IP":
            index = faiss.IndexFlatIP(config["dimension"])
        else:
            index = faiss.IndexFlatL2(config["dimension"])

    elif config["index_type"] == "IVF":
        # Approximate search with clustering
        quantizer = faiss.IndexFlatL2(config["dimension"])
        index = faiss.IndexIVFFlat(
            quantizer,
            config["dimension"],
            100  # nlist: number of clusters
        )

    elif config["index_type"] == "HNSW":
        # Hierarchical Navigable Small World (fastest)
        index = faiss.IndexHNSWFlat(config["dimension"], 32)

    return index
```

**Pinecone Configuration:**
```python
from pinecone import Pinecone, ServerlessSpec

class PineconeVectorStore:
    def __init__(self, index_name: str, dimension: int):
        self.pc = Pinecone(api_key=os.environ["PINECONE_API_KEY"])

        # Create index if it doesn't exist
        if index_name not in self.pc.list_indexes().names():
            self.pc.create_index(
                name=index_name,
                dimension=dimension,
                metric="cosine",
                spec=ServerlessSpec(
                    cloud="aws",
                    region="us-east-1"
                )
            )

        self.index = self.pc.Index(index_name)

    def upsert(self, vectors: list[tuple[str, list[float], dict]]):
        """Upsert vectors with metadata."""
        self.index.upsert(vectors=vectors)

    def query(
        self,
        vector: list[float],
        top_k: int = 5,
        filter: dict | None = None
    ) -> list[dict]:
        """Query for similar vectors."""
        results = self.index.query(
            vector=vector,
            top_k=top_k,
            filter=filter,
            include_metadata=True
        )
        return results["matches"]
```

### 5. Hybrid Search Implementation

Combine vector search with keyword search for best results:

```python
from rank_bm25 import BM25Okapi
from typing import TypedDict

class SearchResult(TypedDict):
    text: str
    score: float
    metadata: dict[str, str]

class HybridSearch:
    def __init__(
        self,
        vector_store,
        embedding_model,
        alpha: float = 0.5  # Weight for vector vs keyword search
    ):
        self.vector_store = vector_store
        self.embedding_model = embedding_model
        self.alpha = alpha
        self.bm25 = None
        self.documents = []

    def index_documents(self, documents: list[str]):
        """Index documents for hybrid search."""
        self.documents = documents

        # Index for keyword search (BM25)
        tokenized_docs = [doc.lower().split() for doc in documents]
        self.bm25 = BM25Okapi(tokenized_docs)

        # Index for vector search
        embeddings = self.embedding_model.encode(documents)
        self.vector_store.add(embeddings, documents)

    def search(
        self,
        query: str,
        top_k: int = 5
    ) -> list[SearchResult]:
        """Perform hybrid search combining vector and keyword approaches."""
        # Vector search
        query_embedding = self.embedding_model.encode([query])[0]
        vector_results = self.vector_store.search(query_embedding, top_k=top_k * 2)

        # Keyword search (BM25)
        tokenized_query = query.lower().split()
        bm25_scores = self.bm25.get_scores(tokenized_query)

        # Combine scores
        combined_results = {}
        for idx, doc in enumerate(self.documents):
            vector_score = next(
                (r["score"] for r in vector_results if r["text"] == doc),
                0.0
            )
            keyword_score = bm25_scores[idx]

            # Normalize and combine
            combined_score = (
                self.alpha * vector_score +
                (1 - self.alpha) * (keyword_score / max(bm25_scores))
            )

            combined_results[idx] = {
                "text": doc,
                "score": combined_score,
                "metadata": {}
            }

        # Sort and return top_k
        sorted_results = sorted(
            combined_results.values(),
            key=lambda x: x["score"],
            reverse=True
        )
        return sorted_results[:top_k]
```

### 6. Retrieval Strategies

**Basic Similarity Search:**
```python
def similarity_search(
    query: str,
    vector_store,
    embedder,
    top_k: int = 5
) -> list[str]:
    """Simple similarity-based retrieval."""
    query_embedding = embedder.encode([query])[0]
    results = vector_store.search(query_embedding, top_k=top_k)
    return [r["text"] for r in results]
```

**MMR (Maximal Marginal Relevance):**
```python
def mmr_search(
    query: str,
    vector_store,
    embedder,
    top_k: int = 5,
    lambda_param: float = 0.5
) -> list[str]:
    """
    Retrieve diverse results using MMR.
    Balances relevance with diversity to avoid redundant results.
    """
    query_embedding = embedder.encode([query])[0]

    # Get more candidates than needed
    candidates = vector_store.search(query_embedding, top_k=top_k * 3)

    selected = []
    candidate_embeddings = [c["embedding"] for c in candidates]

    while len(selected) < top_k and candidates:
        # Calculate MMR scores
        mmr_scores = []
        for i, candidate in enumerate(candidates):
            # Relevance to query
            relevance = cosine_similarity(
                [query_embedding],
                [candidate_embeddings[i]]
            )[0][0]

            # Max similarity to already selected
            if selected:
                max_sim = max(
                    cosine_similarity(
                        [candidate_embeddings[i]],
                        [s["embedding"] for s in selected]
                    )[0]
                )
            else:
                max_sim = 0

            # MMR formula
            mmr_score = lambda_param * relevance - (1 - lambda_param) * max_sim
            mmr_scores.append(mmr_score)

        # Select best candidate
        best_idx = np.argmax(mmr_scores)
        selected.append(candidates.pop(best_idx))
        candidate_embeddings.pop(best_idx)

    return [s["text"] for s in selected]
```

**Parent Document Retrieval:**
```python
class ParentDocumentRetriever:
    """
    Retrieve larger parent documents based on smaller child chunks.
    Best for maintaining context.
    """
    def __init__(self, vector_store, embedder):
        self.vector_store = vector_store
        self.embedder = embedder
        self.parent_map = {}  # chunk_id -> parent_doc_id

    def add_documents(self, documents: list[str], chunk_size: int = 512):
        """Index documents with parent-child relationships."""
        for doc_id, doc in enumerate(documents):
            # Split into chunks
            chunks = fixed_chunk(doc, chunk_size)

            # Store parent relationship
            for chunk_id, chunk in enumerate(chunks):
                full_chunk_id = f"{doc_id}_{chunk_id}"
                self.parent_map[full_chunk_id] = doc_id

                # Index chunk with metadata
                embedding = self.embedder.encode([chunk])[0]
                self.vector_store.add(
                    [embedding],
                    [chunk],
                    metadata=[{"chunk_id": full_chunk_id, "parent_id": doc_id}]
                )

    def retrieve(self, query: str, top_k: int = 3) -> list[str]:
        """Retrieve parent documents based on chunk similarity."""
        query_embedding = self.embedder.encode([query])[0]
        chunk_results = self.vector_store.search(query_embedding, top_k=top_k * 2)

        # Get unique parent documents
        parent_ids = set()
        parent_docs = []

        for result in chunk_results:
            parent_id = result["metadata"]["parent_id"]
            if parent_id not in parent_ids:
                parent_ids.add(parent_id)
                parent_docs.append(self.get_parent_document(parent_id))

                if len(parent_docs) >= top_k:
                    break

        return parent_docs
```

### 7. Performance Optimization

**Caching:**
```python
from functools import lru_cache
import hashlib

@lru_cache(maxsize=1000)
def cached_embed(text: str, model_name: str) -> tuple[float, ...]:
    """Cache embeddings for frequently queried text."""
    embedder = get_embedding_model(model_name)
    embedding = embedder.encode([text])[0]
    return tuple(embedding)  # Must be hashable for cache
```

**Batch Processing:**
```python
async def process_documents_parallel(
    documents: list[str],
    chunk_fn,
    embed_fn,
    index_fn,
    batch_size: int = 100
):
    """Process documents in parallel batches."""
    import asyncio

    async def process_batch(batch):
        chunks = [chunk_fn(doc) for doc in batch]
        flat_chunks = [c for doc_chunks in chunks for c in doc_chunks]
        embeddings = await embed_fn(flat_chunks)
        await index_fn(flat_chunks, embeddings)

    batches = [
        documents[i:i + batch_size]
        for i in range(0, len(documents), batch_size)
    ]

    await asyncio.gather(*[process_batch(b) for b in batches])
```

### 8. Evaluation Metrics

```python
def evaluate_retrieval(
    queries: list[str],
    ground_truth: list[list[str]],
    retrieval_fn,
    k: int = 5
) -> dict[str, float]:
    """Evaluate retrieval quality."""
    precisions = []
    recalls = []

    for query, relevant_docs in zip(queries, ground_truth):
        retrieved = set(retrieval_fn(query, top_k=k))
        relevant = set(relevant_docs)

        if retrieved:
            precision = len(retrieved & relevant) / len(retrieved)
            precisions.append(precision)

        if relevant:
            recall = len(retrieved & relevant) / len(relevant)
            recalls.append(recall)

    return {
        "precision@k": np.mean(precisions),
        "recall@k": np.mean(recalls),
        "f1@k": 2 * np.mean(precisions) * np.mean(recalls) /
                (np.mean(precisions) + np.mean(recalls))
    }
```

## Best Practices

1. **Chunking**: Match chunk size to your use case (smaller for precise retrieval, larger for context)
2. **Embeddings**: Use domain-specific models when possible
3. **Metadata**: Include source, timestamp, author for filtering
4. **Reranking**: Add a reranking step for production systems
5. **Monitoring**: Track retrieval metrics and user feedback
6. **Caching**: Cache embeddings and frequent queries
7. **Versioning**: Version your embeddings and indexes

## Quality Checklist

- [ ] Appropriate chunking strategy selected
- [ ] Embedding model matches domain
- [ ] Vector database configured with proper index type
- [ ] Metadata included for filtering
- [ ] Hybrid search implemented if needed
- [ ] Retrieval evaluated on test queries
- [ ] Performance benchmarks established
- [ ] Monitoring and logging in place

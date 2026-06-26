import os
import re
import pypdf
import docx
import numpy as np
import faiss
from typing import List, Dict, Any
from sentence_transformers import SentenceTransformer
from openai import OpenAI

class DocumentProcessor:
    @staticmethod
    def extract_text(file_path: str) -> str:
        """Extract text from PDF, DOCX, or TXT file."""
        ext = os.path.splitext(file_path)[1].lower()
        if ext == ".txt":
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                return f.read()
        elif ext == ".pdf":
            reader = pypdf.PdfReader(file_path)
            return "\n".join((page.extract_text() or "") for page in reader.pages)
        elif ext == ".docx":
            doc = docx.Document(file_path)
            return "\n".join(p.text for p in doc.paragraphs)
        return ""

    @staticmethod
    def chunk_text(text: str, source_name: str, chunk_size: int = 600, overlap: int = 80) -> List[Dict[str, Any]]:
        """Split text into semantic chunks with overlap to preserve context."""
        # Clean whitespace
        text = re.sub(r"\s+", " ", text).strip()
        chunks = []
        start = 0
        
        while start < len(text):
            end = start + chunk_size
            chunk = text[start:end]
            chunks.append({
                "text": chunk,
                "source": source_name
            })
            start += (chunk_size - overlap)
            
        return chunks

class KnowledgeBaseManager:
    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        # Load local embedding model
        print("Initializing embedding model (local)...")
        self.model = SentenceTransformer(model_name, local_files_only=True)
        self.dimension = 384  # MiniLM embedding dimension
        
        # Initialize FAISS Index Flat Inner Product (for Cosine Similarity)
        self.index = faiss.IndexFlatIP(self.dimension)
        self.metadata: List[Dict[str, Any]] = []

    def add_document(self, file_path: str):
        """Parse, chunk, embed, and insert a document into the FAISS index."""
        source_name = os.path.basename(file_path)
        raw_text = DocumentProcessor.extract_text(file_path)
        if not raw_text.strip():
            print(f"Skipping empty or unsupported file: {source_name}")
            return
            
        chunks = DocumentProcessor.chunk_text(raw_text, source_name)
        if not chunks:
            return
            
        texts = [c["text"] for c in chunks]
        embeddings = self.model.encode(texts, convert_to_numpy=True)
        faiss.normalize_L2(embeddings)
        
        # Add to index and metadata
        self.index.add(embeddings)
        self.metadata.extend(chunks)
        print(f"Successfully indexed {len(chunks)} chunks from {source_name}")

    def search(self, query: str, top_k: int = 3) -> List[Dict[str, Any]]:
        """Search the FAISS index for semantic matches."""
        if self.index.ntotal == 0:
            return []
            
        query_embedding = self.model.encode([query], convert_to_numpy=True)
        faiss.normalize_L2(query_embedding)
        
        scores, indices = self.index.search(query_embedding, k=min(top_k, self.index.ntotal))
        
        results = []
        for score, idx in zip(scores[0], indices[0]):
            if idx < 0 or idx >= len(self.metadata):
                continue
            meta = self.metadata[idx]
            results.append({
                "score": float(score),
                "text": meta["text"],
                "source": meta["source"]
            })
        return results

    def query_with_llm(self, query: str, openai_api_key: str = None, groq_api_key: str = None, top_k: int = 3) -> Dict[str, Any]:
        """Fetch matching segments and use OpenAI or Groq to construct a natural response."""
        matches = self.search(query, top_k=top_k)
        
        if not matches:
            return {
                "answer": "No relevant documents have been loaded into the knowledge base yet to answer this question.",
                "sources": []
            }
            
        # Compile context
        context_str = "\n\n".join([f"[Source: {m['source']}] {m['text']}" for m in matches])
        
        system_prompt = (
            "You are a helpful college assistant. Answer the user's question using only the provided official document context. "
            "If the answer cannot be found in the context, politely state that you do not know. "
            "Keep your answer clear, concise, and professional."
        )
        
        user_prompt = f"Context:\n{context_str}\n\nQuestion: {query}"
        response = None
        last_error = None

        # Try OpenAI first
        if openai_api_key:
            try:
                client = OpenAI(api_key=openai_api_key)
                response = client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    temperature=0.3
                )
            except Exception as e:
                print(f"OpenAI query failed: {e}. Falling back to Groq if configured.")
                last_error = e

        # Fallback to Groq if OpenAI failed or wasn't provided
        if response is None and groq_api_key:
            try:
                client = OpenAI(api_key=groq_api_key, base_url="https://api.groq.com/openai/v1")
                response = client.chat.completions.create(
                    model="llama-3.3-70b-versatile",
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    temperature=0.3
                )
            except Exception as e:
                print(f"Groq query failed: {e}")
                last_error = e

        if response is None:
            raise Exception(f"Failed to query LLM. OpenAI and Groq both failed or were not configured. Last error: {last_error}")
        
        answer = response.choices[0].message.content
        sources = list(set([m["source"] for m in matches if m["score"] > 0.3]))
        
        return {
            "answer": answer,
            "sources": sources,
            "matches": matches
        }

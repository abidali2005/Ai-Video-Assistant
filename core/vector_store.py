from langchain_chroma import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
from pathlib import Path
BASE_VECTOR_DIR = Path("vector_db")
EMBEDDING_MODEL = "all-MiniLM-L6-v2"

def get_embeddings():
    return HuggingFaceEmbeddings(
        model_name = EMBEDDING_MODEL,
        model_kwargs = {"device" : 'cpu'}
    )
def build_vector_store(transcript : str , video_id: str)->Chroma:
    print('Buiding Vector Store')
    splitter = RecursiveCharacterTextSplitter(
        chunk_size =  500,
        chunk_overlap = 50
    )
    chunks = splitter.split_text(transcript)
    docs = [
        Document(page_content=chunk , metadata = {'chunk_index' : i})
        for i,chunk in enumerate(chunks)
    ]
    embeddings = get_embeddings()
    vectore_store = Chroma.from_documents(
        documents=docs,
        embedding=embeddings,
        collection_name=video_id,
        persist_directory=str(
    BASE_VECTOR_DIR / video_id
)
    )
    return vectore_store
def load_vector_store(video_id: str)->Chroma:
    embeddings = get_embeddings()
    vectore_store = Chroma(
        collection_name=video_id,
        embedding_function=embeddings,
        persist_directory=str(
    BASE_VECTOR_DIR / video_id
)
    )
    return vectore_store
def get_retreiver(vectore_store : Chroma , k : int =4):
    return vectore_store.as_retriever(
        search_type = 'similarity',
        search_kwargs = {'k' : k}
    )

import chromadb
import gc

def delete_vector_store(video_id: str):
    """
    Releases any cached Chroma/SQLite client handles for this video
    before the folder is removed from disk.
    """
    path = str(BASE_VECTOR_DIR / video_id)

    try:
        # Clears chromadb's internal SharedSystemClient cache,
        # which releases the underlying sqlite3 connection(s).
        client = chromadb.PersistentClient(path=path)
        client.clear_system_cache()
    except Exception as e:
        print(f"Warning: could not clear chroma client cache for {video_id}: {e}")

    gc.collect()
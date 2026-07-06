from langchain_mistralai import ChatMistralAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough , RunnableLambda
from core.vector_store import build_vector_store , load_vector_store , get_retreiver
from langchain_core.output_parsers import StrOutputParser
import os
def get_llm():
    return ChatMistralAI(
        model="mistral-small-latest",
        mistral_api_key=os.getenv("MISTRAL_API_KEY"),
        temperature=0.3,
    )

def format_docs(docs):
    return '\n\n'.join([doc.page_content for doc in docs])

def build_rage_pipeline(transcript : str , video_id: str):
    vectore_store = build_vector_store(transcript , video_id)
    retriver = get_retreiver(vectore_store , k=4)
    prompt = ChatPromptTemplate.from_messages(

        [(
            "system",
            """You are an expert meeting assistant. Answer the user's question 
based ONLY on the meeting transcript context provided below.

If the answer is not found in the context, say: 
"I could not find this information in the meeting transcript."

Always be concise and precise. If quoting someone, mention it clearly.

Context from meeting transcript:
{context}""",
        ),
        ("human", "{question}"),
    ]
    )
    llm = get_llm()
    rag_chain = ({"context" : retriver | RunnableLambda(format_docs),
                 'question' :RunnablePassthrough() }
    |prompt|llm|StrOutputParser())
    return rag_chain
def load_rag(video_id: str):
    vector_store = load_vector_store(video_id)

    retriever = get_retreiver(vector_store)
    docs = vector_store.similarity_search("Google", k=2)

    print("=" * 60)
    print("Retrieved docs from Chroma:")
    print(docs)
    print("=" * 60)
    llm = get_llm()
    prompt = ChatPromptTemplate.from_messages(
        [
                (
            "system",
            """You are an expert meeting assistant. Answer the user's question 
based ONLY on the meeting transcript context provided below.

If the answer is not found in the context, say: 
"I could not find this information in the meeting transcript."

Always be concise and precise. If quoting someone, mention it clearly.

Context from meeting transcript:
{context}""",
        ),
        ("human", "{question}"),
        ]
    )
    rag_chain = ({'context' : retriever | RunnableLambda(format_docs),
                  'question' : RunnablePassthrough()}
                |prompt|llm|StrOutputParser()  )
    return rag_chain

def ask_question(rag_chain, question:str) -> str:
    print(f"Question : {question}")
    answer = rag_chain.invoke(question)
    print(f"answer :{answer}")
    return answer
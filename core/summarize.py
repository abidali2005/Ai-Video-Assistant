from langchain_mistralai import ChatMistralAI
from dotenv import load_dotenv
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.runnables import RunnablePassthrough,RunnableLambda
import os
load_dotenv()
def get_llm():
    return ChatMistralAI(model = "mistral-small-latest" , mistral_api_key = os.getenv('MISTRAL_API_KEY') , temperature=0.3)

def get_chunks(transcript : str)->list:
    splitter = RecursiveCharacterTextSplitter(
        chunk_size = 3000,
        chunk_overlap = 200
    )
    return splitter.split_text(transcript)

def summarize(transcript : str)->str:
    llm = get_llm()
    prpmt = ChatPromptTemplate.from_messages(
        [
        ("system", "Summarize this portion of a meeting transcript concisely."),
        ("human", "{text}"),
        ]

    )
    chain = prpmt | llm | StrOutputParser()
    chunk_split = get_chunks(transcript)
    chunk_smrize = [chain.invoke({'text' : chunk}) for chunk in chunk_split]
    combine = "\n\n".join(chunk_smrize)
    
    combined_prompt = ChatPromptTemplate.from_messages(
        [
        (
            "system",
            "You are an expert meeting summarizer. Combine these partial summaries "
            "into one final professional meeting summary in bullet points.",
        ),
        ("human", "{text}"),
    ]
    )
    scnd_chain = RunnablePassthrough() | RunnableLambda(lambda x : {'text' : x})| combined_prompt | llm | StrOutputParser()
    return scnd_chain.invoke(combine)

def get_title(transcript : str)->str:
    llm = get_llm()
    title = ChatPromptTemplate.from_messages(
        [
               ( "system",
                "Based on the meeting transcript, generate a short professional meeting title "
                "(max 8 words). Only return the title, nothing else.",
            ),
            ("human", "{text}")
        ]
    )
    chain_title = RunnablePassthrough() | RunnableLambda(lambda x : {'text' : x}) | title | llm | StrOutputParser()
    return chain_title.invoke(transcript[:2000])
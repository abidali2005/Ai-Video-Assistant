from langchain_mistralai import ChatMistralAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.runnables import RunnablePassthrough,RunnableLambda
import os
def get_llm():
    return ChatMistralAI(model = "mistral-small-latest" , mistral_api_key = os.getenv('MISTRAL_API_KEY') , temperature=0.2)
def build_chain(system_promt : str):
    llm = get_llm()
    prompt = ChatPromptTemplate.from_messages([
        ('system' , system_promt),
        ('human' , "{text}")
    ])
    return RunnablePassthrough() | RunnableLambda(lambda x : {'text' : x}) | prompt | llm | StrOutputParser()

def extract_actions(transcript : str)->str:
    chain = build_chain(
         "You are an expert meeting analyst. From the meeting transcript, "
        "extract all action items. For each provide:\n"
        "- Task description\n"
        "- Owner (who is responsible)\n"
        "- Deadline (if mentioned, else write 'Not specified')\n\n"
        "Format as a numbered list. If none found say 'No action items found.'"
    )
    return chain.invoke(transcript)
def extract_decisions(transcript : str)->str:
    chain = build_chain(
         "You are an expert meeting analyst. From the meeting transcript, "
        "extract all key decisions made. Format as a numbered list. "
        "If none found say 'No key decisions found.'"
    )
    return chain.invoke(transcript)
def extract_questions(transcript : str)->str:
    chain = build_chain(
         "From the meeting transcript, extract all unresolved questions "
        "or topics needing follow-up. Format as a numbered list. "
        "If none found say 'No open questions found.'"
    )
    return chain.invoke(transcript)

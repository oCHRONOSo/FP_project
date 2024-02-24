from flask import Flask, render_template, request
from langchain.callbacks.manager import CallbackManager
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler
from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate
from langchain_community.llms import LlamaCpp

app = Flask(__name__)

template = """Question: {question}

Answer: Let's work this out in a step by step way to be sure we have the right answer ."""

prompt = PromptTemplate.from_template(template)

# Callbacks support token-wise streaming
callback_manager = CallbackManager([StreamingStdOutCallbackHandler()])

llm = LlamaCpp(
    model_path="./models/deepseek-coder-6.7b-instruct.Q4_K_M.gguf",
    temperature=0.75,
    max_tokens=400,
    top_p=1,
    callback_manager=callback_manager,
    verbose=True,  # Verbose is required to pass to the callback manager
)


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/ask", methods=["POST"])
def ask_question():
    question = request.form["question"]
    modified_prompt = f"Question: {question}\n"
    response = llm.invoke(modified_prompt)
    return response


if __name__ == "__main__":
    app.run(debug=True)

from llama_cpp import Llama
llm = Llama(
      model_path="deepseek-coder-6.7b-instruct.Q4_K_M.gguf",
      verbose=True,
      # n_gpu_layers=-1, # Uncomment to use GPU acceleration
      # seed=1337, # Uncomment to set a specific seed
      # n_ctx=2048, # Uncomment to increase the context window
)
tokens = llm.tokenize(b"is the earth flat ?")
for token in llm.generate(tokens, top_k=40, top_p=1.0, temp=1.0, repeat_penalty=1.1):
    print(llm.detokenize([token]))
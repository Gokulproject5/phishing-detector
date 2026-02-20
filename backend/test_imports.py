try:
    import fastapi
    print("FastAPI: OK")
except ImportError as e:
    print(f"FastAPI: FAIL ({e})")

try:
    import torch
    print("Torch: OK")
except ImportError as e:
    print(f"Torch: FAIL ({e})")

try:
    import transformers
    print("Transformers: OK")
except ImportError as e:
    print(f"Transformers: FAIL ({e})")

try:
    import shap
    print("SHAP: OK")
except ImportError as e:
    print(f"SHAP: FAIL ({e})")

try:
    import google.generativeai as genai
    print("Gemini: OK")
except ImportError as e:
    print(f"Gemini: FAIL ({e})")

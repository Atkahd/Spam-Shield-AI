from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import spacy
import os

# 1. Initialize the FastAPI server
app = FastAPI(title="Spam Detection API")

# Allow our React frontend to communicate with this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, this would be your specific frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Load the AI Models into memory when the server starts
# FIXED: Using a single dirname so it searches the current active directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, 'models', 'spam_svm_model.joblib')
VECTORIZER_PATH = os.path.join(BASE_DIR, 'models', 'tfidf_vectorizer.joblib')

try:
    svm_model = joblib.load(MODEL_PATH)
    vectorizer = joblib.load(VECTORIZER_PATH)
    nlp = spacy.load("en_core_web_sm")
except Exception as e:
    print(f"Error loading models: {e}")
    print("Did you run the Jupyter Notebook completely?")

# 3. Define the Request Schema (Request Validation)
# This forces the incoming JSON to strictly match this structure
class EmailRequest(BaseModel):
    message: str

# 4. The Text Cleaning Helper Function
def clean_text(text: str) -> str:
    doc = nlp(text.lower())
    cleaned_tokens = [token.lemma_ for token in doc if token.is_alpha and not token.is_stop]
    return " ".join(cleaned_tokens)

# 5. Route: Health Check
@app.get("/health")
def health_check():
    return {"status": "API is running successfully!"}

# 6. Route: Predict Spam
@app.post("/predict")
def predict_spam(request: EmailRequest):
    try:
        # Step A: Clean the raw string
        cleaned_text = clean_text(request.message)
        
        # Step B: Convert words to our 5000-column TF-IDF math grid
        vectorized_text = vectorizer.transform([cleaned_text])
        
        # Step C: Ask the SVM model to predict (returns an array, we grab the first item)
        prediction = svm_model.predict(vectorized_text)[0]
        
        # Step D: Format the response
        is_spam = bool(prediction == 1)
        
        return {
            "spam_probability": is_spam,
            "message": "Spam detected" if is_spam else "Looks safe"
        }
    except Exception as e:
        # Standard error handling
        raise HTTPException(status_code=500, detail=str(e))
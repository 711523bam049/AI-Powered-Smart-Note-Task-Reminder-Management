import os
import pickle
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from config.config import settings

# Predefined seed training dataset for cold-start initialization
SEED_DATA = [
    # Tasks (Actions involving deadlines or work actions)
    ("Buy groceries tomorrow", "task"),
    ("Call HR at 5 PM", "task"),
    ("Meeting with Rahul next Monday", "task"),
    ("Need to pay electricity bill", "task"),
    ("Submit project proposal by Friday", "task"),
    ("Schedule dentist appointment", "task"),
    ("Finish writing backend APIs", "task"),
    ("Fix the bugs in authentication", "task"),
    ("Send invoice to client", "task"),
    ("Review resume of candidates", "task"),
    
    # Reminders (Trigger-based alerts)
    ("Remind me to take my pills at 9 PM", "reminder"),
    ("Remind me to call mom tonight", "reminder"),
    ("Wake me up at 6 AM tomorrow", "reminder"),
    ("Don't forget to lock the back door", "reminder"),
    ("Remember to buy keys from the store", "reminder"),
    ("Remind HR about the call", "reminder"),
    ("Remind me to check the oven", "reminder"),
    ("Don't forget the umbrella", "reminder"),
    ("Remember to pay rent", "reminder"),
    
    # Todos (Simple checklist items)
    ("Buy milk", "todo"),
    ("Go to the gym", "todo"),
    ("Read 10 pages of book", "todo"),
    ("Wash the car", "todo"),
    ("Clean my bedroom", "todo"),
    ("Do homework", "todo"),
    ("Water the plants", "todo"),
    ("Grocery list: milk, eggs, bread", "todo"),
    ("Practice coding exercises", "todo"),
    ("Buy bread and butter", "todo"),
    
    # Notes (Declarative entries / general information)
    ("Deep learning is a subset of machine learning based on artificial neural networks.", "note"),
    ("The capital of France is Paris.", "note"),
    ("Spacy is an open-source software library for advanced natural language processing.", "note"),
    ("Today was a productive day. I learned about SQL indexing.", "note"),
    ("Idea for a new project: a smart alarm clock that tracks sleep.", "note"),
    ("Notes from the team meeting: we need to launch by next month.", "note"),
    ("Python is an interpreted, high-level, general-purpose programming language.", "note"),
    ("The weather in London is usually rainy.", "note"),
    ("FastAPI is a modern, fast (high-performance), web framework for building APIs.", "note"),
]

class IntentClassifier:
    """
    Service class responsible for predicting the user's intent.
    Combines rule-based triggers and ML (TF-IDF + Logistic Regression) classification.
    """
    
    def __init__(self, weights_dir: str = settings.MODEL_WEIGHTS_DIR):
        self.weights_dir = weights_dir
        self.vectorizer_path = os.path.join(self.weights_dir, "vectorizer.pkl")
        self.classifier_path = os.path.join(self.weights_dir, "classifier.pkl")
        
        self.vectorizer = None
        self.classifier = None
        
        # Load pre-trained model or fit on the fly using seed data
        self.load_or_train()
        
    def load_or_train(self):
        """
        Attempts to load weights from disk. If missing, fits and saves a new model.
        """
        if os.path.exists(self.vectorizer_path) and os.path.exists(self.classifier_path):
            try:
                with open(self.vectorizer_path, "rb") as f:
                    self.vectorizer = pickle.load(f)
                with open(self.classifier_path, "rb") as f:
                    self.classifier = pickle.load(f)
                return
            except Exception as e:
                print(f"Error loading model weights: {e}. Re-training model...")
                
        # Fit model
        self.train()
        
    def train(self):
        """
        Train the TF-IDF Vectorizer and Logistic Regression classifier on seed data.
        Saves resulting models as pickle files.
        """
        os.makedirs(self.weights_dir, exist_ok=True)
        
        texts = [item[0] for item in SEED_DATA]
        labels = [item[1] for item in SEED_DATA]
        
        # Configure Vectorizer (lowercase, ngram ranges)
        self.vectorizer = TfidfVectorizer(lowercase=True, stop_words="english", ngram_range=(1, 2))
        X = self.vectorizer.fit_transform(texts)
        
        # Initialize and fit Logistic Regression
        self.classifier = LogisticRegression(C=1.0, max_iter=200)
        self.classifier.fit(X, labels)
        
        # Save serialized components
        with open(self.vectorizer_path, "wb") as f:
            pickle.dump(self.vectorizer, f)
        with open(self.classifier_path, "wb") as f:
            pickle.dump(self.classifier, f)
            
        print("Intent classifier model trained and saved successfully!")
        
    def predict(self, text: str) -> dict:
        """
        Classify input query. Rules take precedence, followed by ML prediction.
        Returns predicted intent, confidence score, method, and raw probabilities.
        """
        cleaned_text = text.strip().lower()
        if not cleaned_text:
            return {"intent": "note", "confidence": 1.0, "method": "rule"}
            
        # 1. Rule-based heuristic checking (High-confidence templates)
        if cleaned_text.startswith("remind me to") or cleaned_text.startswith("remind "):
            return {"intent": "reminder", "confidence": 0.95, "method": "rule"}
            
        words = cleaned_text.split()
        if len(words) <= 3 and any(w in words for w in ["buy", "get", "do", "go", "clean", "wash", "read"]):
            return {"intent": "todo", "confidence": 0.9, "method": "rule"}
            
        # 2. ML-based classification (TF-IDF + Logistic Regression)
        X = self.vectorizer.transform([text])
        probabilities = self.classifier.predict_proba(X)[0]
        class_idx = np.argmax(probabilities)
        predicted_class = self.classifier.classes_[class_idx]
        confidence = float(probabilities[class_idx])
        
        return {
            "intent": predicted_class,
            "confidence": round(confidence, 4),
            "method": "ml",
            "probabilities": {cls: round(prob, 4) for cls, prob in zip(self.classifier.classes_, probabilities)}
        }

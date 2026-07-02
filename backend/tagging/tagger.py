from sentence_transformers import SentenceTransformer
import numpy as np

class SemanticTagger:
    """
    Service class responsible for generating tags (Study, Finance, Health, Shopping, 
    Travel, Personal, Work) using Sentence Transformers and Cosine Similarity.
    """
    
    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        # Load the sentence transformer model
        self.model = SentenceTransformer(model_name)
        
        # Define core categories
        self.tags = ["Study", "Finance", "Health", "Shopping", "Travel", "Personal", "Work"]
        
        # Enriched semantic phrases for each tag to improve embedding match quality
        self.tag_descriptions = [
            "Study, education, learning, homework, research, school, college, class, exam",
            "Finance, bills, money, payment, invoice, bank, salary, tax, expense, budget",
            "Health, gym, fitness, doctor, medicine, dentist, workout, exercise, clinic, symptom",
            "Shopping, groceries, store, buy, purchase, retail, supermarket, order, amazon",
            "Travel, trip, flight, hotel, vacation, booking, ticket, luggage, travel, explore",
            "Personal, family, home, birthday, friend, hobby, keys, house, laundry, cleaning",
            "Work, office, job, manager, project, meeting, interview, client, email, task, team"
        ]
        
        # Precompute tag embeddings once during service initialization
        self.tag_embeddings = self.model.encode(self.tag_descriptions, convert_to_numpy=True)
        
    def generate_tags(self, text: str, threshold: float = 0.28) -> list:
        """
        Embeds the input text and computes cosine similarities against tag representations.
        Returns matching categories that meet or exceed the similarity threshold.
        """
        cleaned_text = text.strip()
        if not cleaned_text:
            return ["Personal"]
            
        # Embed query
        query_embedding = self.model.encode(cleaned_text, convert_to_numpy=True)
        
        # Calculate Cosine Similarities
        matched_tags = []
        for idx, tag_emb in enumerate(self.tag_embeddings):
            dot_prod = np.dot(query_embedding, tag_emb)
            norm_q = np.linalg.norm(query_embedding)
            norm_t = np.linalg.norm(tag_emb)
            
            similarity = dot_prod / (norm_q * norm_t) if norm_q > 0 and norm_t > 0 else 0.0
            
            if similarity >= threshold:
                matched_tags.append(self.tags[idx])
                
        # Default fallback if no tag surpasses threshold
        if not matched_tags:
            matched_tags.append("Personal")
            
        return matched_tags

import spacy
from collections import Counter

class ExtractiveSummarizer:
    """
    Service class responsible for generating extractive summaries for long notes 
    (notes containing more than 100 words).
    """
    
    def __init__(self):
        self.nlp = spacy.load("en_core_web_sm")

    def summarize(self, text: str, num_sentences: int = 2) -> str:
        """
        Generate a summary of the input text using sentence scoring.
        Only summarizes text containing > 100 words, otherwise returns the original text.
        """
        words = text.split()
        if len(words) <= 100:
            return text
            
        doc = self.nlp(text)
        
        # 1. Segment sentences
        sentences = list(doc.sents)
        if len(sentences) <= num_sentences:
            return text
            
        # 2. Extract keywords and calculate frequency weights
        keywords = []
        for token in doc:
            # Exclude stop words, punctuation, space, and numbers
            if not token.is_stop and not token.is_punct and not token.is_space and not token.like_num:
                keywords.append(token.text.lower())
                
        word_frequencies = Counter(keywords)
        if not word_frequencies:
            # Return first few sentences if no keywords are identified
            return " ".join([s.text.strip() for s in sentences[:num_sentences]])
            
        # Normalize frequencies by scaling against the max frequency count
        max_freq = max(word_frequencies.values())
        for word in word_frequencies:
            word_frequencies[word] = word_frequencies[word] / max_freq
            
        # 3. Score sentences by summing the weight of their constituent words
        sentence_scores = {}
        for sent in sentences:
            score = 0
            for token in sent:
                word_lower = token.text.lower()
                if word_lower in word_frequencies:
                    score += word_frequencies[word_lower]
            # Normalize by sentence length to prevent biased scoring of long sentences
            sentence_scores[sent] = score / len(sent) if len(sent) > 0 else 0
            
        # 4. Sort sentences and pick top N highest-scoring sentences
        sorted_sentences = sorted(sentence_scores.items(), key=lambda x: x[1], reverse=True)
        top_sentences = [item[0] for item in sorted_sentences[:num_sentences]]
        
        # Re-sort selected sentences based on their original order in the source document
        top_sentences.sort(key=lambda s: s.start)
        
        summary = " ".join([s.text.strip() for s in top_sentences])
        return summary

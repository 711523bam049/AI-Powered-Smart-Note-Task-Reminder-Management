import spacy
import dateparser
import re
from datetime import datetime

class EntityExtractor:
    """
    Service class responsible for extracting entities (dates, locations, people, priority) 
    from user text prompts using spaCy and dateparser.
    """
    
    def __init__(self):
        # Load the English language model
        self.nlp = spacy.load("en_core_web_sm")

    def extract(self, text: str) -> dict:
        """
        Extract named entities and parse date details.
        Returns a dictionary of locations, people, organizations, money, dates, 
        normalized ISO timestamps, and priority states.
        """
        doc = self.nlp(text)
        
        extracted = {
            "dates": [],
            "normalized_due_date": None,
            "people": [],
            "organizations": [],
            "locations": [],
            "money": [],
            "priority": "medium"  # default
        }
        
        # 1. Run spaCy NER
        raw_dates = []
        for ent in doc.ents:
            label = ent.label_
            if label in ("DATE", "TIME"):
                raw_dates.append(ent.text)
            elif label == "PERSON":
                extracted["people"].append(ent.text)
            elif label in ("ORG", "COMPANY"):
                extracted["organizations"].append(ent.text)
            elif label in ("GPE", "LOC", "FAC"):
                extracted["locations"].append(ent.text)
            elif label == "MONEY":
                extracted["money"].append(ent.text)
                
        # Remove duplicates from extracted lists
        extracted["people"] = list(set(extracted["people"]))
        extracted["organizations"] = list(set(extracted["organizations"]))
        extracted["locations"] = list(set(extracted["locations"]))
        extracted["money"] = list(set(extracted["money"]))
        
        # 2. Priority extraction using keyword mapping
        text_lower = text.lower()
        if any(w in text_lower for w in ["urgent", "asap", "high", "critical", "important", "must"]):
            extracted["priority"] = "high"
        elif any(w in text_lower for w in ["low", "minor", "backlog", "sometime", "leisure"]):
            extracted["priority"] = "low"
            
        # 3. Date normalization
        # If spaCy missed any temporal markers, run regex fallbacks
        if not raw_dates:
            temporal_patterns = [
                r"\b(today|tomorrow|tonight)\b",
                r"\b(next\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday|week|month))\b",
                r"\b(on\s+[a-zA-Z]+(\s+\d+)?)\b",
                r"\b(at\s+\d+(:?\d+)?\s*(am|pm)?)\b",
                r"\bin\s+\d+\s+(days|weeks|months|hours)\b"
            ]
            for pattern in temporal_patterns:
                matches = re.finditer(pattern, text_lower)
                for match in matches:
                    raw_dates.append(match.group())

        extracted["dates"] = list(set(raw_dates))
        
        # Parse the first found date string using dateparser
        if extracted["dates"]:
            combined_date_str = " ".join(extracted["dates"])
            parsed_date = dateparser.parse(
                combined_date_str,
                settings={"PREFER_DATES_FROM": "future", "RETURN_AS_TIMEZONE_AWARE": False}
            )
            
            # Fallback: try parsing individual segments if the combined phrase fails
            if not parsed_date:
                for date_str in extracted["dates"]:
                    parsed_date = dateparser.parse(
                        date_str,
                        settings={"PREFER_DATES_FROM": "future", "RETURN_AS_TIMEZONE_AWARE": False}
                    )
                    if parsed_date:
                        break
                        
            if parsed_date:
                extracted["normalized_due_date"] = parsed_date.isoformat()
                
        return extracted

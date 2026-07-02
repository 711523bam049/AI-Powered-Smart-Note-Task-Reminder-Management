import os
import pytest
from classifier.intent_classifier import IntentClassifier
from entity_extraction.extractor import EntityExtractor
from tagging.tagger import SemanticTagger
from summarization.summarizer import ExtractiveSummarizer

@pytest.fixture(scope="module")
def intent_classifier():
    # We can use a test weights directory to avoid polluting the main weights directory
    test_weights_dir = "./test_ml_weights"
    classifier = IntentClassifier(weights_dir=test_weights_dir)
    yield classifier
    # Clean up test files
    for filename in ["vectorizer.pkl", "classifier.pkl"]:
        filepath = os.path.join(test_weights_dir, filename)
        if os.path.exists(filepath):
            os.remove(filepath)
    if os.path.exists(test_weights_dir):
        os.rmdir(test_weights_dir)

@pytest.fixture(scope="module")
def entity_extractor():
    return EntityExtractor()

@pytest.fixture(scope="module")
def semantic_tagger():
    return SemanticTagger()

@pytest.fixture(scope="module")
def extractive_summarizer():
    return ExtractiveSummarizer()

# --- Intent Classifier Tests ---

def test_intent_classifier_rules(intent_classifier):
    # Rule: remind me to... -> reminder
    res = intent_classifier.predict("Remind me to call mom at 8 PM")
    assert res["intent"] == "reminder"
    assert res["method"] == "rule"
    
    # Rule: brief action verbs -> todo
    res2 = intent_classifier.predict("Buy milk")
    assert res2["intent"] == "todo"
    assert res2["method"] == "rule"

def test_intent_classifier_ml(intent_classifier):
    # ML: matches note/task/reminder/todo seed distribution
    # "Deep learning is based on artificial neural networks" -> note
    res = intent_classifier.predict("Deep learning is based on artificial neural networks")
    assert res["intent"] == "note"
    assert res["method"] == "ml"
    
    # "Schedule dentist appointment" -> task
    res2 = intent_classifier.predict("Schedule dentist appointment")
    assert res2["intent"] == "task"
    assert res2["method"] == "ml"

# --- Entity Extractor Tests ---

def test_entity_extractor_priority(entity_extractor):
    # urgent, ASAP -> high
    res = entity_extractor.extract("Urgent: Call HR immediately")
    assert res["priority"] == "high"
    
    # low, sometime -> low
    res2 = entity_extractor.extract("Sometime next week buy a book")
    assert res2["priority"] == "low"
    
    # default -> medium
    res3 = entity_extractor.extract("Meeting with Rahul next Monday")
    assert res3["priority"] == "medium"

def test_entity_extractor_ner(entity_extractor):
    res = entity_extractor.extract("I met John Doe yesterday at Google in London at 5 PM")
    # Check that we extracted some entity information
    assert "John Doe" in res["people"]
    assert "Google" in res["organizations"]
    assert "London" in res["locations"]
    assert len(res["dates"]) > 0
    assert res["normalized_due_date"] is not None

# --- Semantic Tagger Tests ---

def test_semantic_tagger(semantic_tagger):
    # Finance tags
    res = semantic_tagger.generate_tags("Need to pay my electricity bills and check bank balance")
    assert "Finance" in res
    
    # Work tags
    res2 = semantic_tagger.generate_tags("Work on the project proposal and email the team manager")
    assert "Work" in res2
    
    # Fallback to Personal
    res3 = semantic_tagger.generate_tags("Random gibberish that doesn't match anything")
    assert res3 == ["Personal"]

# --- Extractive Summarizer Tests ---

def test_extractive_summarizer_short(extractive_summarizer):
    text = "Short text under 100 words."
    res = extractive_summarizer.summarize(text)
    assert res == text

def test_extractive_summarizer_long(extractive_summarizer):
    # A long paragraph of > 100 words to test summarization
    long_text = (
        "Natural language processing (NLP) is a collective force of computer science, artificial intelligence, "
        "and computational linguistics concerned with the interactions between computers and human languages. "
        "Modern NLP algorithms are based on machine learning, especially deep learning. "
        "Instead of hand-coding large sets of rules, NLP can learn features directly from massive corpora of text. "
        "This makes it highly scalable and capable of understanding nuance in human speech. "
        "In this application, we use various NLP services to automatically parse, classify, and organize user captures. "
        "Specifically, the intent classifier determines if an entry is a task, a reminder, a todo, or a general note. "
        "The entity extractor identifies people, locations, organizations, and temporal markers to normalize dates. "
        "The semantic tagger generates tags like Work, Study, or Finance based on semantic similarity. "
        "Finally, the extractive summarizer shortens long notes so that users can review them quickly on their dashboards. "
        "This full pipeline ensures that captures are stored in a structured, searchable, and highly usable format."
    )
    res = extractive_summarizer.summarize(long_text)
    assert len(res.split()) < len(long_text.split())
    # The summary should extract high-scoring sentences
    assert len(res) > 0

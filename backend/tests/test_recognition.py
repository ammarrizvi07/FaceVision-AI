import pytest
import numpy as np
from app.ml.recognizer import FaceRecognizer

def test_cosine_similarity_identical_vectors():
    vec1 = np.array([1.0, 0.0, 0.5, -0.2], dtype=np.float32)
    vec1 = vec1 / np.linalg.norm(vec1)
    sim = FaceRecognizer.compute_cosine_similarity(vec1, vec1)
    assert abs(sim - 1.0) < 1e-5

def test_cosine_similarity_orthogonal_vectors():
    vec1 = np.array([1.0, 0.0, 0.0], dtype=np.float32)
    vec2 = np.array([0.0, 1.0, 0.0], dtype=np.float32)
    sim = FaceRecognizer.compute_cosine_similarity(vec1, vec2)
    assert abs(sim - 0.0) < 1e-5

def test_recognizer_matches_known_user():
    recognizer = FaceRecognizer(threshold=0.363)
    target_emb = np.random.randn(128).astype(np.float32)
    target_emb /= np.linalg.norm(target_emb)
    
    # Enrolled user with very similar embedding (slight noise)
    similar_emb = target_emb + np.random.normal(0, 0.05, size=target_emb.shape).astype(np.float32)
    similar_emb /= np.linalg.norm(similar_emb)

    enrolled = [{
        'id': 1,
        'name': 'Alice Smith',
        'embeddings': [similar_emb]
    }]

    result = recognizer.identify_face(target_emb, enrolled)
    assert result['status'] == 'recognized'
    assert result['name'] == 'Alice Smith'
    assert result['user_id'] == 1
    assert result['similarity'] > 0.363

def test_recognizer_returns_unknown_for_dissimilar_face():
    recognizer = FaceRecognizer(threshold=0.363)
    target_emb = np.ones(128, dtype=np.float32)
    target_emb /= np.linalg.norm(target_emb)

    different_emb = -np.ones(128, dtype=np.float32)
    different_emb /= np.linalg.norm(different_emb)

    enrolled = [{
        'id': 2,
        'name': 'Bob Jones',
        'embeddings': [different_emb]
    }]

    result = recognizer.identify_face(target_emb, enrolled)
    assert result['status'] == 'unknown'
    assert result['name'] == 'Unknown'
    assert result['user_id'] is None

import numpy as np
from typing import List, Dict, Any, Optional
from collections import deque
from app.config import settings

class FaceRecognizer:
    def __init__(self, threshold: float = None):
        self.threshold = threshold if threshold is not None else settings.DEFAULT_COSINE_THRESHOLD
        self._history = deque(maxlen=5) # Temporal smoothing buffer

    @staticmethod
    def compute_cosine_similarity(vec1: np.ndarray, vec2: np.ndarray) -> float:
        dot = float(np.dot(vec1, vec2))
        norm1 = float(np.linalg.norm(vec1))
        norm2 = float(np.linalg.norm(vec2))
        if norm1 == 0 or norm2 == 0:
            return 0.0
        return dot / (norm1 * norm2)

    def identify_face(self, target_embedding: np.ndarray, enrolled_users: List[Dict[str, Any]], custom_threshold: Optional[float] = None) -> Dict[str, Any]:
        threshold = custom_threshold if custom_threshold is not None else self.threshold
        best_match = None
        highest_similarity = -1.0

        for user in enrolled_users:
            user_id = user['id']
            user_name = user['name']
            embeddings = user.get('embeddings', [])
            
            # Compute similarity against all registered sample embeddings for this user
            user_sims = [self.compute_cosine_similarity(target_embedding, emb) for emb in embeddings]
            if not user_sims:
                continue

            # Best sample similarity or mean of top 3
            user_sims.sort(reverse=True)
            candidate_sim = float(np.mean(user_sims[:3])) if len(user_sims) >= 3 else user_sims[0]

            if candidate_sim > highest_similarity:
                highest_similarity = candidate_sim
                best_match = {
                    'user_id': user_id,
                    'name': user_name,
                    'similarity': round(candidate_sim, 4)
                }

        if best_match and highest_similarity >= threshold:
            return {
                'status': 'recognized',
                'name': best_match['name'],
                'user_id': best_match['user_id'],
                'similarity': best_match['similarity'],
                'threshold_used': threshold
            }
        else:
            return {
                'status': 'unknown',
                'name': 'Unknown',
                'user_id': None,
                'similarity': max(0.0, round(highest_similarity, 4)),
                'threshold_used': threshold
            }

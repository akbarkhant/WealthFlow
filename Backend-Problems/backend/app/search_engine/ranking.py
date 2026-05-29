# app/search_engine/ranking.py

from typing import List, Dict
from math import log


class RankingEngine:
    """
    Search result ranking engine
    """

    FIELD_WEIGHTS = {
        "title": 10,
        "algorithm": 8,
        "tags": 7,
        "category": 5,
        "explanation": 3
    }

    def calculate_field_score(
        self,
        text: str,
        query_terms: List[str],
        weight: int
    ) -> float:
        """
        Scores field relevance
        """

        if not text:
            return 0.0

        text = text.lower()

        score = 0.0

        for term in query_terms:

            occurrences = text.count(term.lower())

            if occurrences > 0:
                score += occurrences * weight

        return score

    def freshness_score(self, days_old: int) -> float:
        """
        Recency scoring
        """

        return 1 / (1 + log(days_old + 1))

    def tag_similarity_score(
        self,
        query_tags: List[str],
        document_tags: List[str]
    ) -> float:
        """
        Tag similarity scoring
        """

        if not query_tags or not document_tags:
            return 0.0

        intersection = set(query_tags).intersection(
            set(document_tags)
        )

        union = set(query_tags).union(
            set(document_tags)
        )

        return len(intersection) / len(union)

    def rank(
        self,
        documents: List[Dict],
        query_terms: List[str]
    ) -> List[Dict]:
        """
        Ranks search results
        """

        ranked_results = []

        for doc in documents:

            total_score = 0.0

            for field, weight in self.FIELD_WEIGHTS.items():

                field_text = str(doc.get(field, ""))

                field_score = self.calculate_field_score(
                    field_text,
                    query_terms,
                    weight
                )

                total_score += field_score

            doc["ranking_score"] = round(total_score, 3)

            ranked_results.append(doc)

        ranked_results.sort(
            key=lambda x: x["ranking_score"],
            reverse=True
        )

        return ranked_results
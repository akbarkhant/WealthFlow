# app/search_engine/query_parser.py

import re
from typing import Dict, List


class QueryParser:
    """
    Intelligent query parsing system
    """

    OPERATORS = {
        "AND",
        "OR",
        "NOT"
    }

    FILTER_PATTERN = r"(\w+):([\w\-]+)"

    def normalize(self, query: str) -> str:
        """
        Normalizes query text
        """

        query = query.lower()
        query = query.strip()

        query = re.sub(r"\s+", " ", query)

        return query

    def extract_filters(self, query: str) -> Dict[str, str]:
        """
        Extract filters like:
        category:distributed-systems
        difficulty:advanced
        """

        matches = re.findall(self.FILTER_PATTERN, query)

        filters = {}

        for key, value in matches:
            filters[key] = value

        return filters

    def remove_filters(self, query: str) -> str:
        """
        Removes filters from query
        """

        cleaned = re.sub(self.FILTER_PATTERN, "", query)

        return cleaned.strip()

    def tokenize_query(self, query: str) -> List[str]:
        """
        Splits query into searchable tokens
        """

        return query.split()

    def parse(self, query: str) -> Dict:
        """
        Full parsing pipeline
        """

        normalized = self.normalize(query)

        filters_ = self.extract_filters(normalized)

        clean_query = self.remove_filters(normalized)

        tokens = self.tokenize_query(clean_query)

        return {
            "original_query": query,
            "normalized_query": normalized,
            "clean_query": clean_query,
            "tokens": tokens,
            "filters": filters_
        }
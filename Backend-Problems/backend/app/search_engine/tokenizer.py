# app/search_engine/tokenizer.py

import re
from typing import List


class Tokenizer:
    """
    Text tokenizer for search indexing
    """

    STOPWORDS = {
        "the",
        "a",
        "an",
        "and",
        "or",
        "to",
        "of",
        "in",
        "for",
        "on",
        "with",
        "by",
        "is",
        "are",
        "was",
        "were",
        "be",
        "this",
        "that"
    }

    def normalize(self, text: str) -> str:
        """
        Lowercase + trim
        """

        text = text.lower().strip()

        return text

    def remove_special_characters(self, text: str) -> str:
        """
        Removes symbols
        """

        return re.sub(r"[^a-zA-Z0-9\s]", " ", text)

    def split(self, text: str) -> List[str]:
        """
        Splits text into tokens
        """

        return text.split()

    def remove_stopwords(self, tokens: List[str]) -> List[str]:
        """
        Removes common stopwords
        """

        return [
            token
            for token in tokens
            if token not in self.STOPWORDS
        ]

    def stem(self, tokens: List[str]) -> List[str]:
        """
        Basic stemming
        """

        stemmed = []

        for token in tokens:

            if token.endswith("ing"):
                token = token[:-3]

            elif token.endswith("ed"):
                token = token[:-2]

            elif token.endswith("s") and len(token) > 3:
                token = token[:-1]

            stemmed.append(token)

        return stemmed

    def tokenize(self, text: str) -> List[str]:
        """
        Complete tokenization pipeline
        """

        text = self.normalize(text)

        text = self.remove_special_characters(text)

        tokens = self.split(text)

        tokens = self.remove_stopwords(tokens)

        tokens = self.stem(tokens)

        return tokens
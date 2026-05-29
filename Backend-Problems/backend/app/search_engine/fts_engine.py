# app/search_engine/fts_engine.py

import sqlite3
from typing import List, Dict, Any


class FTSEngine:
    """
    SQLite FTS5 Search Engine
    """

    def __init__(self, db_path: str):
        self.db_path = db_path

    def connect(self):
        return sqlite3.connect(self.db_path)

    def initialize(self):
        """
        Creates FTS5 virtual table
        """

        conn = self.connect()
        cursor = conn.cursor()

        cursor.execute("""
        CREATE VIRTUAL TABLE IF NOT EXISTS problems_fts
        USING fts5(
            title,
            algorithm,
            category,
            explanation,
            technologies,
            tags,
            content='',
            tokenize='porter unicode61'
        );
        """)

        conn.commit()
        conn.close()

    def insert_document(
        self,
        title: str,
        algorithm: str,
        category: str,
        explanation: str,
        technologies: str,
        tags: str
    ):
        """
        Inserts searchable document
        """

        conn = self.connect()
        cursor = conn.cursor()

        cursor.execute("""
        INSERT INTO problems_fts (
            title,
            algorithm,
            category,
            explanation,
            technologies,
            tags
        )
        VALUES (?, ?, ?, ?, ?, ?)
        """, (
            title,
            algorithm,
            category,
            explanation,
            technologies,
            tags
        ))

        conn.commit()
        conn.close()

    def search(self, query: str, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Performs full-text search
        """

        conn = self.connect()
        conn.row_factory = sqlite3.Row

        cursor = conn.cursor()

        sql = """
        SELECT
            rowid,
            title,
            algorithm,
            category,
            explanation,
            technologies,
            tags,
            bm25(problems_fts, 10.0, 8.0, 5.0, 3.0, 2.0, 2.0) AS score
        FROM problems_fts
        WHERE problems_fts MATCH ?
        ORDER BY score
        LIMIT ?
        """

        cursor.execute(sql, (query, limit))

        rows = cursor.fetchall()

        conn.close()

        return [dict(row) for row in rows]

    def delete_index(self):
        """
        Clears all indexed documents
        """

        conn = self.connect()
        cursor = conn.cursor()

        cursor.execute("DELETE FROM problems_fts")

        conn.commit()
        conn.close()
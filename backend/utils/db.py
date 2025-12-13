import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv

load_dotenv()

class Database:
    def __init__(self):
        """
        Initialize database connection with individual credentials.
        
        Args:
            host: Database host address
            port: Database port number
            name: Database name
            password: Database password
            username: Database username (async default: postgres)
            db_type: Database type (async default: postgresql)
        """
        self.host = os.getenv("DB_HOST")
        self.port = os.getenv("DB_PORT")
        self.name = os.getenv("DB_NAME")
        self.password = os.getenv("DB_PASSWORD")
        self.username = os.getenv("DB_USERNAME")
        # Construct database URL
        db_url = f"postgresql://{self.username}:{self.password}@{self.host}:{self.port}/{self.name}"
        self.engine = create_engine(db_url)
        self.session_maker = sessionmaker(bind=self.engine)

    def execute_action(self, query: str, params: Optional[Dict[str, Any]] = None) -> int:
        """
        Execute a single SQL action (INSERT, UPDATE, DELETE).
        
        Args:
            query: SQL query string
            params: Optional dictionary of parameters for parameterized queries
            
        Returns:
            Number of rows affected
        """
        with self.session_maker() as session:
            if params:
                result = session.execute(text(query), params)
            else:
                result = session.execute(text(query))
            session.commit()
            return result.rowcount

    def execute_and_return_id(self, query: str, params: Optional[Dict[str, Any]] = None) -> Optional[int]:
        """
        Execute an INSERT query with RETURNING id and return the generated ID.
        
        Args:
            query: SQL INSERT query string with RETURNING id clause
            params: Optional dictionary of parameters for parameterized queries
            
        Returns:
            The generated ID, or None if not found
        """
        with self.session_maker() as session:
            if params:
                result = session.execute(text(query), params)
            else:
                result = session.execute(text(query))
            session.commit()
            row = result.fetchone()
            if row:
                return row[0]
            return None

    def execute_bulk_action(self, query: str, params_list: List[Dict[str, Any]]) -> int:
        """
        Execute bulk SQL actions (bulk INSERT, UPDATE, DELETE).
        
        Args:
            query: SQL query string
            params_list: List of parameter dictionaries for bulk operations
            
        Returns:
            Total number of rows affected
        """
        total_rows = 0
        with self.session_maker() as session:
            for params in params_list:
                result = session.execute(text(query), params)
                total_rows += result.rowcount
            session.commit()
            return total_rows

    def read(self, query: str, params: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """
        Execute a SELECT query and return results.
        
        Args:
            query: SQL SELECT query string
            params: Optional dictionary of parameters for parameterized queries
            
        Returns:
            List of dictionaries representing rows
        """
        with self.session_maker() as session:
            if params:
                result = session.execute(text(query), params)
            else:
                result = session.execute(text(query))
            
            # Convert rows to list of dictionaries
            columns = result.keys()
            rows = []
            for row in result:
                rows.append(dict(zip(columns, row)))
            return rows

    def get_session(self):
        """Get a database session for advanced operations."""
        return self.session_maker()

db = Database()
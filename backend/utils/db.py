import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv

load_dotenv()

class Database:
    def __init__(self):
        """
        Initialize database connection with individual credentials and optimized pool settings.
        
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
        
        # Optimized engine configuration with connection pooling
        self.engine = create_engine(
            db_url,
            # Connection pool settings
            pool_size=10,  # Number of connections to maintain persistently
            max_overflow=20,  # Maximum number of connections that can overflow
            pool_timeout=30,  # Seconds to wait before giving up on getting a connection
            pool_recycle=3600,  # Recycle connections after 1 hour (prevent stale connections)
            pool_pre_ping=True,  # Verify connections before using them
            # Performance optimizations
            echo=False,  # Set to True for SQL query logging (useful for debugging)
            future=True,  # Use SQLAlchemy 2.0 style
        )
        self.session_maker = sessionmaker(bind=self.engine, expire_on_commit=False)

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
        Execute bulk SQL actions (bulk INSERT, UPDATE, DELETE) using optimized batch execution.
        
        Args:
            query: SQL query string
            params_list: List of parameter dictionaries for bulk operations
            
        Returns:
            Total number of rows affected
        """
        if not params_list:
            return 0
        
        with self.engine.begin() as conn:
            # Use connection-level execute with list for optimal bulk performance
            # This allows SQLAlchemy to batch operations efficiently
            stmt = text(query)
            result = conn.execute(stmt, params_list)
            return result.rowcount if result.rowcount >= 0 else len(params_list)

    def read(self, query: str, params: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """
        Execute a SELECT query and return results with optimized row conversion.
        
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
            
            # Optimized row-to-dict conversion using list comprehension
            # Fetch all rows and columns at once for better performance
            columns = list(result.keys())
            rows = result.fetchall()
            return [dict(zip(columns, row)) for row in rows]

    def get_session(self):
        """Get a database session for advanced operations."""
        return self.session_maker()

db = Database()
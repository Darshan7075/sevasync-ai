"""Shared test fixtures for the SevaSync AI backend test suite."""

import os
import sys
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Ensure the backend package is importable
sys.path.insert(0, os.path.dirname(__file__))

from database import Base
from main import app
from database import get_db


@pytest.fixture(name="db_session")
def fixture_db_session():
    """Create a fresh in-memory SQLite database for each test."""
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    TestSession = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = TestSession()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(name="client")
def fixture_client(db_session):
    """FastAPI test client backed by the in-memory database."""
    from httpx import ASGITransport, AsyncClient

    def _override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = _override_get_db

    from starlette.testclient import TestClient

    with TestClient(app) as c:
        yield c

    app.dependency_overrides.clear()

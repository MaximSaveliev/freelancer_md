import os

os.environ.setdefault("RABBITMQ_URL", "amqp://guest:guest@localhost/")
os.environ.setdefault("RESEND_API_KEY", "re_test_dummy")
os.environ.setdefault("SENDER_EMAIL", "test@example.com")
os.environ.setdefault("RESEND_TEST_EMAIL", "")
os.environ.setdefault("TELEGRAM_BOT_TOKEN", "")

import pytest
from unittest.mock import AsyncMock, patch
from fastapi.testclient import TestClient
from main import app


@pytest.fixture
def client():
    # Patch start_consumer so lifespan doesn't try to connect to RabbitMQ
    with patch("main.start_consumer", new=AsyncMock()):
        with TestClient(app) as c:
            yield c

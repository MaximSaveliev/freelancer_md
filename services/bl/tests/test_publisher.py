import asyncio
from unittest.mock import AsyncMock, MagicMock, patch

from publisher import publish_event


def _run(coro):
    return asyncio.run(coro)


def _make_mock_connection():
    mock_channel = MagicMock()
    mock_channel.declare_queue = AsyncMock()
    mock_channel.default_exchange = MagicMock()
    mock_channel.default_exchange.publish = AsyncMock()

    mock_connection = MagicMock()
    mock_connection.__aenter__ = AsyncMock(return_value=mock_connection)
    mock_connection.__aexit__ = AsyncMock(return_value=False)
    mock_connection.channel = AsyncMock(return_value=mock_channel)

    return mock_connection, mock_channel


def test_publish_event_connects_and_publishes():
    mock_connection, mock_channel = _make_mock_connection()

    with patch("aio_pika.connect_robust", new=AsyncMock(return_value=mock_connection)):
        _run(publish_event("bl_create_user", {"user_id": "123", "email": "test@example.com"}))

    mock_channel.declare_queue.assert_called_once_with("bl_create_user", durable=True)
    mock_channel.default_exchange.publish.assert_called_once()


def test_publish_event_message_contains_payload():
    import json

    mock_connection, mock_channel = _make_mock_connection()
    captured = {}

    async def capture_publish(msg, routing_key):
        captured["body"] = json.loads(msg.body)
        captured["routing_key"] = routing_key

    mock_channel.default_exchange.publish = capture_publish

    payload = {"user_id": "123", "email": "test@example.com", "role": "FREELANCER"}

    with patch("aio_pika.connect_robust", new=AsyncMock(return_value=mock_connection)):
        _run(publish_event("bl_create_user", payload))

    assert captured["body"] == payload
    assert captured["routing_key"] == "bl_create_user"


def test_publish_event_handles_connection_error_without_raising():
    with patch("aio_pika.connect_robust", new=AsyncMock(side_effect=Exception("Connection refused"))):
        _run(publish_event("bl_create_user", {"key": "value"}))


def test_publish_event_handles_publish_error_without_raising():
    mock_connection, mock_channel = _make_mock_connection()
    mock_channel.default_exchange.publish = AsyncMock(side_effect=Exception("Publish failed"))

    with patch("aio_pika.connect_robust", new=AsyncMock(return_value=mock_connection)):
        _run(publish_event("bl_create_user", {"key": "value"}))

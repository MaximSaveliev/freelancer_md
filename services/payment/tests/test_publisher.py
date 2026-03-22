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


def test_publish_event_connects_and_publishes(capsys):
    mock_connection, mock_channel = _make_mock_connection()

    with patch("aio_pika.connect_robust", new=AsyncMock(return_value=mock_connection)):
        _run(publish_event("payment.completed", {"user_id": "123", "email": "test@example.com"}))

    mock_channel.declare_queue.assert_called_once_with("payment.completed", durable=True)
    mock_channel.default_exchange.publish.assert_called_once()


def test_publish_event_message_contains_payload():
    import json
    import aio_pika

    mock_connection, mock_channel = _make_mock_connection()
    captured_message = {}

    async def capture_publish(msg, routing_key):
        captured_message["body"] = json.loads(msg.body)
        captured_message["routing_key"] = routing_key

    mock_channel.default_exchange.publish = capture_publish

    payload = {"user_id": "123", "plan": "pro", "amount": 999}

    with patch("aio_pika.connect_robust", new=AsyncMock(return_value=mock_connection)):
        _run(publish_event("payment.completed", payload))

    assert captured_message["body"] == payload
    assert captured_message["routing_key"] == "payment.completed"


def test_publish_event_handles_connection_error_without_raising():
    with patch("aio_pika.connect_robust", new=AsyncMock(side_effect=Exception("Connection refused"))):
        # Should not raise — errors are caught internally and logged
        _run(publish_event("payment.completed", {"key": "value"}))


def test_publish_event_handles_publish_error_without_raising():
    mock_connection, mock_channel = _make_mock_connection()
    mock_channel.default_exchange.publish = AsyncMock(side_effect=Exception("Publish failed"))

    with patch("aio_pika.connect_robust", new=AsyncMock(return_value=mock_connection)):
        _run(publish_event("payment.completed", {"key": "value"}))

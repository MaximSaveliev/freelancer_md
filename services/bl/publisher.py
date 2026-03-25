import json
import logging

import aio_pika

import config

logger = logging.getLogger(__name__)


async def publish_event(queue_name: str, payload: dict) -> None:
    try:
        connection = await aio_pika.connect_robust(config.RABBITMQ_URL)
        async with connection:
            channel = await connection.channel()
            await channel.declare_queue(queue_name, durable=True)
            await channel.default_exchange.publish(
                aio_pika.Message(
                    body=json.dumps(payload).encode(),
                    delivery_mode=aio_pika.DeliveryMode.PERSISTENT,
                ),
                routing_key=queue_name,
            )
        logger.info(f"Published '{queue_name}': {list(payload.keys())}")
    except Exception as e:
        logger.error(f"Failed to publish to '{queue_name}': {e}")

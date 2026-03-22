import os

from dotenv import load_dotenv

load_dotenv()

RABBITMQ_URL: str = os.getenv("RABBITMQ_URL", "amqp://guest:guest@localhost/")
RESEND_API_KEY: str = os.getenv("RESEND_API_KEY", "")
SENDER_EMAIL: str = os.getenv("SENDER_EMAIL", "")
RESEND_TEST_EMAIL: str = os.getenv("RESEND_TEST_EMAIL", "")  # if set, all emails are redirected here
TELEGRAM_BOT_TOKEN: str = os.getenv("TELEGRAM_BOT_TOKEN", "")

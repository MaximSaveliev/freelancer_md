import os
import sys

sys.path.insert(0, os.path.dirname(__file__))  # makes helpers.py importable

# Must be set before any service imports so config.py reads them correctly
os.environ.setdefault("STRIPE_SECRET_KEY", "sk_test_fakekey000000000000000000000")
os.environ.setdefault("STRIPE_WEBHOOK_SECRET", "whsec_test_fake_secret")
os.environ.setdefault("STRIPE_PRO_PRICE_ID_USD", "price_pro_test")
os.environ.setdefault("STRIPE_PREMIUM_PRICE_ID_USD", "price_premium_test")
os.environ.setdefault("SUPABASE_URL", "https://dummy.supabase.co")
os.environ.setdefault("SUPABASE_KEY", "eyJ_dummy_supabase_key_for_testing_only")
os.environ.setdefault("RABBITMQ_URL", "amqp://guest:guest@localhost/")
os.environ.setdefault("BASE_URL", "http://localhost:3000")

import pytest
from fastapi.testclient import TestClient
from main import app


@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c

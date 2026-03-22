def test_health_check(client):
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok", "service": "payment"}


def test_plans_returns_three_tiers(client):
    resp = client.get("/plans")
    assert resp.status_code == 200
    plans = resp.json()["plans"]
    assert [p["id"] for p in plans] == ["basic", "pro", "premium"]


def test_plans_basic_is_free(client):
    resp = client.get("/plans")
    basic = next(p for p in resp.json()["plans"] if p["id"] == "basic")
    assert basic["price_usd"] == 0


def test_plans_paid_tiers_have_price_ids(client):
    resp = client.get("/plans")
    plans = {p["id"]: p for p in resp.json()["plans"]}
    assert plans["pro"]["price_id"] == "price_pro_test"
    assert plans["premium"]["price_id"] == "price_premium_test"

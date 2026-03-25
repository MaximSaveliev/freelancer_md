from supabase import Client, create_client

import config


def get_supabase() -> Client:
    return create_client(config.SUPABASE_URL, config.SUPABASE_KEY)

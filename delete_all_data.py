import requests

SUPABASE_URL = "https://zcnkzjcsacurmsktyecc.supabase.co"
SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpjbmt6amNzYWN1cm1za3R5ZWNjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTI2OTMxNywiZXhwIjoyMDg2ODQ1MzE3fQ.spnQ_JntSBvqXXrVWVAAIY4x3travHaEwbUqoVf9p7k"

headers = {
    "apikey": SERVICE_ROLE_KEY,
    "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
    "Content-Type": "application/json",
}

print("🗑️  全データを削除します...")

# 全データ削除
for year in [2023, 2024, 2025, 2026]:
    response = requests.delete(
        f"{SUPABASE_URL}/rest/v1/reservations?date=gte.{year}-01-01&date=lte.{year}-12-31",
        headers=headers
    )
    print(f"  {year}年: {response.status_code}")

print("✅ 削除完了")

import openpyxl
from datetime import datetime, timedelta
import requests

# Supabase接続情報（service_role keyを使用）
SUPABASE_URL = "https://zcnkzjcsacurmsktyecc.supabase.co"
SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpjbmt6amNzYWN1cm1za3R5ZWNjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTI2OTMxNywiZXhwIjoyMDg2ODQ1MzE3fQ.spnQ_JntSBvqXXrVWVAAIY4x3travHaEwbUqoVf9p7k"

print("🗑️ まず既存の2026年データを削除します...")

# 既存の2026年データを削除
headers = {
    "apikey": SERVICE_ROLE_KEY,
    "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
    "Content-Type": "application/json",
}

# 2026年1月～9月のデータを削除
delete_response = requests.delete(
    f"{SUPABASE_URL}/rest/v1/reservations?date=gte.2026-01-01&date=lte.2026-09-30",
    headers=headers
)

if delete_response.status_code in [200, 204]:
    print("✅ 既存データを削除しました")
else:
    print(f"⚠️ 削除時のレスポンス: {delete_response.status_code}")

# Excelファイルを読み込み
wb = openpyxl.load_workbook('/home/user/uploaded_files/売上予定表(2026年） (1).xlsx')
sheet = wb['宿泊予定表（2026.2.1)']

reservations = []

for row in sheet.iter_rows(min_row=1, values_only=True):
    # 列Aに数値（日付シリアル値）がある場合
    if row[0] and isinstance(row[0], (int, float)):
        try:
            date_obj = datetime(1899, 12, 30) + timedelta(days=int(row[0]))
        except:
            continue
    # 列Aに日付オブジェクトがある場合
    elif isinstance(row[0], datetime):
        date_obj = row[0]
    else:
        continue
    
    # 2026年1月～9月のデータのみ抽出
    if date_obj.year != 2026 or date_obj.month < 1 or date_obj.month > 9:
        continue
    
    # 顧客名は列C (index 2)
    customer_name = str(row[2]).strip() if row[2] else ""
    if not customer_name or customer_name == "None":
        continue
    
    # 区分は列D (index 3)
    reservation_type = str(row[3]).strip() if row[3] else "一般"
    if reservation_type not in ["一般", "学生"]:
        reservation_type = "一般"
    
    # 単価は列E (index 4)
    try:
        unit_price = int(float(row[4])) if row[4] else 0
    except:
        unit_price = 0
    
    # 人数は列F (index 5)
    try:
        number_of_people = int(float(row[5])) if row[5] else 1
    except:
        number_of_people = 1
    
    # テニスコートは列G (index 6)
    try:
        tennis_court = int(float(row[6])) if row[6] else 0
    except:
        tennis_court = 0
    
    # 宴会場は列H (index 7)
    try:
        banquet_hall = int(float(row[7])) if row[7] else 0
    except:
        banquet_hall = 0
    
    # 合計金額は列J (index 9) または計算
    try:
        total_amount = int(float(row[9])) if row[9] else (unit_price * number_of_people + tennis_court + banquet_hall)
    except:
        total_amount = unit_price * number_of_people + tennis_court + banquet_hall
    
    reservation = {
        "date": date_obj.strftime('%Y-%m-%d'),
        "customer_name": customer_name,
        "type": reservation_type,
        "unit_price": unit_price,
        "number_of_people": number_of_people,
        "tennis_court": tennis_court,
        "banquet_hall": banquet_hall,
        "other": 0,
        "total_amount": total_amount,
        "rooms": []
    }
    
    reservations.append(reservation)

print(f"\n📊 投入対象データ件数: {len(reservations)}件")
print(f"📅 期間: {reservations[0]['date']} ～ {reservations[-1]['date']}")

# サンプルデータを表示
print("\n📋 サンプルデータ（最初の5件）:")
for i, r in enumerate(reservations[:5]):
    print(f"{i+1}. {r['date']} | {r['customer_name']} | 単価:{r['unit_price']} × {r['number_of_people']}人 + テニス:{r['tennis_court']} + 宴会:{r['banquet_hall']} = 合計:{r['total_amount']}")

# Supabaseに投入
headers["Prefer"] = "return=minimal"

success_count = 0
error_count = 0
error_details = []

for i, reservation in enumerate(reservations):
    try:
        response = requests.post(
            f"{SUPABASE_URL}/rest/v1/reservations",
            headers=headers,
            json=reservation
        )
        
        if response.status_code in [200, 201]:
            success_count += 1
            if (i + 1) % 50 == 0:
                print(f"✅ {i + 1}/{len(reservations)}件 処理完了")
        else:
            error_count += 1
            if error_count <= 5:
                error_details.append(f"({i + 1}件目) {response.status_code}: {response.text[:150]}")
    except Exception as e:
        error_count += 1
        if error_count <= 5:
            error_details.append(f"({i + 1}件目) Exception: {str(e)[:150]}")

print(f"\n🎉 再投入完了")
print(f"✅ 成功: {success_count}件")
print(f"❌ 失敗: {error_count}件")

if error_details:
    print("\n❌ エラー詳細（最初の5件）:")
    for detail in error_details:
        print(f"  {detail}")

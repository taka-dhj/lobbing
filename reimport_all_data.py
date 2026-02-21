import pandas as pd
import requests
import uuid
from datetime import datetime

SUPABASE_URL = "https://zcnkzjcsacurmsktyecc.supabase.co"
SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpjbmt6amNzYWN1cm1za3R5ZWNjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTI2OTMxNywiZXhwIjoyMDg2ODQ1MzE3fQ.spnQ_JntSBvqXXrVWVAAIY4x3travHaEwbUqoVf9p7k"

headers = {
    "apikey": SERVICE_ROLE_KEY,
    "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal"
}

def excel_date_to_string(excel_date):
    if pd.isna(excel_date):
        return None
    if isinstance(excel_date, str):
        return excel_date
    try:
        base_date = datetime(1899, 12, 30)
        delta = pd.Timedelta(days=excel_date)
        result = base_date + delta
        return result.strftime('%Y-%m-%d')
    except:
        return None

def extract_reservations(file_path, sheet_name, year_start, year_end):
    df = pd.read_excel(file_path, sheet_name=sheet_name, header=None)
    reservations = []
    
    for idx, row in df.iterrows():
        date_val = row[0]
        date_str = excel_date_to_string(date_val)
        
        if not date_str:
            continue
        
        # 日付フォーマットチェック
        try:
            year = int(date_str.split('-')[0])
        except (ValueError, IndexError):
            continue
        
        if year < year_start or year > year_end:
            continue
        
        customer_name = row[2] if pd.notna(row[2]) else ""
        category = row[3] if pd.notna(row[3]) else ""
        
        # 空データをスキップ
        if not customer_name or not category:
            continue
        
        try:
            unit_price = int(row[4]) if pd.notna(row[4]) else 0
            people = int(row[5]) if pd.notna(row[5]) else 0
            tennis = int(row[6]) if pd.notna(row[6]) else 0
            banquet = int(row[7]) if pd.notna(row[7]) else 0
            other = int(row[8]) if pd.notna(row[8]) else 0
        except (ValueError, TypeError):
            continue
        
        total = unit_price * people + tennis + banquet + other
        
        reservations.append({
            "id": str(uuid.uuid4()),
            "date": date_str,
            "customer_name": customer_name,
            "type": category,
            "unit_price": unit_price,
            "number_of_people": people,
            "tennis_court": tennis,
            "banquet_hall": banquet,
            "other": other,
            "total_amount": total
        })
    
    return reservations

print("📥 Excelファイルからデータを読み込み中...")

# 2023-2025年のデータ（1560件）
file1 = "/home/user/uploaded_files/売上予定表(2023-5年）.xlsx"
reservations_2023_2025 = extract_reservations(file1, "宿泊予定表（2026.2.1)", 2023, 2025)
print(f"  2023-2025年: {len(reservations_2023_2025)} 件")

# 2026年のデータ（216件、1-9月）
file2 = "/home/user/uploaded_files/売上予定表(2026年） (1).xlsx"
reservations_2026 = extract_reservations(file2, "宿泊予定表（2026.2.1)", 2026, 2026)
reservations_2026 = [r for r in reservations_2026 if int(r['date'].split('-')[1]) <= 9]
print(f"  2026年（1-9月）: {len(reservations_2026)} 件")

all_reservations = reservations_2023_2025 + reservations_2026
print(f"\n合計: {len(all_reservations)} 件")

# 年別集計
from collections import Counter
year_counts = Counter([r['date'][:4] for r in all_reservations])
for year in sorted(year_counts.keys()):
    print(f"  {year}年: {year_counts[year]} 件")

print("\n📤 Supabaseへデータを投入中...")

batch_size = 50
success_count = 0
fail_count = 0

for i in range(0, len(all_reservations), batch_size):
    batch = all_reservations[i:i + batch_size]
    response = requests.post(
        f"{SUPABASE_URL}/rest/v1/reservations",
        headers=headers,
        json=batch
    )
    
    if response.status_code in [200, 201]:
        success_count += len(batch)
        print(f"  進捗: {success_count}/{len(all_reservations)} 件")
    else:
        fail_count += len(batch)
        print(f"  ❌ エラー: {response.status_code} - {response.text[:100]}")

print(f"\n✅ 投入完了: {success_count} 件成功, {fail_count} 件失敗")

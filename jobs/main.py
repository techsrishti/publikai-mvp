import os
import uuid
import psycopg2
import requests
from datetime import datetime, timezone
from decimal import Decimal
from dotenv import load_dotenv


load_dotenv()
DB_URL = os.getenv("DATABASE_URL")
RAZORPAY_API_KEY = os.getenv("RAZORPAY_APIKEY")
RAZORPAY_API_SECRET = os.getenv("RAZORPAY_APISECRET")
RAZORPAY_SOURCE_FUND_ACCOUNT_NUMBER=os.getenv("RAZORPAY_SOURCE_FUND_ACCOUNT_NUMBER")

print(RAZORPAY_SOURCE_FUND_ACCOUNT_NUMBER, DB_URL, RAZORPAY_API_KEY, RAZORPAY_API_SECRET)

def generate_reference_id(creator_id):
    short_creator = creator_id[:8]  # Assuming cuid() or UUID is used
    return f"ref_{short_creator}_{uuid.uuid4().hex[:8]}"


def create_payout(creator_id, amount, fund_account_id, razorpayFaType):
    try:
        idempotency_key = str(uuid.uuid4())

        reference_id = generate_reference_id(creator_id)

        print("idempotency key", idempotency_key)

        print("payout for creator", creator_id, "with amount", amount, "and fund account id", fund_account_id, "and razorpay fa type", razorpayFaType)
        payload = {
        "account_number": RAZORPAY_SOURCE_FUND_ACCOUNT_NUMBER,
        "fund_account_id": fund_account_id,
        "amount": int(amount * 100),  
        "currency": "INR",
        "mode": "UPI" if razorpayFaType == "vpa" else "IMPS",
        "purpose": "payout",
        "queue_if_low_balance": True,
        "reference_id": reference_id,
        "narration": "Monthly Payout"
        }

        response = requests.post(
        "https://api.razorpay.com/v1/payouts",
        auth=(RAZORPAY_API_KEY, RAZORPAY_API_SECRET),
        json=payload,
        headers={"X-Payout-Idempotency": idempotency_key}
        )

        print("response", response.text)

        if response.status_code != 200:
            print(f"Failed to create payout for {creator_id}: {response.text}")
            return None

        data = response.json()
        return {
        "razorpay_payout_id": data["id"],
        "referenceNumber": data["reference_id"],
        "status": data["status"],
        "idempotencyKey": idempotency_key,
        }
    except Exception as e:
        print("error creating payout", e)
        return None

def run_payouts():
    conn = psycopg2.connect(DB_URL)
    cur = conn.cursor()

    cur.execute("""
        SELECT id, "razorpayFaId", "razorpayFaType", "outstandingAmount", "totalPaidAmount", "totalEarnedAmount"
        FROM "Creator"
        WHERE "outstandingAmount" >= 500
    """)
    creators = cur.fetchall()

    print("creators", creators[0])

    for creator_id, fa_id, razorpayFaType, outstandingAmount, totalPaidAmount, totalEarnedAmount in creators:
        print(f"Processing payout for {creator_id} - ₹{outstandingAmount}")

        payout = create_payout(creator_id, outstandingAmount, fa_id, razorpayFaType)
        if payout is None:
            continue

        try:
            cur.execute("""
            INSERT INTO "CreatorPayout" (
                id, "creatorId", "payoutDate", "paidAmount", 
                "razorpayPayoutId", "referenceNumber", "idempotencyKey", status
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            str(uuid.uuid4()),
            creator_id,
            datetime.now(timezone.utc),
            outstandingAmount,
            payout["razorpay_payout_id"],
            payout["referenceNumber"],
            payout["idempotencyKey"],
            payout["status"]
            ))
        except Exception as e:
            print("error inserting into CreatorPayout", e)
            continue

        if payout["status"] == "processed":
            try:
                cur.execute("""
                UPDATE "Creator"
                SET "totalPaidAmount" = COALESCE("totalPaidAmount", 0) + %s,
                "outstandingAmount" = COALESCE("outstandingAmount", 0) - %s
            WHERE id = %s
            """, (outstandingAmount, outstandingAmount, creator_id))
            except Exception as e:
                print("error updating creator", e)
                continue
        else:
            print("payout not processed", payout)
            continue

    conn.commit()
    cur.close()
    conn.close()
    print("✅ Monthly payouts complete.")

if __name__ == "__main__":
    run_payouts()

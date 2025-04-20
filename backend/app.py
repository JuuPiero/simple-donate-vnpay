from flask import Flask, request, redirect
from flask_cors import CORS
from urllib.parse import urlencode, quote_plus
import hashlib
import hmac
import datetime
import os

app = Flask(__name__)
CORS(app)
@app.route('/create_payment', methods=['POST'])
def create_payment():
    vnp_TmnCode = '1VYBIYQP'
    vnp_HashSecret = 'NOH6MBGNLQL9O9OMMFMZ2AX8NIEP50W1'
    vnp_Url = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html'
    vnp_Returnurl = request.form.get('return') 

    amount = int(request.form.get('amount')) * 25000 * 100
    vnp_TxnRef = datetime.datetime.now().strftime('%Y%m%d%H%M%S')
    vnp_CreateDate = datetime.datetime.now().strftime('%Y%m%d%H%M%S')

    inputData = {
        'vnp_Version': '2.1.0',
        'vnp_Command': 'pay',
        'vnp_TmnCode': vnp_TmnCode,
        'vnp_Amount': str(amount),
        'vnp_CurrCode': 'VND',
        'vnp_TxnRef': vnp_TxnRef,
        'vnp_OrderInfo': 'Donate',
        'vnp_OrderType': 'other',
        'vnp_Locale': 'vn',
        'vnp_ReturnUrl': vnp_Returnurl,
        'vnp_IpAddr': request.remote_addr,
        'vnp_CreateDate': vnp_CreateDate,
        'vnp_BankCode': request.form.get('bankcode')
    }

    sortedData = sorted(inputData.items())
    hashData = '&'.join([f"{quote_plus(k)}={quote_plus(str(v))}" for k, v in sortedData])
    query = urlencode(sortedData)

    secure_hash = hmac.new(vnp_HashSecret.encode(), hashData.encode(), hashlib.sha512).hexdigest()
    paymentUrl = f"{vnp_Url}?{query}&vnp_SecureHash={secure_hash}"

    return redirect(paymentUrl)
if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)
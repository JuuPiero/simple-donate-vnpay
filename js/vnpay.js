const VNP_URL="https://sandbox.vnpayment.vn/paymentv2/vpcpay.html"
const VNP_TMN_CODE="1VYBIYQP"
const VNP_HASH_SECRET="NOH6MBGNLQL9O9OMMFMZ2AX8NIEP50W1"

// https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=1806000&vnp_Command=pay&vnp_CreateDate=20210801153333&vnp_CurrCode=VND&vnp_IpAddr=127.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Thanh+toan+don+hang+%3A5&vnp_OrderType=other&vnp_ReturnUrl=https%3A%2F%2Fdomainmerchant.vn%2FReturnUrl&vnp_TmnCode=DEMOV210&vnp_TxnRef=5&vnp_Version=2.1.0&vnp_SecureHash=3e0d61a0c0534b2e36680b3f7277743e8784cc4e1d68fa7d276e79c23be7d6318d338b477910a27992f5057bb1582bd44bd82ae8009ffaf6d141219218625c42

// http://127.0.0.1:5500/donate.html?vnp_Amount=25000000&vnp_BankCode=NCB&vnp_BankTranNo=VNP14915252&vnp_CardType=ATM&vnp_OrderInfo=Thanh+toan+don+hang&vnp_PayDate=20250419142618&vnp_ResponseCode=00&vnp_TmnCode=1VYBIYQP&vnp_TransactionNo=14915252&vnp_TransactionStatus=00&vnp_TxnRef=gkrnyAZSz8pOq9m&vnp_SecureHash=7c653859671a636b02eb74417ca002b54d1e61c912337003db404f0f7d1546ba1fc5bf90748b24311b409403a7e19e39806b3341c12affb651505a88a61f2b0d


// Hàm tạo chuỗi ngẫu nhiên
function generateRandomString(length) {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
}

// Hàm tạo chuỗi thời gian định dạng YmdHis
function getCurrentDateTimeString() {
    const now = new Date();
    const pad = (n) => (n < 10 ? '0' + n : n);
    return now.getFullYear().toString() +
        pad(now.getMonth() + 1) +
        pad(now.getDate()) +
        pad(now.getHours()) +
        pad(now.getMinutes()) +
        pad(now.getSeconds());
}

const donateForm = document.querySelector('.donate-form')

donateForm.addEventListener('submit', async (e) => {
    e.preventDefault()
    const name = donateForm.querySelector('.name-input').value
    const email = donateForm.querySelector('.email-input').value
    const bankcode = donateForm.querySelector('.bank-input').value
    // Lấy radio button được chọn
    const selectedAmount = donateForm.querySelector('input[name="btnradio"]:checked');
    const amount = selectedAmount ? donateForm.querySelector(`label[for="${selectedAmount.id}"]`).textContent : null;

    // console.log("Name:", name);
    // console.log("Email:", email);
    // console.log("Bank Code:", bankcode);
    // console.log("Amount:", amount);
    await createPayment({name, email, bankcode, amount})
    // console.log(name, bankcode);
})

const urlParams = new URLSearchParams(window.location.search);
const responseCode = urlParams.get('vnp_ResponseCode');

// Định nghĩa thông báo tương ứng với từng mã lỗi
const responseMessages = {
    "00": "Giao dịch thành công",
    "07": "Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).",
    "09": "Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.",
    "10": "Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần",
    "11": "Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.",
    "12": "Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa.",
    "13": "Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP). Xin quý khách vui lòng thực hiện lại giao dịch.",
    "24": "Giao dịch không thành công do: Khách hàng hủy giao dịch",
    "51": "Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.",
    "65": "Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.",
    "75": "Ngân hàng thanh toán đang bảo trì.",
    "79": "Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định. Xin quý khách vui lòng thực hiện lại giao dịch",
    "99": "Các lỗi khác (lỗi còn lại, không có trong danh sách mã lỗi đã liệt kê)",
    "02": "Merchant không hợp lệ (kiểm tra lại vnp_TmnCode)",
    "03": "Dữ liệu gửi sang không đúng định dạng",
    "91": "Không tìm thấy giao dịch yêu cầu",
    "94": "Yêu cầu bị trùng lặp trong thời gian giới hạn của API (Giới hạn trong 5 phút)",
    "97": "Chữ ký không hợp lệ"
};

// Kiểm tra và hiển thị thông báo tương ứng
if (responseCode) {
    const message = responseMessages[responseCode] || "Mã lỗi không xác định";
    alert(message); // Hiển thị thông báo với mã lỗi
}



async function getPublicIP() {
    try {
      const res = await fetch('https://api.ipify.org?format=json');
      const data = await res.json();
      return data.ip;
    } catch (err) {
      console.error("Lỗi khi lấy IP:", err);
      return null;
    }
}

async function createPayment(data) {
    const vnp_TmnCode = '1VYBIYQP'; // Thay bằng mã thật hoặc lấy từ biến môi trường nếu có backend truyền xuống
    const vnp_Url = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html'; // URL cổng VNPAY
    const vnp_HashSecret = 'NOH6MBGNLQL9O9OMMFMZ2AX8NIEP50W1'; // Chỉ sử dụng được nếu có backend hỗ trợ

    const vnp_TxnRef = generateRandomString(15);
    const vnp_OrderInfo = 'Donate';
    const vnp_OrderType = 'other';
    const vnp_IpAddr = await getPublicIP(); 
    const vnp_Amount = data['amount'].replace('$', '') * 25000 * 100;
    const vnp_Locale = 'vn';
    const vnp_BankCode = data['bankcode'];
    const vnp_Returnurl = 'https://yourdomain.com/checkout/vnpay/return'; // Thay bằng URL thật

    const inputData = {
        vnp_Version: '2.1.0',
        vnp_TmnCode,
        vnp_Amount,
        vnp_Command: 'pay',
        vnp_CreateDate: getCurrentDateTimeString(),
        vnp_CurrCode: 'VND',
        vnp_IpAddr,
        vnp_Locale,
        vnp_OrderInfo: 'Thanh toan don hang',
        vnp_BankCode,
        vnp_OrderType,
        vnp_ReturnUrl: window.location.href,
        vnp_TxnRef

    };
    

    // if (vnp_BankCode && vnp_BankCode !== '') {
    //     inputData.vnp_BankCode = vnp_BankCode;
    // }

    // Sắp xếp theo key alphabet
    const sortedKeys = Object.keys(inputData).sort();

    let hashdata = '';
    let query = '';

    sortedKeys.forEach((key, index) => {
        const value = inputData[key];
        const encodedKey = phpUrlEncode(key);
        const encodedValue = phpUrlEncode(value);

        hashdata += (index === 0 ? '' : '&') + encodedKey + '=' + encodedValue;
        query += encodedKey + '=' + encodedValue + '&';
    });

   
    const vnp_SecureHash = CryptoJS.HmacSHA512(hashdata, vnp_HashSecret).toString(CryptoJS.enc.Hex);
    query += 'vnp_SecureHash=' + vnp_SecureHash;

    // console.log(vnp_SecureHash);
    // console.log(query);
    
    // Chuyển hướng
    window.location.href = vnp_Url + '?' + query;
}

function phpUrlEncode(str) {
    return encodeURIComponent(str)
        .replace(/%20/g, '+')   // PHP urlencode dùng + thay vì %20
        .replace(/!/g, '%21')
        .replace(/'/g, '%27')
        .replace(/\(/g, '%28')
        .replace(/\)/g, '%29')
        .replace(/\*/g, '%2A');
}

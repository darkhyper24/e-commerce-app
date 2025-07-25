const axios = require('axios');
const crypto = require('crypto');

class PaymobService {
  constructor() {
    this.apiKey = process.env.apiKey;
    this.secretKey = process.env.secretKey;
    this.publicKey = process.env.publicKey;
    this.baseURL = process.env.baseURL||'https://accept.paymob.com/api';
    
    // Mobile Wallet integration ID
    this.integrationId = process.env.PAYMOB_INTEGRATION_ID || '5211141';
    this.paymentType = 'mobile_wallet';
    
    console.log('🔧 PaymobService initialized for Mobile Wallet API');
    console.log('📱 Integration ID:', this.integrationId);
  }

  // Step 1: Get authentication token
  async getAuthToken() {
    try {
      console.log('🔄 Getting Paymob auth token...');
      const response = await axios.post(`${this.baseURL}/auth/tokens`, {
        api_key: this.apiKey
      });
      console.log('✅ Auth token received');
      return response.data.token;
    } catch (error) {
      console.error('❌ Error getting auth token:', error.response?.data || error.message);
      throw new Error('Failed to authenticate with Paymob');
    }
  }

  // Step 2: Create order on Paymob
  async createOrder(authToken, orderData) {
    try {
      console.log('🔄 Creating Paymob order for Mobile Wallet...');
      console.log('📱 Order amount:', orderData.totalAmount, 'EGP');
      
      const response = await axios.post(`${this.baseURL}/ecommerce/orders`, {
        auth_token: authToken,
        delivery_needed: false,
        amount_cents: Math.round(orderData.totalAmount * 100),
        currency: 'EGP',
        items: orderData.items.map(item => ({
          name: item.name,
          amount_cents: Math.round(item.price * 100),
          description: item.description || '',
          quantity: item.quantity
        }))
      });
      
      console.log('✅ Paymob order created:', response.data.id);
      return response.data;
    } catch (error) {
      console.error('❌ Error creating Paymob order:', error.response?.data || error.message);
      throw new Error('Failed to create order with Paymob');
    }
  }

  // Step 3: Get payment key for Mobile Wallet
  async getPaymentKey(authToken, paymobOrderId, orderData, userInfo) {
    try {
      console.log('🔄 Getting payment key for Mobile Wallet...');
      console.log('📱 Integration ID:', this.integrationId);
      console.log('📱 Order ID:', paymobOrderId);
      
      const billingData = {
        apartment: "NA",
        email: userInfo.email || "test@example.com",
        floor: "NA",
        first_name: userInfo.firstName || "John",
        street: "NA",
        building: "NA",
        phone_number: userInfo.phone || "+201000000000",
        shipping_method: "NA",
        postal_code: "NA",
        city: "NA",
        country: "EG",
        last_name: userInfo.lastName || "Doe",
        state: "NA"
      };

      const paymentData = {
        auth_token: authToken,
        amount_cents: Math.round(orderData.totalAmount * 100),
        expiration: 3600,
        order_id: paymobOrderId,
        billing_data: billingData,
        currency: "EGP",
        integration_id: parseInt(this.integrationId)
      };

      console.log('📤 Sending payment key request for Mobile Wallet...');

      const response = await axios.post(`${this.baseURL}/acceptance/payment_keys`, paymentData);

      console.log('✅ Mobile Wallet payment key received');
      return response.data.token;
    } catch (error) {
      console.error('❌ Error getting payment key:', error.response?.data || error.message);
      throw new Error('Failed to get payment key from Paymob');
    }
  }

  // Step 4: Direct Mobile Wallet Payment API
  async createMobileWalletPayment(paymentKey, walletNumber) {
    try {
      console.log('📱 Creating direct mobile wallet payment...');
      console.log('📱 Wallet number:', walletNumber);
      console.log('🔑 Payment key:', paymentKey.substring(0, 20) + '...');

      const response = await axios.post(`${this.baseURL}/acceptance/payments/pay`, {
        source: {
          identifier: walletNumber, // User's mobile wallet number (e.g., 01012345678)
          subtype: "WALLET"
        },
        payment_token: paymentKey
      });

      console.log('✅ Mobile wallet payment initiated');
      console.log('📱 Payment ID:', response.data.id);
      console.log('📱 Payment status:', response.data.success);
      
      return response.data;
    } catch (error) {
      console.error('❌ Error creating mobile wallet payment:', error.response?.data || error.message);
      throw new Error('Failed to create mobile wallet payment');
    }
  }

  // Generate payment redirect URL for Mobile Wallet
  generatePaymentUrl(paymentKey, orderData) {
    // For direct Mobile Wallet, return a URL to your custom payment page
    const baseUrl = process.env.CLIENT_URL || 'http://localhost:8080';
    return `${baseUrl}/mobile-wallet-payment?token=${paymentKey}&amount=${orderData.totalAmount}`;
  }

  // Alternative: Generate iframe URL if needed
  generateIframeUrl(paymentKey) {
    // Try different iframe IDs for Mobile Wallet
    const iframeIds = ['864097', '864098', '864099', '5489555'];
    const iframeId = process.env.PAYMOB_IFRAME_ID || iframeIds[0];
    
    console.log('🔗 Using Mobile Wallet iframe ID:', iframeId);
    return `https://accept.paymob.com/api/acceptance/iframes/${iframeId}?payment_token=${paymentKey}`;
  }

  // Verify webhook signature
  verifyWebhookSignature(data, signature) {
    try {
      const sortedData = this.sortObjectKeys(data);
      const concatenatedString = this.concatenateValues(sortedData);
      const hash = crypto.createHmac('sha512', this.secretKey).update(concatenatedString).digest('hex');
      return hash === signature;
    } catch (error) {
      console.error('Error verifying webhook signature:', error);
      return false;
    }
  }

  sortObjectKeys(obj) {
    const sorted = {};
    Object.keys(obj).sort().forEach(key => {
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        sorted[key] = this.sortObjectKeys(obj[key]);
      } else {
        sorted[key] = obj[key];
      }
    });
    return sorted;
  }

  concatenateValues(obj) {
    let result = '';
    for (const key in obj) {
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        result += this.concatenateValues(obj[key]);
      } else {
        result += obj[key];
      }
    }
    return result;
  }
}

module.exports = new PaymobService();
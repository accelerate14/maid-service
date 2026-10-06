const razorpay = require('razorpay');
const crypto = require('crypto');
const db = require('../db');

let instance = new razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

const createOrder = async (req, res) => {
    try {
        const { service_id, sub_service_ids } = req.body;
        const [subServices] = await db.query(
            'SELECT id, price FROM sub_services WHERE id IN (?) AND service_id = ?',
            [sub_service_ids, service_id]
        );

        if (subServices.length !== sub_service_ids.length) {
            return res.status(400).json({ error: 'Invalid sub-services selected' });
        }

        const amount = subServices.reduce(
            (sum, subService) => sum + Math.round(Number(subService.price) * 100),
            0
        );
        if (amount <= 0) {
            return res.status(400).json({ error: 'Order amount must be greater than zero' });
        }

        const order = await instance.orders.create({
            amount,
            currency: 'INR',
            receipt: `receipt_${Date.now()}`,
        });
        res.json({ ...order, key: process.env.RAZORPAY_KEY_ID });
    } catch (error) {
        console.error('[OrderController Error (createOrder)]:', error);
        res.status(500).json({ error: error.message });
    }
};

const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ success: false, error: 'Missing payment details' });
        }

        const generated_signature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(razorpay_order_id + "|" + razorpay_payment_id).digest('hex');

        const isSignatureValid = crypto.timingSafeEqual(
            Buffer.from(generated_signature, 'utf-8'),
            Buffer.from(razorpay_signature, 'utf-8')
        );

        if (isSignatureValid) {
            res.json({ success: true });
        } else {
            res.status(400).json({ success: false, error: 'Invalid signature' });
        }
    } catch (error) {
        console.error('[OrderController Error (verifyPayment)]:', error);
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    createOrder,
    verifyPayment
};
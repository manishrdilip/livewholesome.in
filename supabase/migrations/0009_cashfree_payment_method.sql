-- Adds CASHFREE as a valid payment_method value. The enum previously only
-- had PENDING_GATEWAY / UPI_MANUAL / RAZORPAY (Razorpay was the gateway
-- originally scaffolded for); switching to Cashfree needed its own label
-- rather than reusing RAZORPAY, which would misrecord which gateway
-- actually processed the payment.

alter type payment_method add value if not exists 'CASHFREE';

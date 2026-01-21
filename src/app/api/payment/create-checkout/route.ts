// src/app/api/payment/create-checkout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover', // Սա պետք է լինի string
});

export async function POST(request: NextRequest) {
  try {
    const { quoteId, policyId, amount, policyNumber } = await request.json();

    if (!amount || !quoteId || !policyId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Calculate total amount with fees
    const serviceFee = 99;
    const taxes = amount * 0.08;
    const totalAmount = Math.round((amount + serviceFee + taxes) * 100); // Convert to cents

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Cargo Insurance Policy - ${policyNumber}`,
              description: `Insurance coverage for shipment ${policyNumber}`,
            },
            unit_amount: totalAmount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}&quoteId=${quoteId}&policyId=${policyId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment?quoteId=${quoteId}&amount=${amount}`,
      metadata: {
        quoteId,
        policyId,
        policyNumber,
        amount: amount.toString(),
      },
    });

    return NextResponse.json({ url: session.url });

  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create payment session' },
      { status: 500 }
    );
  }
}
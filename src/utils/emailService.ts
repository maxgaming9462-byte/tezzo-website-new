import { Booking } from '../types';

export interface EmailReceipt {
  success: boolean;
  messageId: string;
  recipient: string;
  subject: string;
  sentAt: string;
  bodyPreview: string;
}

/**
 * Simulates sending a confirmation email to the user for a booked ride.
 */
export async function sendBookingConfirmationEmail(booking: Booking): Promise<EmailReceipt> {
  const { ride, passengerName, passengerEmail, seatsBooked, totalPrice } = booking;

  const subject = `Tezzo Carpool Confirmation: ${ride.origin} to ${ride.destination}`;
  const sentAt = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const bodyPreview = `Hi ${passengerName}, your booking for ${seatsBooked} seat(s) on ${ride.date} with ${ride.driver.name} is confirmed! Total paid: ₹${totalPrice}. Pickup: ${ride.originDetails || ride.origin}.`;

  // Simulate network dispatch log
  console.log('--------------------------------------------------');
  console.log(`[MOCK EMAIL SERVICE] Sending email to: ${passengerEmail}`);
  console.log(`Subject: ${subject}`);
  console.log(`Body: ${bodyPreview}`);
  console.log('--------------------------------------------------');

  // Return simulated result
  return {
    success: true,
    messageId: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    recipient: passengerEmail,
    subject,
    sentAt,
    bodyPreview,
  };
}

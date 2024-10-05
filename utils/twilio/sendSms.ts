// project/utils/twilio/sendSms.ts
// import twilio from "twilio";

// const accountSid: string = process.env.NEXT_PUBLIC_TWILIO_ACCOUNT_SID || ""; // Your Account SID from www.twilio.com/console
const accountSid: string = "AC2a0d374727873047997f6877f9ca36f1"; // Your Account SID from www.twilio.com/console
// const authToken: string = process.env.NEXT_PUBLIC_TWILIO_AUTH_TOKEN || ""; // Your Auth Token from www.twilio.com/console
const authToken: string = "3fcf50137a96513199798347b98ac418"; // Your Auth Token from www.twilio.com/console
const twilioPhoneNumber: string = "+16072696940"; // Your Twilio phone number

// Create a Twilio client
const client = require("twilio")(accountSid, authToken);

// Removed createMessage function as it is not used

/**
 * Sends an SMS message using Twilio.
 * @param {string} to - The recipient's phone number in E.164 format.
 * @param {string} message - The message to be sent.
 */
export const sendSms = async (to: string, message: string): Promise<void> => {
  try {
    // Validate phone number format (optional but recommended)
    if (!/^\+\d{1,15}$/.test(to)) {
      throw new Error("Invalid phone number format. Please use E.164 format.");
    }

    // Send the SMS message
    const messageResponse = await client.messages.create({
      body: message,
      to: to, // User's phone number
      from: twilioPhoneNumber, // Your Twilio phone number
    });

    console.log("Message sent successfully:", messageResponse.sid);
  } catch (error) {
    console.error(
      "Error sending message:",
      error instanceof Error ? error.message : error
    );
  }
};

// Example usage (uncomment to use)
sendSms("+16072696940", "Hello from Twilio!");

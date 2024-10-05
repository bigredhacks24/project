const twilio = require("twilio"); // Or, for ESM: import twilio from "twilio";

// Find your Account SID and Auth Token at twilio.com/console
// and set the environment variables. See http://twil.io/secure
// const accountSid = process.env.NEXT_PUBLIC_TWILIO_ACCOUNT_SID;
const accountSid = "AC0aa8b6786ecc08e150cd8c43293a365d";
// const authToken = process.env.NEXT_PUBLIC_TWILIO_AUTH_TOKEN;
const authToken = "0240f5f798a007f78c8eadd879bc8bc7";
console.log("Account SID:", accountSid);
console.log("Auth Token:", authToken);
const client = twilio(accountSid, authToken);

async function createMessage() {
  const message = await client.messages.create({
    body: "Hi",
    from: "+18447418811",
    to: "+16072696940",
  });

  console.log(message.body);
}

createMessage();

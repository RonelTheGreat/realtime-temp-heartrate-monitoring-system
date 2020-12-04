const twilio = require("twilio")(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const notifyContacts = async (message) => {
  const verifiedContacts = await twilio.outgoingCallerIds.list();

  Promise.all(
    verifiedContacts.map((contact) => {
      return twilio.messages.create({
        to: contact.phoneNumber,
        from: process.env.TWILIO_MESSAGE_SERVICE_SID,
        body: message
      });
    })
  )
    .then(() => {
      console.log("Messages sent!");
    })
    .catch((err) => console.error(err));
};

module.exports = notifyContacts;

const dateFormat = require("dateformat");

module.exports = function bookRideByUser(ride, formValues) {
  const subject = "Summary of your booking | Ride.CR";
  const text = `You have made a booking request for ${
    formValues.seatsNeeded
  } seats on the ride from ${ride.Driver.User.firstName} from ${
    ride.cityDestination
  } to ${ride.cityOrigin} on the ${dateFormat(
    ride.dateTime,
    "dd/mm/yyyy"
  )} at ${dateFormat(
    ride.dateTime,
    "hh:mm TT"
  )}. You can check the ride again here: ${
    process.env.REACT_APP_URL_CLIENT
  }/ride/${ride.id}`;
  const html = `<div>
  <p>The booking request has been sent to ${ride.Driver.User.firstName}</p>
  <p>Now you just have to wait for a reply if the booking is confirmed</p>
  <div>
    <h3>Booking details</h3>
    <p>${formValues.seatsNeeded} seats on the ride by ${
    ride.Driver.User.firstName
  } from ${ride.cityDestination} to ${ride.cityOrigin} on the ${dateFormat(
    ride.dateTime,
    "dd/mm/yyyy"
  )} at ${dateFormat(ride.dateTime, "hh:mm TT")}</p>
  </div>
  `;

  return { subject, text, html };
};

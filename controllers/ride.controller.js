const db = require("../models");
const Ride = db.Ride;
const RideFeedback = db.RideFeedback;
const RideStatus = db.RideStatus;
const User = db.User;
const Driver = db.Driver;
const Booking = db.Booking;
const BookingStatus = db.BookingStatus;
const Op = db.Sequelize.Op;
require("dotenv").config;

const { findEmails, findPhones, findLinks } = require("./functions/functions");
const { convert } = require("html-to-text");

const errorMessage = { message: "A problem occured with this request" };

module.exports = {
  getDriverRides(req, res) {
    return Ride.findAll({
      where: {
        DriverId: req.query.userId,
      },
      include: [
        {
          model: RideStatus,
          attributes: {
            exclude: ["RideStatusId"],
          },
        },
      ],
    })
      .then((response) => {
        // console.log(response);
        res.status(200).json(response);
      })
      .catch((error) => {
        // console.log(error);
        res.status(400).json(errorMessage);
      });
  },

  addRide(req, res) {
    const { comment } = req.body.formValues;

    linksFound = findLinks(comment);
    phonesFound = findPhones(comment);
    emailsFound = findEmails(comment);
    messageConverted = convert(comment);

    if (linksFound && linksFound.length > 0) {
      res.status(401).json({
        message: "Do not include links in your comment",
      });
    } else if (phonesFound.length > 0) {
      res.status(401).json({
        message: "Do not include phone numbers in your comment",
      });
    } else if (emailsFound && emailsFound.length > 0) {
      res.status(401).json({
        message: "Do not include emails in your comment",
      });
    } else {
      return Ride.create({
        DriverId: req.body.userId,
        cityOrigin: req.body.formValues.cityOrigin,
        provinceOrigin: req.body.formValues.provinceOrigin,
        cityDestination: req.body.formValues.cityDestination,
        provinceDestination: req.body.formValues.provinceDestination,
        dateTime: req.body.formValues.dateTime,
        seatsAvailable: req.body.formValues.seatsAvailable,
        seatsLeft: req.body.formValues.seatsAvailable,
        comment,
      })
        .then((response) => {
          // console.log(response);
          res
            .status(201)
            .json({ message: "You ride has been successfully added" });
        })
        .catch((error) => {
          console.log(error);
          res.status(400).json(errorMessage);
        });
    }
  },

  getRide(req, res) {
    return Ride.findOne({
      where: {
        id: req.params.rideId,
      },
      order: [["dateTime", "ASC"]],
      include: [
        {
          model: Driver,
          include: [
            {
              model: User,
              attributes: {
                exclude: [
                  "biography",
                  "password",
                  "phoneNumber",
                  "createdAt",
                  "updatedAt",
                ],
              },
            },
          ],
        },
        {
          model: RideStatus,
        },
      ],
    })
      .then((response) => {
        // console.log(response);
        res.status(200).json(response);
      })
      .catch((error) => {
        // console.log(error);
        res.status(400).json(errorMessage);
      });
  },

  getBooking(req, res) {
    return Booking.findOne({
      where: {
        id: req.params.bookingId,
      },
      order: [["createdAt", "ASC"]],
      include: [
        {
          model: User,
          attributes: {
            exclude: [
              "biography",
              "password",
              "phoneNumber",
              "createdAt",
              "updatedAt",
            ],
          },
        },
        {
          model: Ride,
          include: [
            {
              model: Driver,
              include: [
                {
                  model: User,
                  attributes: {
                    exclude: [
                      "email",
                      "biography",
                      "password",
                      "phoneNumber",
                      "createdAt",
                      "updatedAt",
                    ],
                  },
                },
              ],
            },
            {
              model: RideStatus,
            },
          ],
        },
        {
          model: BookingStatus,
        },
      ],
    })
      .then((response) => {
        // console.log(response);
        res.status(200).json(response);
      })
      .catch((error) => {
        // console.log(error);
        res.status(400).json(errorMessage);
      });
  },

  getDriverBookings(req, res) {
    return Booking.findAll({
      where: {
        DriverId: req.query.userId,
      },
      include: [
        {
          model: User,
          attributes: {
            exclude: [
              "email",
              "biography",
              "password",
              "phoneNumber",
              "createdAt",
              "updatedAt",
            ],
          },
        },
        {
          model: Ride,
        },
        {
          model: BookingStatus,
        },
      ],
    })
      .then((response) => {
        // console.log(response);
        res.status(200).json(response);
      })
      .catch((error) => {
        // console.log(error);
        res.status(400).json(errorMessage);
      });
  },

  getAllRides(req, res) {
    return Ride.findAll({
      where: {
        seatsLeft: {
          [Op.gt]: 0,
        },
        dateTime: {
          [Op.gt]: new Date(),
        },
      },
      order: [["dateTime", "ASC"]],
      include: [
        {
          model: Driver,
          include: [
            {
              model: User,
              attributes: {
                exclude: [
                  "biography",
                  "password",
                  "phoneNumber",
                  "createdAt",
                  "updatedAt",
                ],
              },
            },
          ],
        },
      ],
    })
      .then((response) => {
        // console.log(response);
        res.status(200).json(response);
      })
      .catch((error) => {
        console.log(error);
        res.status(400).json(errorMessage);
      });
  },

  bookRide(req, res) {
    if (req.body.formValues.seatsNeeded === 0) {
      res.status(400).json({ message: "How many seats do you need?" });
    } else {
      return Booking.create({
        UserId: req.body.userId,
        RideId: req.body.rideId,
        DriverId: req.body.driverId,
        seatsBooked: req.body.formValues.seatsNeeded,
      })
        .then((response) => {
          // console.log(response);
          res
            .status(201)
            .json({ message: "Your booking has been submitted to the driver" });
        })
        .catch((error) => {
          // console.log(error);
          res.status(400).json(errorMessage);
        });
    }
  },

  driverResponseBooking(req, res) {
    const { comment, newStatus, bookingId, newSeatsAvailable, rideId } =
      req.body.formValues;

    linksFound = findLinks(comment);
    phonesFound = findPhones(comment);
    emailsFound = findEmails(comment);
    messageConverted = convert(comment);

    if (linksFound && linksFound.length > 0) {
      res.status(401).json({
        message: "Do not include links in your comment",
      });
    } else if (phonesFound.length > 0) {
      res.status(401).json({
        message: "Do not include phone numbers in your comment",
      });
    } else if (emailsFound && emailsFound.length > 0) {
      res.status(401).json({
        message: "Do not include emails in your comment",
      });
    } else {
      // if booking accepted by driver
      if (newStatus === 3) {
        return Booking.update(
          {
            commentDriver: comment,
            BookingStatusId: newStatus,
          },
          {
            where: {
              id: bookingId,
            },
          }
        ).then((response) => {
          return Ride.update(
            {
              seatsLeft: newSeatsAvailable,
            },
            {
              where: {
                id: rideId,
              },
            }
          )
            .then((response) => {
              // console.log(response);

              res
                .status(200)
                .send({
                  message: "You have accepted the booking",
                  newStatus,
                })
                .catch((error) => {
                  // console.log(error);
                  res.status(400).json(error);
                });
            })
            .catch((error) => {
              // console.log(error);
              res.status(400).json(error);
            });
        });
      }

      //if booking refused by driver
      if (newStatus === 4) {
        return Booking.update(
          {
            commentDriver: comment,
            BookingStatusId: newStatus,
          },
          {
            where: {
              id: bookingId,
            },
          }
        )
          .then((response) => {
            // console.log(response);
            res
              .status(200)
              .send({ message: "You have refused this booking", newStatus });
          })
          .catch((error) => {
            // console.log(error);
            res.status(400).json(error);
          });
      }
    }
  },

  getUserBookingRide(req, res) {
    return Booking.findAll({
      where: {
        UserId: req.query.userId,
        RideId: req.query.rideId,
      },
      include: [
        {
          model: BookingStatus,
        },
      ],
    })
      .then((response) => {
        // console.log(response);
        res.status(200).json(response);
      })
      .catch((error) => {
        // console.log(error);
        res.status(400).json(errorMessage);
      });
  },

  getDriverBookingRide(req, res) {
    return Booking.findAll({
      where: {
        DriverId: req.query.driverId,
        RideId: req.query.rideId,
      },
      order: [["createdAt", "ASC"]],
      include: [
        {
          model: BookingStatus,
        },
        {
          model: Ride,
          include: [
            {
              model: Driver,
              include: [
                {
                  model: User,
                  attributes: {
                    exclude: [
                      "lastName",
                      "email",
                      "biography",
                      "password",
                      "phoneNumber",
                      "createdAt",
                      "updatedAt",
                    ],
                  },
                },
              ],
            },
          ],
        },
        {
          model: User,
          attributes: {
            exclude: [
              "lastName",
              "email",
              "biography",
              "password",
              "phoneNumber",
              "createdAt",
              "updatedAt",
            ],
          },
        },
      ],
    })
      .then((response) => {
        // console.log(response);
        res.status(200).json(response);
      })
      .catch((error) => {
        // console.log(error);
        res.status(400).json(errorMessage);
      });
  },

  getDriverNewRidesRequests(req, res) {
    return Booking.findAndCountAll({
      where: {
        BookingStatusId: 1,
        DriverId: req.query.driverId,
      },
      order: [["createdAt", "ASC"]],
      attributes: {
        exclude: [
          "RideId",
          "UserId",
          "commentPassenger",
          "commentDriver",
          "updatedAt",
          "BookingStatusId",
          // "id",
          // "seatsBooked",
          // "createdAt",
        ],
      },
      include: [
        {
          model: Ride,
          where: {
            DriverId: req.query.driverId,
            seatsLeft: {
              [Op.gt]: 0,
            },
            dateTime: {
              [Op.gt]: new Date(),
            },
          },
          attributes: {
            exclude: [
              "DriverId",
              "comment",
              "RideStatusId",
              "createdAt",
              "updatedAt",
              // "id",
              // "cityDestination",
              // "cityOrigin",
              // "dateTime",
              // "provinceDestination",
              // "provinceOrigin",
              // "seatsAvailable",
              // "seatsLeft",
            ],
          },
        },
        {
          model: User,
          attributes: {
            exclude: [
              "email",
              "biography",
              "password",
              "phoneNumber",
              "createdAt",
              "updatedAt",
            ],
          },
        },
      ],
    })
      .then((response) => {
        // console.log(response);
        res.status(200).json(response);
      })
      .catch((error) => {
        // console.log(error);
        res.status(400).json(errorMessage);
      });
  },

  getPassengerBookingsResponses(req, res) {
    return Booking.findAndCountAll({
      where: {
        UserId: req.query.userId,
        [Op.or]: [{ BookingStatusId: 3 }, { BookingStatusId: 4 }],
      },
      order: [["createdAt", "ASC"]],
      attributes: {
        exclude: [
          "RideId",
          "UserId",
          "commentPassenger",
          "commentDriver",
          "updatedAt",
          "BookingStatusId",
          // "id",
          // "seatsBooked",
          // "createdAt",
        ],
      },
      include: [
        {
          model: Ride,
          where: {
            dateTime: {
              [Op.gt]: new Date(),
            },
          },
          attributes: {
            exclude: [
              "DriverId",
              "comment",
              "RideStatusId",
              "createdAt",
              "updatedAt",
              // "id",
              // "cityDestination",
              // "cityOrigin",
              // "dateTime",
              // "provinceDestination",
              // "provinceOrigin",
              // "seatsAvailable",
              // "seatsLeft",
            ],
          },
          include: [
            {
              model: Driver,
              include: [
                {
                  model: User,
                  attributes: {
                    exclude: [
                      "email",
                      "biography",
                      "password",
                      "phoneNumber",
                      "createdAt",
                      "updatedAt",
                    ],
                  },
                },
              ],
            },
          ],
        },
        {
          model: BookingStatus,
        },
      ],
    })
      .then((response) => {
        // console.log(response);
        res.status(200).json(response);
      })
      .catch((error) => {
        // console.log(error);
        res.status(400).json(errorMessage);
      });
  },

  getUserBookings(req, res) {
    return Booking.findAll({
      where: {
        UserId: req.query.userId,
      },
      order: [["BookingStatusId", "ASC"]],
      include: [
        {
          model: Ride,
          include: [
            {
              model: Driver,
              include: [
                {
                  model: User,
                  attributes: {
                    exclude: [
                      "email",
                      "biography",
                      "password",
                      "phoneNumber",
                      "createdAt",
                      "updatedAt",
                    ],
                  },
                },
              ],
            },
          ],
        },
        {
          model: User,
        },
        {
          model: BookingStatus,
        },
      ],
    })
      .then((response) => {
        // console.log(response);
        res.status(200).json(response);
      })
      .catch((error) => {
        // console.log(error);
        res.status(400).json(errorMessage);
      });
  },

  getPassengers(req, res) {
    return Booking.findAll({
      where: {
        RideId: req.query.rideId,
        BookingStatusId: {
          [Op.eq]: 3,
        },
      },
      order: [["createdAt", "ASC"]],
      include: [
        {
          model: User,
          attributes: {
            exclude: ["password", "createdAt", "updatedAt"],
          },
        },
        {
          model: Ride,
        },
      ],
    })
      .then((response) => {
        // console.log(response);
        res.status(200).json(response);
      })
      .catch((error) => {
        // console.log(error);
        res.status(400).json(errorMessage);
      });
  },

  getRidesToConfirm(req, res) {
    const { userId } = req.query;
    let ridesToFeedback = [];

    (async function () {
      let bookings = await Booking.findAll({
        where: {
          [Op.or]: {
            UserId: userId,
            DriverId: userId,
          },
          BookingStatusId: 3, // accepted
        },
      });

      if (bookings.length) {
        await Promise.all(
          bookings.map((booking) => {
            return Ride.findOne({
              where: {
                id: booking.RideId,
                RideStatusId: 3, // done
              },
              include: [
                {
                  model: Booking,
                  include: [
                    {
                      model: User,
                      attributes: {
                        exclude: [
                          "biography",
                          "password",
                          "phoneNumber",
                          "createdAt",
                          "updatedAt",
                        ],
                      },
                    },
                  ],
                },
                {
                  model: Driver,
                  include: [
                    {
                      model: User,
                      attributes: {
                        exclude: [
                          "biography",
                          "password",
                          "phoneNumber",
                          "createdAt",
                          "updatedAt",
                        ],
                      },
                    },
                  ],
                },
              ],
            }).then((ride) => {
              // If the ride is done
              if (ride) {
                // A feedback need to be given
                return RideFeedback.findOne({
                  where: {
                    UserId: userId,
                    RideId: ride.id,
                    BookingId: booking.id,
                  },
                }).then((feedback) => {
                  if (!feedback) {
                    // Feedback missing
                    ridesToFeedback.push(ride);
                  }
                });
              }
            });
          })
        ).catch((error) => res.status(400).json([]));

        return res.status(200).json(ridesToFeedback);
      } else {
        console.log("No bookings");
        return res.status(200).json(ridesToFeedback);
      }
    })();
  },

  confirmRide(req, res) {
    const { ride, userId, isRideHappened } = req.body;

    return RideFeedback.create({
      UserId: userId,
      RideId: ride.id,
      BookingId: ride.Booking.id,
      DriverId: ride.DriverId,
      rideHappened: isRideHappened,
    })
      .then((response) => {
        // console.log(response);
        res.status(201).json({
          message: "Thank you for submitting your answer",
          flag: "SUCCESS",
        });
      })
      .catch((error) => {
        // console.log(error);
        res
          .status(400)
          .json({ message: "We couldn't confirm the ride", flag: "ERROR" });
      });
  },
};

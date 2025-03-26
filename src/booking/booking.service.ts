/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable no-console */
import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import moment from "moment";
import { Repository } from "typeorm";
import { CreateBookingDto } from "./dto/create-booking.dto";
import { UpdateBookingDto } from "./dto/update-booking.dto";
import { PaymentStatus, VerifyPayment } from "./dto/verify-payment.dto";
import { Booking, BookingStatus } from "./entities/booking.entity";
import { ResponseHandler } from "@/common/utils/response-handler.utils";
import { FlightClassCategories } from "@/flights/entities/flight-class.entity";
import { Flight } from "@/flights/entities/flight.entity";

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Flight)
    private flightRepository: Repository<Flight>,
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    @InjectRepository(FlightClassCategories)
    private flightClassRepository: Repository<FlightClassCategories>
  ) {}
  async create(createBookingDto: CreateBookingDto) {
    const { userId, flightId, flightClass, passengers } = createBookingDto;
    console.log("createBookingDto", createBookingDto);

    // first we have to check if there are any available seats for the flight
    const checkFlight = await this.flightRepository.findOne({
      where: { id: flightId },
      relations: ["flightClassCategories"],
    });

    console.log(checkFlight);

    if (!checkFlight) throw new NotFoundException("Flight not found");

    const checkAvailableClass = checkFlight.flightClassCategories.some(
      (catogory) => catogory.flightClass === flightClass
    );

    if (!checkAvailableClass)
      throw new NotFoundException("Flight class not available");

    const checkAvailableSeats = checkFlight.flightClassCategories.some(
      (catagory) =>
        catagory.flightClass == flightClass &&
        catagory.remainingSeats >= passengers
    );

    if (!checkAvailableSeats) throw new NotFoundException("No available seats");

    // // then we have to check for remaining seats
    // checkFlight.flightClassCategories.map((flightClassCategory) => {
    //   if (flightClassCategory.flightClass == flightClass) {
    //     if (flightClassCategory.remainingSeats < passengers) {
    //       throw new NotFoundException("No available seats");
    //     }
    //   }
    // });

    // if there are available seats, we have to update the remaining seats

    let objToChange: FlightClassCategories | null = null;

    checkFlight.flightClassCategories.map((flightClassCategory) => {
      if (flightClassCategory.flightClass === flightClass) {
        console.log("remaining seats", flightClassCategory.remainingSeats);
        flightClassCategory.remainingSeats -= passengers;
      }
      objToChange = flightClassCategory;
    });

    console.log("objToChange", objToChange);
    // then we have to save the updated flight
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!objToChange) {
      throw new NotFoundException("Flight class category not found");
    }
    const bookedFlights = await this.flightClassRepository.save(objToChange);

    // then we have to save the booking
    const booking = new Booking();
    booking.userId = userId;
    booking.flightId = flightId;
    booking.flightClass = flightClass;
    booking.passengers = passengers;
    const savedBooking = await this.bookingRepository.save(booking);

    // generate a booking bill
    return new ResponseHandler("Booking successful", 200, true, {
      booking: savedBooking,
      flight: bookedFlights,
    });
  }

  async verifyPayment(payload: VerifyPayment) {
    const { bookingId, paymentStatus } = payload;

    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId },
      relations: ["flight", "flight.flightClassCategories"],
    });

    if (!booking) throw new NotFoundException("Booking not found");

    // the seats are locked so if the payment is failed release the seats
    if (paymentStatus === PaymentStatus.FAILED) {
      booking.flight.flightClassCategories.map((flightClassCategory) => {
        if (flightClassCategory.flightClass === booking.flightClass) {
          flightClassCategory.remainingSeats += booking.passengers;
        }
      });

      await this.flightClassRepository.save(
        booking.flight.flightClassCategories
      );

      await this.bookingRepository.save({
        ...booking,
        status: BookingStatus.FAILED,
      });
      const getBookings = await this.bookingRepository.find({
        where: { id: bookingId },
        relations: ["flight", "flight.flightClassCategories"],
      });

      return new ResponseHandler("Payment failed", 200, true, getBookings);
    }

    await this.bookingRepository.save({
      ...booking,
      status: BookingStatus.CONFIRMED,
    });
    const getBookings = await this.bookingRepository.find({
      where: { id: bookingId },
      relations: ["flight", "flight.flightClassCategories"],
    });

    return new ResponseHandler("Payment successful", 200, true, getBookings);
  }

  async userBookings(userId: string) {
    const allUserBookings = await this.bookingRepository.find({
      where: { userId },
      relations: ["flight", "flight.flightClassCategories"],
    });

    // for past bookings calculate the estimated time for flights to today's date
    const pastBookings = [];
    // const bookings = allUserBookings.map((pastBooking) => {
    //   if (moment(pastBooking.flight.estimatedTimeToReach).isBefore(moment())) {
    //     pastBookings.push(pastBooking);
    //   }
    // });

    // which are not current bookings are current bookings
    const currentBookings = allUserBookings.filter((booking) => {
      if (moment(booking.flight.estimatedTimeToReach).isAfter(moment())) {
        return booking;
      }
    });

    // if (!allUserBookings) throw new NotFoundException("No bookings found");

    return new ResponseHandler("User bookings", 200, true, {
      pastBookings,
      currentBookings,
    });
  }

  async findAll() {}

  async findOne(id: string) {
    const booking = await this.bookingRepository.findOne({
      where: { id },
      relations: ["flight", "flight.flightClassCategories"],
    });

    if (!booking) throw new NotFoundException("Booking not found");

    return new ResponseHandler("Booking found", 200, true, booking);
  }

  async update(id: string, updateBookingDto: UpdateBookingDto) {
    // first check if the booking exists
    const booking = await this.bookingRepository.findOne({
      where: { id },
    });

    if (!booking) throw new NotFoundException("Booking not found");

    // then check if the booking is already confirmed
    if (booking.status === BookingStatus.CONFIRMED) {
      throw new NotFoundException("Booking already confirmed");
    }

    // then update the booking status
    const updatedBooking = await this.bookingRepository.save({
      ...booking,
      ...updateBookingDto,
    });

    return new ResponseHandler("Booking updated", 200, true, updatedBooking);
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Flight } from 'src/flights/entities/flight.entity';
import { Repository } from 'typeorm';
import { FlightClassCatogories } from 'src/flights/entities/flight-class.entity';
import { FlightClass } from 'src/common/enums/flight-class.enum';
import { ResponseHandler } from 'src/common/utils/response-handler.utils';
import { Booking, BookingStatus } from './entities/booking.entity';
import { PaymentStatus, VerifyPayment } from './dto/verify-payment.dto';
import moment from 'moment';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Flight)
    private flightRepository: Repository<Flight>,
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    @InjectRepository(FlightClassCatogories)
    private flightClassRepository: Repository<FlightClassCatogories>
  ) { }
  async create(createBookingDto: CreateBookingDto) {
    const { userId, flightId, flightClass, passengers } = createBookingDto;

    // first we have to check if there are any available seats for the flight
    const checkFlight = await this.flightRepository.findOne({
      where: { id: flightId },
      relations: ['flightClassCatogories']
    });

    console.log(checkFlight);

    if (!checkFlight) throw new NotFoundException('Flight not found');

    // then we have to check for remaining seats
    checkFlight.flightClassCatogories.map((flightClassCategory) => {
      if (flightClassCategory.flightClass === FlightClass[flightClass]) {
        if (flightClassCategory.remainingSeats < passengers) {
          throw new NotFoundException('No available seats');
        }
      }
    });

    // if there are available seats, we have to update the remaining seats

    let objToChange = null;

    checkFlight.flightClassCatogories.map((flightClassCategory) => {
      if (flightClassCategory.flightClass === FlightClass[flightClass]) {
        console.log("remaining seats", flightClassCategory.remainingSeats);
        flightClassCategory.remainingSeats -= passengers;
      }
      objToChange = flightClassCategory;
    });

    console.log("objToChange", objToChange);
    // then we have to save the updated flight
    const bookedFlights = await this.flightClassRepository.save(objToChange);

    // then we have to save the booking
    const booking = new Booking();
    booking.userId = userId;
    booking.flightId = flightId;
    booking.flightClass = FlightClass[flightClass];
    booking.passengers = passengers;
    const savedBooking = await this.bookingRepository.save(booking);

    // generate a booking bill
    return new ResponseHandler('Booking successful', 200, true, { booking: savedBooking, flight: bookedFlights });
  }

  async verifyPayment(payload: VerifyPayment) {
    const { bookingId, paymentStatus } = payload;

    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId },
      relations: ['flight', 'flight.flightClassCatogories']
    });

    if (!booking) throw new NotFoundException('Booking not found');

    // the seats are locked so if the payment is failed release the seats
    if (paymentStatus === PaymentStatus.FAILED) {
      booking.flight.flightClassCatogories.map((flightClassCategory) => {
        if (flightClassCategory.flightClass === booking.flightClass) {
          flightClassCategory.remainingSeats += booking.passengers;
        }
      });

      await this.flightClassRepository.save(booking.flight.flightClassCatogories);

      await this.bookingRepository.save({ ...booking, status: BookingStatus.FAILED });
      const getBookings = await this.bookingRepository.find({
        where: { id: bookingId },
        relations: ['flight', 'flight.flightClassCatogories']
      });

      return new ResponseHandler('Payment failed', 200, true, getBookings);
    }

    await this.bookingRepository.save({ ...booking, status: BookingStatus.CONFIRMED });
    const getBookings = await this.bookingRepository.find({
      where: { id: bookingId },
      relations: ['flight', 'flight.flightClassCatogories']
    });

    return new ResponseHandler('Payment successful', 200, true, getBookings);
  }


  async userBookings(userId: string) {
    const allUserBookings = await this.bookingRepository.find({
      where: { userId },
      relations: ['flight', 'flight.flightClassCatogories']
    })

    // for past bookings calculate the estimated time for flights to today's date
    const pastBookings = []
    const bookings = allUserBookings.map((pastBooking)=> {
      if(moment(pastBooking?.flight?.estimatedTimeToReach).isBefore(moment())) {
        pastBookings.push(pastBooking);
      }
    })

    // which are not current bookings are current bookings
    const currentBookings = allUserBookings.filter((booking)=> {
      if(moment(booking?.flight?.estimatedTimeToReach).isAfter(moment())) {
        return booking;
      }
    })

    if (!allUserBookings) throw new NotFoundException('No bookings found');

    return new ResponseHandler('User bookings', 200, true, { pastBookings, currentBookings });
  }

  async findAll() {

  }

  async findOne(id: string) {
    const booking = await this.bookingRepository.findOne({
      where: { id },
      relations: ['flight', 'flight.flightClassCatogories']
    }
    );

    if (!booking) throw new NotFoundException('Booking not found');

    return new ResponseHandler('Booking found', 200, true, booking)
  }

 async update(id: string, updateBookingDto: UpdateBookingDto) {
    // first check if the booking exists
    const booking = await this.bookingRepository.findOne({
      where: { id }
    });

    if (!booking) throw new NotFoundException('Booking not found');

    // then check if the booking is already confirmed
    if (booking.status === BookingStatus.CONFIRMED) {
      throw new NotFoundException('Booking already confirmed');
    }

    // then update the booking status
    const updatedBooking = await this.bookingRepository.save({ ...booking, ...updateBookingDto });

    return new ResponseHandler('Booking updated', 200, true, updatedBooking);

  }
}

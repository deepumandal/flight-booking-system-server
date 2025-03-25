import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateFlightDto } from './dto/create-flight.dto';
import { UpdateFlightDto } from './dto/update-flight.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Flight } from './entities/flight.entity';
import { Repository } from 'typeorm';
import { ResponseHandler } from 'src/common/utils/response-handler.utils';
import { FlightClassCatogories } from './entities/flight-class.entity';
import * as moment from 'moment'
import { FlightStatus } from 'src/common/enums/flight-status.enum';
import { FlightClass } from 'src/common/enums/flight-class.enum';
import { QueryFlightDto } from './dto/query-flight.dto';
import { faker } from '@faker-js/faker';

@Injectable()
export class FlightsService {
  constructor(
    @InjectRepository(Flight)
    private readonly flightRepository: Repository<Flight>,
    @InjectRepository(FlightClassCatogories)
    private readonly flightClassRepository: Repository<FlightClassCatogories>

  ) { }

  async create(createFlightDto: CreateFlightDto) {
    let { flightNumber, departureTime, destination, origin, status, flightClassCategories, airLineName, totalSeats, estimatedTimeToReach } = createFlightDto

    const parsedCategories = Array.isArray(flightClassCategories)
      ? flightClassCategories
      : JSON.parse(flightClassCategories as any);
    // we have to check for the flightClassCatogories array and match with totalSeats
    const flightClassCatogoriesSeats = parsedCategories.map((category) => category.seats)
    const totalSeatsFromCategories = flightClassCatogoriesSeats.reduce((acc, curr) => acc + curr)

    console.log(totalSeats, totalSeatsFromCategories)

    if (totalSeats !== totalSeatsFromCategories) throw new BadRequestException('Total seats does not match with the flight class categories')

    const flight = this.flightRepository.create({
      airLineName,
      totalSeats,
      flightNumber,
      departureTime: moment(departureTime).toDate(),
      destination,
      estimatedTimeToReach: moment(departureTime).add(estimatedTimeToReach, 'hours').toDate(),
      origin,
      status: FlightStatus[status]
    })

    console.log(flightClassCategories)
    const newFlight = await this.flightRepository.save(flight)

    // we have to save the flightClassCategories array with relation to the flight-class entity
    const flightsClassToSave = flightClassCategories.map((category) => {
      return {
        ...category,
        flightClass: FlightClass[category.flightClass],
        remainingSeats: category.seats,
        flightId: newFlight.id
      }
    })
    const saveFlightClassWithCatogories = await this.flightClassRepository.save(flightsClassToSave)

    return new ResponseHandler('Flight created successfully', 201, true, { flight: newFlight, flightClassCategories: saveFlightClassWithCatogories })
  }

  async findAll(query: QueryFlightDto) {
    const { airLineName, destination, origin, isRoundTrip, startDate, endDate } = query;

    if (isRoundTrip && (!destination || !origin)) {
      throw new BadRequestException('Destination and origin are required for round trips');
    }

    let flights: any[] | { outboundFlights: any[], returnFlights: any[] } = [];

    if (isRoundTrip) {
      // Get outbound flights first
      const outboundFlights = await this.flightRepository.createQueryBuilder('flights')
        .leftJoinAndSelect('flights.flightClassCatogories', 'flightClassCatogories')
        .where('flights."origin" = :origin', { origin })
        .andWhere('flights."destination" = :destination', { destination })
        .andWhere('flights."departureTime" > :currentDate', {
          currentDate: moment().startOf('day').toDate()
        });

      if (startDate) {
        outboundFlights.andWhere('DATE(flights."departureTime") = :startDate', {
          startDate: moment(startDate).format('YYYY-MM-DD')
        });
      }

      if (airLineName) {
        outboundFlights.andWhere('flights."airLineName" ILIKE :airLineName', {
          airLineName: `%${airLineName}%`
        });
      }

      const outbound = await outboundFlights.getMany();

      // Get return flights for each outbound flight
      const returnFlightsPromises = outbound.map(async (outboundFlight) => {
        const returnQuery = this.flightRepository.createQueryBuilder('flights')
          .leftJoinAndSelect('flights.flightClassCatogories', 'flightClassCatogories')
          .where('flights."origin" = :destination', { destination })
          .andWhere('flights."destination" = :origin', { origin })
          .andWhere('flights."departureTime" > :outboundArrival', {
            outboundArrival: outboundFlight.estimatedTimeToReach
          });

        if (endDate) {
          returnQuery.andWhere('DATE(flights."departureTime") = :endDate', {
            endDate: moment(endDate).format('YYYY-MM-DD')
          });
        }

        if (airLineName) {
          returnQuery.andWhere('flights."airLineName" ILIKE :airLineName', {
            airLineName: `%${airLineName}%`
          });
        }

        return returnQuery.getMany();
      });

      const allReturnFlights = await Promise.all(returnFlightsPromises);
      // Flatten and remove duplicates from return flights
      const uniqueReturnFlights = Array.from(new Set(allReturnFlights.flat()));

      flights = {
        outboundFlights: outbound,
        returnFlights: uniqueReturnFlights
      };
    } else {
      // ... existing single trip logic ...
    }

    return new ResponseHandler(
      'Flights found successfully',
      200,
      true,
      flights
    );
}

  async seedFlights(count: number = 50) {
    console.log('Seeding flights...');
    const cities = [
      'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata',
      'Hyderabad', 'Ahmedabad', 'Pune', 'Jaipur', 'Lucknow'
    ];

    const airlines = [
      'Air India', 'IndiGo', 'SpiceJet', 'Vistara',
      'Go First', 'AirAsia India'
    ];

    const flightClassTemplates = [
      [
        { flightClass: FlightClass.ECONOMY, price: 3000, seats: 150 },
        { flightClass: FlightClass.BUSINESS, price: 8000, seats: 50 },
        { flightClass: FlightClass.FIRST, price: 15000, seats: 20 }
      ],
      [
        { flightClass: FlightClass.ECONOMY, price: 4000, seats: 180 },
        { flightClass: FlightClass.BUSINESS, price: 10000, seats: 30 },
        { flightClass: FlightClass.FIRST, price: 20000, seats: 10 }
      ],
      [
        { flightClass: FlightClass.ECONOMY, price: 2500, seats: 180 },
        { flightClass: FlightClass.BUSINESS, price: 7000, seats: 10 },
        { flightClass: FlightClass.FIRST, price: 14000, seats: 30 }
      ]
    ];

    const flights = [];

    for (let i = 0; i < count; i++) {
      // Get random origin and destination (ensuring they're different)
      const [origin, destination] = faker.helpers.shuffle(cities).slice(0, 2);

      // Generate random departure time (between tomorrow and next 3 months)
      const departureTime = faker.date.between({
        from: moment().add(1, 'day').toDate(),
        to: moment().add(3, 'months').toDate()
      });

      // Random flight duration between 1-5 hours
      const estimatedTimeToReach = faker.number.int({ min: 1, max: 5 });

      // Random flight class template
      const flightClasses = faker.helpers.arrayElement(flightClassTemplates);
      const totalSeats = flightClasses.reduce((acc, curr) => acc + curr.seats, 0);

      const flight = this.flightRepository.create({
        airLineName: faker.helpers.arrayElement(airlines),
        flightNumber: faker.number.int({ min: 1000, max: 9999 }),
        departureTime,
        estimatedTimeToReach: moment(departureTime).add(estimatedTimeToReach, 'hours').toDate(),
        totalSeats,
        destination,
        origin,
        status: FlightStatus.ONTIME
      });
      console.log(flight)

      const savedFlight = await this.flightRepository.save(flight);

      // Create flight classes with remaining seats equal to total seats initially
      const flightClassesToSave = flightClasses.map(category => ({
        ...category,
        remainingSeats: category.seats,
        flightId: savedFlight.id
      }));

      await this.flightClassRepository.save(flightClassesToSave);
      flights.push({ flight: savedFlight, flightClasses: flightClassesToSave });
    }

    return new ResponseHandler(
      `Successfully seeded ${count} flights`,
      201,
      true,
      flights
    );
  }

  async findOne(id: string) {
    const findFlight = await this.flightRepository.findOne({
      where: {
        id: id
      },
      relations: ['flightClassCatogories']
    })

    if (!findFlight) throw new NotFoundException('Flight not found')

    return new ResponseHandler('Flight found', 200, true, findFlight)
  }

  async update(id: string, updateFlightDto: UpdateFlightDto) {
    const findFlight = await this.flightRepository.findOne({
      where: {
        id: id
      }
    })

    if (!findFlight) throw new NotFoundException('Flight not found')

    const updatedFlight = await this.flightRepository.update(id, updateFlightDto)

    return new ResponseHandler('Flight updated successfully', 200, true, updatedFlight)

  }
}

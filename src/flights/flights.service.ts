import { faker } from "@faker-js/faker";
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as moment from "moment";
import { FlightClass } from "src/common/enums/flight-class.enum";
import { FlightStatus } from "src/common/enums/flight-status.enum";
import { ResponseHandler } from "src/common/utils/response-handler.utils";
import { Repository } from "typeorm";
import { CreateFlightDto } from "./dto/create-flight.dto";
import { QueryFlightDto } from "./dto/query-flight.dto";
import { UpdateFlightDto } from "./dto/update-flight.dto";
import { FlightClassCategories } from "./entities/flight-class.entity";
import { Flight } from "./entities/flight.entity";

@Injectable()
export class FlightsService {
  constructor(
    @InjectRepository(Flight)
    private readonly flightRepository: Repository<Flight>,
    @InjectRepository(FlightClassCategories)
    private readonly flightClassRepository: Repository<FlightClassCategories>
  ) {}

  async create(createFlightDto: CreateFlightDto) {
    const {
      flightNumber,
      departureTime,
      destination,
      origin,
      status,
      flightClassCategories,
      airLineName,
      totalSeats,
      estimatedTimeToReach,
    } = createFlightDto;

    // Calculate total seats from class categories
    const totalSeatsFromCategories = flightClassCategories.reduce(
      (acc, category) => acc + category.seats,
      0
    );

    if (totalSeats !== totalSeatsFromCategories) {
      throw new BadRequestException(
        `Total seats (${totalSeats}) do not match with sum of flight class category seats (${totalSeatsFromCategories}).`
      );
    }

    // Create flight entity
    const flight = this.flightRepository.create({
      airLineName,
      totalSeats,
      flightNumber,
      departureTime: moment(departureTime).toDate(),
      destination,
      estimatedTimeToReach: moment(departureTime)
        .add(estimatedTimeToReach, "hours")
        .toDate(),
      origin,
      status,
    });

    const savedFlight = await this.flightRepository.save(flight);

    // Prepare and save class categories
    const classCategoriesToSave = flightClassCategories.map((category) => ({
      ...category,
      flightClass: category.flightClass,
      remainingSeats: category.seats,
      flightId: savedFlight.id,
    }));

    const savedCategories = await this.flightClassRepository.save(
      classCategoriesToSave
    );

    return new ResponseHandler("Flight created successfully", 201, true, {
      flight: savedFlight,
      flightClassCategories: savedCategories,
    });
  }

  async findAll(query: QueryFlightDto) {
    const {
      airLineName,
      destination,
      origin,
      isRoundTrip,
      startDate,
      endDate,
    } = query;

    const flights: { outboundFlights: any[]; returnFlights?: any[] } = {
      outboundFlights: [],
    };

    // ✅ OUTBOUND FLIGHTS QUERY
    const outboundQuery = this.flightRepository
      .createQueryBuilder("flights")
      .leftJoinAndSelect(
        "flights.flightClassCategories",
        "flightClassCategories"
      )
      .where('flights."origin" = :origin', { origin })
      .andWhere('flights."destination" = :destination', { destination })
      .andWhere('flights."departureTime" > :currentDate', {
        currentDate: moment().startOf("day").toDate(),
      });

    if (startDate) {
      outboundQuery.andWhere('DATE(flights."departureTime") = :startDate', {
        startDate: moment(startDate).format("YYYY-MM-DD"),
      });
    }

    if (airLineName) {
      outboundQuery.andWhere('flights."airLineName" ILIKE :airLineName', {
        airLineName: `%${airLineName}%`,
      });
    }

    const outboundFlights = await outboundQuery.getMany();
    flights.outboundFlights = outboundFlights;

    // ✅ RETURN FLIGHTS QUERY if round trip
    if (isRoundTrip) {
      // ✅ Validate early
      if (!endDate) {
        throw new BadRequestException(
          "Return (end) date is required for round trip."
        );
      }

      const returnFlightsPromises = outboundFlights.map(
        async (outboundFlight) => {
          const returnQuery = this.flightRepository
            .createQueryBuilder("flights")
            .leftJoinAndSelect(
              "flights.flightClassCategories",
              "flightClassCategories"
            )
            .where('flights."origin" = :returnOrigin', {
              returnOrigin: destination,
            })
            .andWhere('flights."destination" = :returnDestination', {
              returnDestination: origin,
            })
            .andWhere('flights."departureTime" > :minReturnTime', {
              minReturnTime: outboundFlight.estimatedTimeToReach,
            });

          returnQuery.andWhere('DATE(flights."departureTime") = :endDate', {
            endDate: moment(endDate).format("YYYY-MM-DD"),
          });

          if (airLineName) {
            returnQuery.andWhere('flights."airLineName" ILIKE :airLineName', {
              airLineName: `%${airLineName}%`,
            });
          }

          return returnQuery.getMany();
        }
      );

      const allReturnFlights = await Promise.all(returnFlightsPromises);
      const uniqueReturnFlights = Array.from(
        new Map(
          allReturnFlights.flat().map((flight) => [flight.id, flight])
        ).values()
      );

      flights.returnFlights = uniqueReturnFlights;
    }

    return new ResponseHandler(
      "Flights found successfully",
      200,
      true,
      isRoundTrip ? flights : { outboundFlights: flights.outboundFlights }
    );
  }

  async seedFlights(count: number = 50) {
    // eslint-disable-next-line no-console
    console.log("Seeding flights...");
    const cities = [
      "Mumbai",
      "Delhi",
      "Bangalore",
      "Chennai",
      "Kolkata",
      "Hyderabad",
      "Ahmedabad",
      "Pune",
      "Jaipur",
      "Lucknow",
    ];

    const airlines = [
      "Air India",
      "IndiGo",
      "SpiceJet",
      "Vistara",
      "Go First",
      "AirAsia India",
    ];

    const flightClassTemplates = [
      [
        { flightClass: FlightClass.ECONOMY, price: 3000, seats: 150 },
        { flightClass: FlightClass.BUSINESS, price: 8000, seats: 50 },
        { flightClass: FlightClass.FIRST, price: 15000, seats: 20 },
      ],
      [
        { flightClass: FlightClass.ECONOMY, price: 4000, seats: 180 },
        { flightClass: FlightClass.BUSINESS, price: 10000, seats: 30 },
        { flightClass: FlightClass.FIRST, price: 20000, seats: 10 },
      ],
      [
        { flightClass: FlightClass.ECONOMY, price: 2500, seats: 180 },
        { flightClass: FlightClass.BUSINESS, price: 7000, seats: 10 },
        { flightClass: FlightClass.FIRST, price: 14000, seats: 30 },
      ],
    ];

    const usedFlightNumbers = new Set<string>();
    const flights = [];

    for (let i = 0; i < count; i++) {
      const [origin, destination] = faker.helpers.shuffle(cities).slice(0, 2);

      const departureTime = faker.date.between({
        from: moment().add(1, "day").toDate(),
        to: moment().add(3, "months").toDate(),
      });

      const estimatedHours = faker.number.int({ min: 1, max: 5 });
      const estimatedTimeToReach = moment(departureTime)
        .add(estimatedHours, "hours")
        .toDate();

      const flightClasses = faker.helpers.arrayElement(flightClassTemplates);
      const totalSeats = flightClasses.reduce(
        (acc, curr) => acc + curr.seats,
        0
      );

      // ✅ Ensure unique flight number per origin-destination pair
      let flightNumber = 0;
      let attempts = 0;
      let uniqueKey = "";

      do {
        flightNumber = faker.number.int({ min: 1000, max: 9999 });
        uniqueKey = `${origin}-${destination}-${flightNumber}`;
        attempts++;
      } while (usedFlightNumbers.has(uniqueKey) && attempts < 10);

      usedFlightNumbers.add(uniqueKey);

      const flight = this.flightRepository.create({
        airLineName: faker.helpers.arrayElement(airlines),
        flightNumber,
        departureTime,
        estimatedTimeToReach,
        totalSeats,
        destination,
        origin,
        status: FlightStatus.ONTIME,
      });

      const savedFlight = await this.flightRepository.save(flight);

      const flightClassesToSave = flightClasses.map((category) => ({
        ...category,
        remainingSeats: category.seats,
        flightId: savedFlight.id,
      }));

      await this.flightClassRepository.save(flightClassesToSave);
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
        id: id,
      },
      relations: ["flightClassCategories"],
    });

    if (!findFlight) throw new NotFoundException("Flight not found");

    return new ResponseHandler("Flight found", 200, true, findFlight);
  }

  async update(id: string, updateFlightDto: UpdateFlightDto) {
    const findFlight = await this.flightRepository.findOne({
      where: {
        id: id,
      },
    });

    if (!findFlight) throw new NotFoundException("Flight not found");

    const updatedFlight = await this.flightRepository.update(
      id,
      updateFlightDto
    );

    return new ResponseHandler(
      "Flight updated successfully",
      200,
      true,
      updatedFlight
    );
  }
}

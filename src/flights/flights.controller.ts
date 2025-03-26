import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { CreateFlightDto } from "./dto/create-flight.dto";
import { QueryFlightDto } from "./dto/query-flight.dto";
import { UpdateFlightDto } from "./dto/update-flight.dto";
import { FlightsService } from "./flights.service";

@Controller("flights")
@ApiTags("Flights")
export class FlightsController {
  constructor(private readonly flightsService: FlightsService) {}

  @Post("create")
  async create(@Body() createFlightDto: CreateFlightDto) {
    return this.flightsService.create(createFlightDto);
  }

  @Get("all")
  findAll(@Query() query: QueryFlightDto) {
    return this.flightsService.findAll(query);
  }

  @Get("seed")
  async seed() {
    return this.flightsService.seedFlights();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.flightsService.findOne(id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateFlightDto: UpdateFlightDto) {
    return this.flightsService.update(id, updateFlightDto);
  }
}

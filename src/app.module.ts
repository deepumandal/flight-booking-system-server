import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { BookingModule } from "./booking/booking.module";
import { envConfig } from "./common/config/env";
import { isLocalEnv } from "./common/utils/constants";
import { FlightsModule } from "./flights/flights.module";
import { JwtAuthModule } from "./jwt-auth/jwt-auth.module";
import { UserModule } from "./user/user.module";

@Module({
  imports: [
    // ConfigModule.forRoot(),
    // TypeOrmModule.forRootAsync({
    //   imports: [ConfigModule],
    //   useFactory: (configService: ConfigService) => ({
    //     type: "postgres",
    //     host: configService.get("DB_HOST"),
    //     port: +configService.get("DB_PORT"),
    //     username: configService.get("DB_USERNAME"),
    //     password: configService.get("DB_PASSWORD"),
    //     database: configService.get("DB_NAME"),
    //     entities: [__dirname + "/**/*.entity{.ts,.js}"],
    //     synchronize: true,
    //     poolSize: 100,
    //   }),
    //   inject: [ConfigService],
    // }),
    TypeOrmModule.forRoot({
      type: "postgres",
      host: envConfig<string>("DB_HOST"),
      port: +envConfig<number>("DB_PORT"),
      username: envConfig<string>("DB_USERNAME"),
      password: envConfig<string>("DB_PASSWORD"),
      database: envConfig<string>("DB_NAME"),
      autoLoadEntities: true,
      entities: [],
      synchronize: true,
      logging: isLocalEnv(),
    }),
    UserModule,
    BookingModule,
    FlightsModule,
    JwtAuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

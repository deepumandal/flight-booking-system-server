import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { BookingModule } from "./booking/booking.module";
import { envConfig } from "./common/config/env";
import { FlightsModule } from "./flights/flights.module";
import { JwtAuthModule } from "./jwt-auth/jwt-auth.module";
import { UserModule } from "./user/user.module";

@Module({
  imports: [
    // supabase connection
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async () => ({
        type: "postgres",
        url: envConfig<string>("DATABASE_URL"),
        autoLoadEntities: true,
        synchronize: true, // ❗ turn this off in production
        ssl: {
          rejectUnauthorized: false, // Required for Supabase
        },
      }),
    }),
    // local connection
    // TypeOrmModule.forRoot({
    //   type: "postgres",
    //   host: envConfig<string>("DB_HOST"),
    //   port: +envConfig<number>("DB_PORT"),
    //   username: envConfig<string>("DB_USERNAME"),
    //   password: envConfig<string>("DB_PASSWORD"),
    //   database: envConfig<string>("DB_NAME"),
    //   autoLoadEntities: true,
    //   entities: [],
    //   synchronize: true,
    //   logging: isLocalEnv(),
    // }),
    UserModule,
    BookingModule,
    FlightsModule,
    JwtAuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

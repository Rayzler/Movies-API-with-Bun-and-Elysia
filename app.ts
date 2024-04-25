import type { IMovieModel } from "./types/movies-types.ts";
import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import useMovieRouter from "./routes/movies.routes.ts";
import MovieMongo from "./models/Movie.mongodb.ts";
import MovieMysql from "./models/Movie.mysql.ts";
import MovieLocal from "./models/Movie.local.ts";
import * as process from "node:process";

let PORT = +(Bun.env.PORT || 3000);

export function createApp({ movie }: { movie: IMovieModel }) {
  let errorCode: string | undefined;

  do {
    try {
      const data: { port?: number; hostname?: string } = {};
      errorCode = undefined;
      const app = new Elysia()
        .use(swagger())
        .get("/", () => {
          return "Hello, world from Elysia!";
        })
        .group("/movies", (app) => useMovieRouter(app, movie))
        .onError(({ code }) => {
          if (code === "NOT_FOUND") return "Route not found :(";
        })
        .listen(PORT, ({ hostname, port }) => {
          data.port = port;
          data.hostname = hostname;
          console.log(
            `Server is running on http://${hostname}:${port}\nSwagger documentation: http://${hostname}:${port}/swagger`,
          );
        });

      return { hostname: data.hostname, port: data.port, app };
    } catch (error: any) {
      if (error.code === "EADDRINUSE") {
        errorCode = error.code;
        PORT = -1;
      } else {
        process.exit(1);
      }
    }
  } while (errorCode === "EADDRINUSE");
}

switch (Bun.argv[2]) {
  case "--mongodb":
    createApp({ movie: new MovieMongo() });
    break;
  case "--mysql":
    createApp({ movie: new MovieMysql() });
    break;
  case "--local":
  case undefined:
    createApp({ movie: new MovieLocal() });
    break;
  default:
    console.log("Invalid database option");
    break;
}

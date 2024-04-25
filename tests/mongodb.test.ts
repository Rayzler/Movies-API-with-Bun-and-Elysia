import { describe } from "bun:test";
import Movie from "../models/Movie.mongodb.ts";
import { testRequest } from "./utils.ts";

describe("MongoDB", async () => {
  console.log("Testing MongoDB");
  const movies = new Movie();
  await movies.waitForMovies();
  testRequest(movies);
});

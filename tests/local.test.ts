import { describe } from "bun:test";
import Movie from "../models/Movie.local.ts";
import { testRequest } from "./utils.ts";

describe("Local JSON", async () => {
  const movies = new Movie();
  await movies.waitForMovies();
  testRequest(movies);
});

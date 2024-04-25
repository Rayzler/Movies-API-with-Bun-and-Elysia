import { describe } from "bun:test";
import Movie from "../models/Movie.mysql.ts";
import { testRequest } from "./utils.ts";

describe("MySQL", async () => {
  const movies = new Movie();
  testRequest(movies);
});

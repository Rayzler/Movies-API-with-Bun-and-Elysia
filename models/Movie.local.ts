import type { IMovie, IMovieModel, IResponse } from "../types/movies-types.ts";
import { randomUUID } from "node:crypto";

export default class Movie implements IMovieModel {
  private movies: IMovie[] | undefined;

  constructor() {
    const moviesfile = Bun.file("./src/movies.json");
    (async () => {
      this.movies = await moviesfile.json();
    })();
  }

  waitForMovies(): Promise<boolean> {
    console.log("Connecting to database...");
    return new Promise((resolve) => {
      const intervalId = setInterval(() => {
        if (this.movies) {
          clearInterval(intervalId);
          resolve(true);
        }
      }, 250);
    });
  }

  async getAll(
    { genre }: { genre: string | undefined } = { genre: undefined },
  ): Promise<IResponse> {
    if (!this.movies) {
      return {
        code: 503,
        response: {
          error: "Service Unavailable: Database is still connecting",
        },
      };
    }
    if (genre) {
      const filteredMovies = this.movies.filter((movie) =>
        movie.genre.some(
          (g) => g.toLowerCase() === genre.toLowerCase().replace(" ", "-"),
        ),
      );
      return {
        code: filteredMovies.length ? 200 : 404,
        response: filteredMovies.length
          ? filteredMovies
          : { error: "No movies found" },
      };
    }

    return {
      code: this.movies.length ? 200 : 404,
      response: this.movies.length ? this.movies : { error: "No movies found" },
    };
  }

  async getById(id: string): Promise<IResponse> {
    if (!this.movies) {
      return {
        code: 503,
        response: {
          error: "Service Unavailable: Database is still connecting",
        },
      };
    }
    const movie = this.movies.find((movie: IMovie) => movie.id === id);
    if (!movie) {
      return { code: 404, response: { error: "Movie not found" } };
    }
    return { code: 200, response: movie };
  }

  async create(newMovie: Omit<IMovie, "id">): Promise<IResponse> {
    if (!this.movies) {
      return {
        code: 503,
        response: {
          error: "Service Unavailable: Database is still connecting",
        },
      };
    }
    const movie: IMovie = {
      id: randomUUID(),
      ...newMovie,
    };
    this.movies.push(movie);
    return { code: 201, response: movie };
  }

  async update(id: string, updatedMovie: Partial<IMovie>): Promise<IResponse> {
    if (!this.movies) {
      return {
        code: 503,
        response: {
          error: "Service Unavailable: Database is still connecting",
        },
      };
    }
    const movieIndex = this.movies.findIndex((movie) => movie.id === id);
    if (movieIndex === -1) {
      return { code: 404, response: { error: "Movie not found" } };
    }
    const movie = {
      ...this.movies[movieIndex],
      ...updatedMovie,
    };
    this.movies[movieIndex] = movie;
    return {
      code: 200,
      response: movie,
    };
  }

  async delete(id: string): Promise<IResponse> {
    if (!this.movies) {
      return {
        code: 503,
        response: {
          error: "Service Unavailable: Database is still connecting",
        },
      };
    }
    const movieIndex = this.movies.findIndex((movie) => movie.id === id);
    if (movieIndex === -1) {
      return { code: 404, response: { error: "Movie not found" } };
    }
    this.movies.splice(movieIndex, 1);
    return { code: 200, response: { message: "Movie deleted" } };
  }
}

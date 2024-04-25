import { getCollection } from "../database/mongodb.ts";
import type {
  IMovie,
  IMovieModel,
  IMovieMongo,
  IResponse,
} from "../types/movies-types.ts";
import { Collection, ObjectId } from "mongodb";
import { capitalize } from "../utils.ts";

export default class Movie implements IMovieModel {
  private movies: Collection<IMovieMongo> | undefined;

  constructor() {
    (async () => {
      this.movies = await getCollection<IMovieMongo>("movies");
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
    try {
      if (genre) {
        genre = capitalize(genre);
        const result = <IMovieMongo[]>(
          await this.movies.find({ genre: genre }).toArray()
        );
        return {
          code: result.length ? 200 : 404,
          response: result.length
            ? <IMovie[]>result
            : { error: "No movies found" },
        };
      }

      const result = <IMovieMongo[]>await this.movies.find().toArray();
      return {
        code: result.length ? 200 : 404,
        response: result.length
          ? <IMovie[]>result
          : { error: "No movies found" },
      };
    } catch (error) {
      return {
        code: 500,
        response: { error: "Internal server error" },
      };
    }
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
    try {
      const result = <IMovieMongo>(
        await this.movies.findOne({ _id: new ObjectId(id) })
      );
      const movie: IMovie | undefined = result
        ? {
            id: result._id?.toString() as string,
            title: result.title,
            year: result.year,
            director: result.director,
            duration: result.duration,
            poster: result.poster,
            genre: result.genre,
            rate: result.rate,
          }
        : undefined;
      return {
        code: movie ? 200 : 404,
        response: movie ? movie : { error: "Movie not found" },
      };
    } catch (error: any) {
      if (error.message.includes("24 character hex")) {
        return {
          code: 404,
          response: { error: "Movie not found" },
        };
      }
      return {
        code: 500,
        response: { error: "Internal server error" },
      };
    }
  }

  async create(inputMovie: Omit<IMovie, "id">): Promise<IResponse> {
    if (!this.movies) {
      return {
        code: 503,
        response: {
          error: "Service Unavailable: Database is still connecting",
        },
      };
    }
    try {
      const { insertedId } = await this.movies.insertOne(inputMovie);

      const { response } = await this.getById(insertedId.toString());

      return {
        code: 201,
        response,
      };
    } catch (error: any) {
      return {
        code: 500,
        response: { error: "Internal server error" },
      };
    }
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
    try {
      const result = await this.movies.updateOne(
        { _id: new ObjectId(id) },
        { $set: updatedMovie },
      );

      if (!result.modifiedCount) {
        return {
          code: 404,
          response: { error: "Movie not found" },
        };
      }

      const { response: updatedMovieResponse } = await this.getById(id);

      return {
        code: 200,
        response: updatedMovieResponse,
      };
    } catch (error: any) {
      if (error.message.includes("24 character hex")) {
        return {
          code: 400,
          response: { error: "Invalid ID format" },
        };
      }
      return {
        code: 500,
        response: { error: "Internal server error" },
      };
    }
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
    try {
      const result = await this.movies.deleteOne({ _id: new ObjectId(id) });

      if (!result.deletedCount) {
        return {
          code: 404,
          response: { error: "Movie not found" },
        };
      }

      return {
        code: 200,
        response: { message: "Movie deleted" },
      };
    } catch (error: any) {
      if (error.message.includes("24 character hex")) {
        return {
          code: 400,
          response: { error: "Invalid ID format" },
        };
      }
      return {
        code: 500,
        response: { error: "Internal server error" },
      };
    }
  }
}

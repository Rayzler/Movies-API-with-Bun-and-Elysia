import { connect } from "../database/mysql.ts";
import type { IMovie, IMovieModel, IResponse } from "../types/movies-types.ts";
import { type Pool } from "mysql2/promise";

export default class Movie implements IMovieModel {
  private connection: Pool;

  constructor() {
    this.connection = connect();
  }

  async getAll(
    { genre }: { genre: string | undefined } = { genre: undefined },
  ): Promise<IResponse> {
    try {
      if (genre) {
        genre = genre.toLowerCase().replace(" ", "-");
        let query = `
        SELECT BIN_TO_UUID(m.id) AS id, m.title, m.year, m.director, m.duration, m.poster, m.rate, g.name AS genre 
        FROM movie m LEFT JOIN movie_genre mg ON m.id = mg.movie_id LEFT JOIN genre g ON mg.genre_id = g.id
        WHERE LOWER(g.name) = ?`;
        const [queryResult] = await this.connection.query(query, [genre]);
        const movies = <IMovie[]>queryResult;
        for (let movie of movies) {
          movie.genre = [genre];
        }
        return {
          code: movies.length ? 200 : 404,
          response: movies.length ? movies : { error: "No movies found" },
        };
      }

      const [queryResult] = await this.connection.query(
        "SELECT BIN_TO_UUID(id) AS id, title, year, director, duration, poster, rate FROM movie",
      );
      const movies = <IMovie[]>queryResult;

      return {
        code: movies.length ? 200 : 404,
        response: movies.length ? movies : { error: "No movies found" },
      };
    } catch (_) {
      return {
        code: 500,
        response: { error: "Internal server error" },
      };
    }
  }

  async getById(id: string): Promise<IResponse> {
    try {
      const [queryResult] = await this.connection.query(
        `SELECT BIN_TO_UUID(id) AS id, title, year, director, duration, poster, rate FROM movie WHERE id = UUID_TO_BIN(?)`,
        [id],
      );
      const movies = <IMovie[]>queryResult;

      if (!movies.length) {
        return {
          code: 404,
          response: { error: "Movie not found" },
        };
      }

      const movie = movies[0];

      const [queryResultGenre]: any = await this.connection.query(
        `SELECT g.name AS genre FROM movie_genre mg LEFT JOIN genre g ON mg.genre_id = g.id WHERE movie_id = UUID_TO_BIN(?)`,
        [id],
      );

      movie.genre = queryResultGenre.map(
        (genre: { genre: string }) => genre.genre,
      );

      return {
        code: 200,
        response: movie,
      };
    } catch (error: any) {
      if (error.code === "ER_WRONG_VALUE_FOR_TYPE") {
        return {
          code: 404,
          response: { error: "Movie not found" },
        };
      }
      console.log(error);
      return {
        code: 500,
        response: { error: "Internal server error" },
      };
    }
  }

  async create(inputMovie: Omit<IMovie, "id">): Promise<IResponse> {
    try {
      const [queryResult] = await this.connection.query(
        "SELECT UUID() AS uuid",
      );
      const uuid = (<{ uuid: string }[]>queryResult)[0];
      const newMovie: IMovie = {
        id: uuid.uuid,
        ...inputMovie,
      };
      await this.connection.query(
        "INSERT INTO movie (id, title, year, director, duration, poster, rate) VALUES (UUID_TO_BIN(?), ?, ?, ?, ?, ?, ?)",
        [
          newMovie.id,
          newMovie.title,
          newMovie.year,
          newMovie.director,
          newMovie.duration,
          newMovie.poster,
          newMovie.rate || 0,
        ],
      );

      for (const genre of newMovie.genre) {
        const [queryResult] = await this.connection.query(
          "SELECT id FROM genre WHERE name = ?",
          [genre],
        );
        const genreId = <{ id: number }[]>queryResult;
        if (genreId.length) {
          await this.connection.query(
            "INSERT INTO movie_genre (movie_id, genre_id) VALUES (UUID_TO_BIN(?), ?)",
            [newMovie.id, genreId[0].id],
          );
        } else {
          return {
            code: 400,
            response: { error: "Invalid genre" },
          };
        }
      }

      const { response } = await this.getById(newMovie.id);

      return {
        code: 201,
        response,
      };
    } catch (error) {
      return {
        code: 500,
        response: { error: "Internal server error" },
      };
    }
  }

  async update(id: string, updatedMovie: Partial<IMovie>): Promise<IResponse> {
    try {
      const { response, code } = await this.getById(id);
      if (code === 404) {
        return { response, code };
      }
      const movie: IMovie = {
        ...(<IMovie>response),
        ...updatedMovie,
      };

      await this.connection.query(
        "UPDATE movie SET title = ?, year = ?, director = ?, duration = ?, poster = ?, rate = ? WHERE id = UUID_TO_BIN(?)",
        [
          movie.title,
          movie.year,
          movie.director,
          movie.duration,
          movie.poster,
          movie.rate,
          id,
        ],
      );

      if (updatedMovie.genre) {
        await this.connection.query(
          "DELETE FROM movie_genre WHERE movie_id = UUID_TO_BIN(?)",
          [id],
        );

        for (const genre of movie.genre) {
          const [queryResult] = await this.connection.query(
            "SELECT id FROM genre WHERE name = ?",
            [genre],
          );
          const genreId = <{ id: number }[]>queryResult;
          if (genreId.length) {
            await this.connection.query(
              "INSERT INTO movie_genre (movie_id, genre_id) VALUES (UUID_TO_BIN(?), ?)",
              [id, genreId[0].id],
            );
          } else {
            return {
              code: 400,
              response: { error: "Invalid genre" },
            };
          }
        }
      }

      const { response: updatedMovieResponse } = await this.getById(id);

      return {
        code: 200,
        response: updatedMovieResponse,
      };
    } catch (error) {
      return {
        code: 500,
        response: { error: "Internal server error" },
      };
    }
  }

  async delete(id: string): Promise<IResponse> {
    try {
      const { response, code } = await this.getById(id);
      if (code === 404) {
        return { response, code };
      }

      await this.connection.query(
        "DELETE FROM movie_genre WHERE movie_id = UUID_TO_BIN(?)",
        [id],
      );
      await this.connection.query(
        "DELETE FROM movie WHERE id = UUID_TO_BIN(?)",
        [id],
      );

      return {
        code: 200,
        response: { message: "Movie deleted" },
      };
    } catch (error) {
      return {
        code: 500,
        response: { error: "Internal server error" },
      };
    }
  }
}

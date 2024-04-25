import { expect, it } from "bun:test";
import { createApp } from "../app.ts";
import type { IMovie, IMovieModel } from "../types/movies-types.ts";

export function testRequest(movie: IMovieModel) {
  const { hostname, port, app }: any = createApp({ movie });
  let id: string;

  it("post a movie", async () => {
    const movie: Omit<IMovie, "id"> = {
      title: "Deadpool 3",
      year: 2024,
      director: "Shawn Levy",
      genre: ["Action", "Comedy", "Sci-Fi"],
      duration: 1000,
      poster: "https://www.imdb.com/title/tt6264654/",
    };

    const response = await app
      .handle(
        new Request(`http://${hostname}:${port}/movies`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(movie),
        }),
      )
      .then((res: any) => res.json());

    id = response.id;

    expect(response.title).toBe(movie.title);
    expect(response.year).toBe(movie.year);
    expect(response.director).toBe(movie.director);
    expect(response.genre).toBeArrayOfSize(3);
  });

  it("post a movie with invalid data", async () => {
    const response = await app
      .handle(
        new Request(`http://${hostname}:${port}/movies`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        }),
      )
      .then((res: any) => res.json());

    expect(response.error.length > 0).toBeTrue();
  });

  it("return movies", async () => {
    const response = await app
      .handle(new Request(`http://${hostname}:${port}/movies`))
      .then((res: any) => res.json());

    expect(response).toBeArray();
    expect(response.length).toBeGreaterThan(0);
  });

  it("return movie by id", async () => {
    const response = await app
      .handle(new Request(`http://${hostname}:${port}/movies/${id}`))
      .then((res: any) => res.json());

    expect(response).toBeObject();
    expect(response.id).toBe(id);
    expect(response.title).toBe("Deadpool 3");
  });

  it("return movie not found", async () => {
    const id: string = "lorem-ipsum";
    const response = await app
      .handle(new Request(`http://${hostname}:${port}/movies/${id}`))
      .then((res: any) => res.json());

    expect(response["error"]).toBe("Movie not found");
  });

  it("return movies by genre", async () => {
    const genre: string = "Action";
    const response = await app
      .handle(new Request(`http://${hostname}:${port}/movies?genre=${genre}`))
      .then((res: any) => res.json());

    expect(response).toBeArray();
    expect(response.length).toBeGreaterThan(0);
    expect(
      response.every((movie: IMovie) =>
        movie.genre.some((g) => g.toLowerCase() === genre.toLowerCase()),
      ),
    ).toBeTrue();
  });

  it("return movies by invalid genre", async () => {
    const genre: string = "Marvel";
    const response = await app
      .handle(new Request(`http://${hostname}:${port}/movies?genre=${genre}`))
      .then((res: any) => res.json());

    expect(response["error"]).toBe("No movies found");
  });

  it("update a movie", async () => {
    const movie: Partial<IMovie> = {
      title: "Deadpool & Wolverine",
      duration: 1234,
    };

    await app
      .handle(
        new Request(`http://${hostname}:${port}/movies/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(movie),
        }),
      )
      .then((res: any) => res.json());

    const response = await app
      .handle(new Request(`http://${hostname}:${port}/movies/${id}`))
      .then((res: any) => res.json());

    expect(response).toBeObject();
    expect(response.id).toBe(id);
    expect(response.title).toBe("Deadpool & Wolverine");
    expect(response.duration).toBe(1234);
  });

  it("delete a movie", async () => {
    const { message } = await app
      .handle(
        new Request(`http://${hostname}:${port}/movies/${id}`, {
          method: "DELETE",
        }),
      )
      .then((res: any) => res.json());

    expect(message).toBe("Movie deleted");

    const response = await app
      .handle(new Request(`http://${hostname}:${port}/movies/${id}`))
      .then((res: any) => res.json());

    expect(response["error"]).toBe("Movie not found");
  });
}

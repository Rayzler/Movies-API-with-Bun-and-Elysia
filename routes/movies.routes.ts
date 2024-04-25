import type { IMovieModel } from "../types/movies-types.ts";
import MoviesController from "../controllers/movies.ts";
import { Elysia } from "elysia";

export default function useMovieRouter(app: any, movie: IMovieModel) {
  const moviesController = new MoviesController(movie);

  return app
    .get("/", moviesController.getAll)
    .get("/:id", moviesController.getById)
    .post("/", moviesController.create)
    .patch("/:id", moviesController.update)
    .delete("/:id", moviesController.delete);
}

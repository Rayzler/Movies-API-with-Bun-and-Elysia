import type {
  ICallbackArgs,
  IMovie,
  IMovieModel as Movie,
} from "../types/movies-types.ts";
import { validateMovie, validatePartialMovie } from "../schemas/movies.ts";

export default class MoviesController {
  private readonly movie: Movie;

  constructor(movie: Movie) {
    this.movie = movie;
  }

  getAll = async ({ set, query }: ICallbackArgs) => {
    const { genre } = query;
    const { response, code } = await this.movie.getAll({ genre });
    set.status = code;
    return response;
  };

  getById = async ({ params: { id }, set }: ICallbackArgs) => {
    const { response, code } = await this.movie.getById(id);
    set.status = code;
    return response;
  };

  create = async ({ set, body }: ICallbackArgs) => {
    const result = validateMovie(<IMovie>body);
    if (result.error) {
      set.status = 422;
      return { error: JSON.parse(result.error.message) };
    }
    const { response, code } = await this.movie.create(<IMovie>result.data);
    set.status = code;
    return response;
  };

  update = async ({ params: { id }, set, body }: ICallbackArgs) => {
    const result = validatePartialMovie(<IMovie>body);
    if (result.error) {
      set.status = 422;
      return { error: JSON.parse(result.error.message) };
    }
    const { response, code } = await this.movie.update(id, <IMovie>result.data);
    set.status = code;
    return response;
  };

  delete = async ({ params: { id }, set }: ICallbackArgs) => {
    const { response, code } = await this.movie.delete(id);
    set.status = code;
    return response;
  };
}

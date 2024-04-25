import type { Document, ObjectId } from "mongodb";

export interface IMovie {
  id: string;
  title: string;
  year: number;
  director: string;
  duration: number;
  poster: string;
  genre: string[];
  rate?: number;
}

export interface IResponse {
  code: number;
  response: IMovie[] | IMovie | { error: string } | { message: string };
}

export interface IMovieModel {
  getAll: (params?: { genre: string | undefined }) => Promise<IResponse>;
  getById: (id: string) => Promise<IResponse>;
  create: (newMovie: Omit<IMovie, "id">) => Promise<IResponse>;
  update: (id: string, updatedMovie: Partial<IMovie>) => Promise<IResponse>;
  delete: (id: string) => Promise<IResponse>;
}

export interface IMovieMongo extends Omit<IMovie, "id">, Document {
  _id?: ObjectId;
}

export interface ICallbackArgs {
  params: { id: string };
  set: {
    status: number;
  };
  query: { genre?: string };
  body?: Omit<IMovie, "id">;
}

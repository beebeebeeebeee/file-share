export type GenericResponse<T> = {
    status: string;
    message?: string;
    data: T
}
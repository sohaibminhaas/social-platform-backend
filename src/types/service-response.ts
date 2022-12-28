export interface Service_Response<T> {
    status: boolean;
    statusMsg?: string | string[];
    data: T | undefined;
}
import { MatrixRequest, MatrixRequestParams } from './models/api/MatrixRequest';
interface HttpOptions {
    accessToken?: string;
}
/**
 * Handling the HTTP connection to the matrix synapse node
 */
export declare class MatrixHttpClient {
    private readonly baseUrl;
    private readonly cancelTokenSource;
    constructor(baseUrl: string);
    /**
     * Get data from the synapse node
     *
     * @param endpoint
     * @param options
     */
    get<T>(endpoint: string, params?: MatrixRequestParams<T>, options?: HttpOptions): Promise<T>;
    /**
     * Post data to the synapse node
     *
     * @param endpoint
     * @param body
     * @param options
     * @param params
     */
    post<T>(endpoint: string, body: MatrixRequest<T>, options?: HttpOptions, params?: MatrixRequestParams<T>): Promise<T>;
    /**
     * Put data to the synapse node
     *
     * @param endpoint
     * @param body
     * @param options
     * @param params
     */
    put<T>(endpoint: string, body: MatrixRequest<T>, options?: HttpOptions, params?: MatrixRequestParams<T>): Promise<T>;
    cancelAllRequests(): Promise<void>;
    /**
     * Send a request to the synapse node
     *
     * @param method
     * @param endpoint
     * @param config
     * @param requestParams
     * @param data
     */
    private send;
    /**
     * Get the headers based on the options object
     *
     * @param options
     */
    private getHeaders;
    /**
     * Get parameters
     *
     * @param _params
     */
    private getParams;
    /**
     * Construct API URL
     */
    private apiUrl;
}
export {};

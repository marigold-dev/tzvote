import { MatrixHttpClient } from '../MatrixHttpClient';
import { MatrixLoginResponse } from '../models/api/MatrixLogin';
export declare class MatrixUserService {
    private readonly httpClient;
    constructor(httpClient: MatrixHttpClient);
    /**
     * Log in to the matrix node with username and password
     *
     * @param user
     * @param password
     * @param deviceId
     */
    login(user: string, password: string, deviceId: string): Promise<MatrixLoginResponse>;
}

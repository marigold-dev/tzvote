import { MatrixHttpClient } from '../MatrixHttpClient';
import { MatrixRoom } from '../models/MatrixRoom';
import { MatrixRoomCreateRequest, MatrixRoomCreateResponse } from '../models/api/MatrixRoomCreate';
import { MatrixRoomInviteResponse } from '../models/api/MatrixRoomInvite';
import { MatrixRoomJoinResponse } from '../models/api/MatrixRoomJoin';
/**
 * A service to help with matrix room management
 */
export declare class MatrixRoomService {
    private readonly httpClient;
    constructor(httpClient: MatrixHttpClient);
    /**
     * Create a room
     *
     * @param accessToken
     * @param config
     */
    createRoom(accessToken: string, config?: MatrixRoomCreateRequest): Promise<MatrixRoomCreateResponse>;
    /**
     * Invite a user to a room
     *
     * @param accessToken
     * @param user
     * @param room
     */
    inviteToRoom(accessToken: string, user: string, room: MatrixRoom): Promise<MatrixRoomInviteResponse>;
    /**
     * Join a specific room
     *
     * @param accessToken
     * @param room
     */
    joinRoom(accessToken: string, room: MatrixRoom): Promise<MatrixRoomJoinResponse>;
    /**
     * Get all joined rooms
     *
     * @param accessToken
     */
    getJoinedRooms(accessToken: string): Promise<MatrixRoomJoinResponse>;
}

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { MatrixRoomStatus } from '../models/MatrixRoom';
/**
 * A service to help with matrix room management
 */
export class MatrixRoomService {
    constructor(httpClient) {
        this.httpClient = httpClient;
    }
    /**
     * Create a room
     *
     * @param accessToken
     * @param config
     */
    createRoom(accessToken, config = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.httpClient.post('/createRoom', config, { accessToken });
        });
    }
    /**
     * Invite a user to a room
     *
     * @param accessToken
     * @param user
     * @param room
     */
    inviteToRoom(accessToken, user, room) {
        return __awaiter(this, void 0, void 0, function* () {
            if (room.status !== MatrixRoomStatus.JOINED && room.status !== MatrixRoomStatus.UNKNOWN) {
                return Promise.reject(`User is not a member of room ${room.id}.`);
            }
            return this.httpClient.post(`/rooms/${encodeURIComponent(room.id)}/invite`, { user_id: user }, { accessToken });
        });
    }
    /**
     * Join a specific room
     *
     * @param accessToken
     * @param room
     */
    joinRoom(accessToken, room) {
        return __awaiter(this, void 0, void 0, function* () {
            if (room.status === MatrixRoomStatus.JOINED) {
                return Promise.resolve({ room_id: room.id });
            }
            return this.httpClient.post(`/rooms/${encodeURIComponent(room.id)}/join`, {}, { accessToken });
        });
    }
    /**
     * Get all joined rooms
     *
     * @param accessToken
     */
    getJoinedRooms(accessToken) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.httpClient.get(`/joined_rooms`, undefined, { accessToken });
        });
    }
}
//# sourceMappingURL=MatrixRoomService.js.map
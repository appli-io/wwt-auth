import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
}                         from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService }     from '@modules/jwt/jwt.service';
import { TokenTypeEnum }  from '@modules/jwt/enums/token-type.enum';
import { MemberService }  from '@modules/scrumboard/services/member.service';
import { Logger }         from '@nestjs/common';

@WebSocketGateway({cors: {origin: '*'}, namespace: 'ws/board'})
export class BoardGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  connectedUsers: Map<string, Socket[]> = new Map();
  private readonly logger = new Logger(BoardGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly memberService: MemberService
  ) {}

  async handleConnection(client: Socket, ...args: any[]) {
    try {
      const {userId, companyId} = await this.decodeToken(client);

      if (!this.connectedUsers.has(userId)) {
        this.connectedUsers.set(userId, []);
      }

      this.connectedUsers.get(userId).push(client);
      this.logger.log(Array.from(this.connectedUsers).map(([ key, value ]): string => (`boardId: ${ key }, users connected: ${ value.length }`)));
    } catch (e) {
      console.error(e);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.connectedUsers.forEach((sockets, userId) => {
      this.connectedUsers.set(
        userId,
        sockets.filter(socket => socket.id !== client.id)
      );
      if (this.connectedUsers.get(userId).length === 0) {
        this.connectedUsers.delete(userId);
      }
    });
  }

  @SubscribeMessage('joinBoard')
  joinBoard(@MessageBody() boardId: string, @ConnectedSocket() client: Socket) {
    client.join('board_' + boardId);
    return this.server.to('board_' + boardId).emit('joinedBoard', 'User joined to board ' + boardId);
  }

  @SubscribeMessage('leaveBoard')
  leaveBoard(@MessageBody() boardId: string, @ConnectedSocket() client: Socket) {
    client.leave(boardId);
    return this.server.to(boardId).emit('leftBoard', 'User left from board ' + boardId);
  }

  private async decodeToken(client: Socket) {
    const decoded = await this.jwtService.verifyToken(client.handshake.auth.token, TokenTypeEnum.ACCESS, client.handshake['host']);

    return {
      userId: decoded.id,
      companyId: decoded.companyId
    };
  }
}

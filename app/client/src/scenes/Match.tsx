import { Client, Room } from 'colyseus.js';
import React, { Component, RefObject } from 'react';

import { Constants, Models, Types } from '@jouer/common';

import { JouerGame as Game } from '../game/Game';
import qs from 'querystringify';
import { Messages, Players } from "./HUD";
import { Card } from '../game/entities/Card';

interface IProps {
  roomId?: string;
}

export interface HUDProps {
  state: string;
  mode: string;
  roomName: string;
  players: Models.PlayerJSON[];
  playersCount: number;
  playersMaxCount: number;
  messages: Models.MessageJSON[];
  notice?: string;
}

interface IState {
  hud: HUDProps;
}


export default class Match extends Component<IProps, IState> {
  private canvasRef: RefObject<HTMLDivElement>;

  private game: Game;

  private client?: Client;

  private room?: Room;

  private timer: NodeJS.Timeout | null = null;

  // BASE
  constructor (props: IProps) {
    super(props);

    this.canvasRef = React.createRef();
    this.game = new Game(window.innerWidth, window.innerHeight, this.handleActionSend);

    this.state = {
      hud: {
        state: '',
        mode: '',
        roomName: '',
        players: [],
        playersCount: 0,
        playersMaxCount: 0,
        messages: [],
        notice: '',
      },
    };
  }

  componentDidMount() {
    this.start();
  }

  componentWillUnmount() {
    this.stop();
  }

  // LIFECYCLE
  start = async () => {
    // Navigate
    let roomId = window.location.pathname.replace('/', '');
    const isNewRoom = roomId === 'new';
    const params = new URLSearchParams(window.location.search);
    const search = params.toString();
    const parsedSearch = qs.parse(search) as Types.IRoomOptions;

    let options;
    if (isNewRoom) {
      options = {
        ...parsedSearch,
        roomMaxPlayers: Number(parsedSearch.roomMaxPlayers),
      };
    } else {
      // The only thing to pass when joining an existing room is a player's name
      options = {
        playerName: localStorage.getItem('playerName'),
      };
    }

    // Connect
    try {
      const host = window.document.location.host.replace(/:.*/, '');
      const port = process.env.NODE_ENV !== 'production' ? Constants.WS_PORT : window.location.port;
      const url = `${ window.location.protocol.replace('http', 'ws') }//${ host }${ port ? `:${ port }` : '' }`;

      this.client = new Client(url);
      if (isNewRoom) {
        this.room = await this.client.create(Constants.ROOM_NAME, options);

        // We replace the "new" in the URL with the room's id
        window.history.replaceState(null, '', `/${ this.room.id }`);
      } else {
        this.room = await this.client.joinById(roomId, options);
      }
    } catch (error) {
      // navigate('/');
      console.error('Error connecting to server', error);
      window.location.href = '/';
      return;
    }

    // Set the current player id
    this.setState((prev) => ({
      ...prev,
      hud: {
        ...prev.hud,
        playerId: this.room ? this.room.sessionId : '',
      },
    }));

    // Listen for state changes
    this.room.state.players.onAdd(this.handlePlayerAdd);
    this.room.state.table.listen("cards", this.handleTableChange);
    this.room.state.game.onChange(this.handleGameChange);
    // state 单独监听一下
    this.room.state.game.listen("state", this.handleGameStateChange);
    this.room.state.listen("activePlayerId", this.handleActivePlayerChange);

    // Listen for Messages
    this.room.onMessage('*', this.handleMessage);

    // Start game
    this.game.start(this.canvasRef.current as HTMLDivElement);

    // Listen for inputs
    window.addEventListener('resize', this.handleWindowResize);

    // Start players refresh listeners
    this.timer = setInterval(this.updateRoom, Constants.PLAYERS_REFRESH);
  };

  stop = () => {
    // Colyseus
    if (this.room) {
      this.room.leave();
    }

    // Game
    this.game.stop();

    // Inputs
    window.removeEventListener('resize', this.handleWindowResize);

    // Start players refresh listeners
    if (this.timer) {
      clearInterval(this.timer);
    }
  };

  // HANDLERS: Colyseus

  handleCardsChange = (curCards: Card[]) => {
    // this.game.gameUpdate('hand', curCards);
    this.game.handUpdate(curCards);
  }

  handleActivePlayerChange = (playerId: string) => {
    console.log(playerId, "activePlayer")
    this.game.activePlayerUpdate(playerId);
  }

  handleGameStateChange = (state: string) => {
    this.setState((prev) => ({
      hud: {
        ...prev.hud,
        state
      },
    }));
  }

  handleGameChange = () => {
    this.game.gameUpdate(this.room.state.game);
  };

  handleTableChange = (cards: Card[]) => {
    console.log(cards, "tableUpdate")
    this.game.tableUpdate(cards);
  }

  handlePlayerAdd = (player: any, playerId: string) => {
    const isMe = this.isPlayerIdMe(playerId);
    this.game.playerAdd(playerId, player, isMe);
    player.onChange(() => {
      this.handlePlayerUpdate(player, playerId);
    })

    if (isMe) {
      player.listen("hand", (curCards: any[]) => {
        this.handleCardsChange(curCards);
      })
      player.listen("borrowingCard", (card: Models.CardJSON) => {
        this.game.borrowingCardUpdate(card)
      })
    }
  };

  handlePlayerUpdate = (player: any, playerId: string) => {
    console.log(player, "update")

    const isMe = this.isPlayerIdMe(playerId);
    this.game.playerUpdate(playerId, player, isMe);
  };

  handlePlayerRemove = (player: Models.PlayerJSON, playerId: string) => {
    const isMe = this.isPlayerIdMe(playerId);
    this.game.playerRemove(playerId, isMe);
    this.updateRoom();
  };


  handleMessage = (type: any, message: Models.MessageJSON) => {
    const { messages } = this.state.hud;

    let notice: string | undefined;
    switch (type) {
      case 'waiting':
        notice = `Waiting for other players...`;
        break;
      case 'start':
        notice = `Game starts`;
        break;
      case 'won':
        notice = `${ message.params.name } wins!`;
        break;
      case 'timeout':
        notice = `Timeout...`;
        break;
      case 'tryBorrow':
        notice = `${ message.params.name } 正在借牌`;
        break;
      case 'borrow':
        notice = `${ message.params.name } 借走了 ${ message.params.card }`;
        break;
      case 'jouer':
        notice = `${ message.params.name } 想表演`;
        break;
      case 'turn':
        notice = `现在是 ${ message.params.name } 的回合`;
        break;
      default:
        break;
    }

    this.setState((prev) => ({
      hud: {
        ...prev.hud,
        messages: [...messages, message].slice(-Constants.LOG_LINES_MAX),
        notice,
      },
    }));

    this.updateRoom();
  };

  // HANDLERS: GameManager
  handleActionSend = (action: Models.ActionJSON) => {
    if (!this.room) {
      return;
    }

    console.log(action.type, "message")
    this.room.send(action.type, action);
  };

  // HANDLERS: Inputs
  handleWindowResize = () => {
    // this.game.setScreenSize(window.innerWidth, window.innerHeight);
  };

  // METHODS
  isPlayerIdMe = (playerId: string) => {
    return this.room.sessionId === playerId;
  };

  updateRoom = () => {
    const stats = this.game.getStats();

    this.setState((prev) => ({
      ...prev,
      hud: {
        ...prev.hud,
        ...stats,
      },
    }));
  }

  // RENDER
  render() {
    const { hud } = this.state;
    const {
      state,
      playersCount,
      playersMaxCount,
      messages,
      players,
      roomName,
    } = hud;

    return (
      <>
        <div ref={ this.canvasRef } />
        {
          state !== "playing" && <div className='select-none absolute top-5 left-1/2 transform -translate-x-1/2 text-dtext font-jmadh text-4xl pointer-events-none'>{ `${ roomName } - ${ playersCount } / ${ playersMaxCount }` }</div>
        }
        {
          state === "waiting" && <div className="bg-rule bg-contain bg-center w-full bg-no-repeat h-36 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
        }
        <Messages messages={ messages } />
        <Players players={ players } />
        <div className='select-none absolute top-2 left-1/2 transform text-opacity-75 -translate-x-1/2 w-52 max-h-36 text-dtext'>
          { hud.notice }
        </div>
      </>
    );
  }
}

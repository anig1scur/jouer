import { Client, Room } from 'colyseus.js';
import React, { Component, RefObject } from 'react';

import { Constants, Models, Types } from '@jouer/common';

import { JouerGame as Game } from '../game/Game';
import { Helmet } from 'react-helmet';
import qs from 'querystringify';
import { Card } from '../game/entities/Card';

interface IProps {
  roomId?: string;
}

export interface HUDProps {
  gameMode: string;
  gameModeEndsAt: number;
  roomName: string;
  playerId: string;
  playerName: string;
  playerLives: number;
  playerMaxLives: number;
  players: Models.PlayerJSON[];
  playersCount: number;
  playersMaxCount: number;
  messages: Models.MessageJSON[];
  announce?: string;
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
        gameMode: '',
        gameModeEndsAt: 0,
        roomName: '',
        playerId: '',
        playerName: '',
        playerLives: 0,
        playerMaxLives: 0,
        players: [],
        playersCount: 0,
        playersMaxCount: 0,
        messages: [],
        announce: '',
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
    this.room.state.game.onChange(this.handleGameChange);
    // this.room.state.deck.onChange(this.handleCardsChange);
    // this.room.state.hand.onChange(this.handleCardsChange);
    this.room.state.players.onAdd(this.handlePlayerAdd);
    this.room.state.players.onRemove(this.handlePlayerRemove);

    // Listen for Messages
    this.room.onMessage('*', this.handleMessage);

    // Start game
    this.game.start();

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
    this.game.gameUpdate('hand', curCards);
    console.log(curCards.map((card) => card.id));
  }

  handleGameChange = (attributes: any, k) => {
    if (!attributes) {
      return;
    }
    console.log(attributes);
    // for (const row of attributes) {
    // this.game.gameUpdate(row.field, row.value);
    // }
  };

  handlePlayerAdd = (player: any, playerId: string) => {

    const isMe = this.isPlayerIdMe(playerId);
    this.game.playerAdd(playerId, player, isMe);
    this.updateRoom();

    if (isMe) {
      player.listen("hand", (curCards: Card[]) => {
        this.handleCardsChange(curCards);
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

    let announce: string | undefined;
    switch (type) {
      case 'waiting':
        announce = `Waiting for other players...`;
        break;
      case 'start':
        announce = `Game starts`;
        break;
      case 'won':
        announce = `${ message.params.name } wins!`;
        break;
      case 'timeout':
        announce = `Timeout...`;
        break;
      default:
        break;
    }

    this.setState((prev) => ({
      hud: {
        ...prev.hud,
        // Only set the last n messages (negative value on slice() is reverse)
        messages: [...messages, message].slice(-Constants.LOG_LINES_MAX),
        announce,
      },
    }));

    this.updateRoom();
  };

  // HANDLERS: GameManager
  handleActionSend = (action: Models.ActionJSON) => {
    if (!this.room) {
      return;
    }

    this.room.send(action.type, action);
  };

  // HANDLERS: Inputs
  handleWindowResize = () => {
    // this.game.setScreenSize(window.innerWidth, window.innerHeight);
  };

  // METHODS
  isPlayerIdMe = (playerId: string) => {
    return this.state.hud.playerId === playerId;
  };

  updateRoom = () => {
    const stats = this.game.getStats();
    // console.log("stats", stats);

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

    return (
      <Helmet>
        <title>{ `${ hud.roomName || hud.gameMode } [${ hud.playersCount }]` }</title>
      </Helmet>
    );
  }
}

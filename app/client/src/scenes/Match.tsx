import React, { FC, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Client, Room } from 'colyseus.js';
import { Constants, Maths, Models, Types } from '@jouer/common';
import { JouerGame as Game } from '../game/Game';
import { Helmet } from 'react-helmet';
import { View } from '../components';
import qs from 'querystringify';

interface MatchProps {
}

export interface HUDProps {
  gameMode: string;
  gameModeEndsAt: number;
  roomName: string;
  playerId: string;
  playerName: string;
  playersCount: number;
  playersMaxCount: number;
  messages: Models.MessageJSON[];
  announce?: string;
}

export const Match: FC<MatchProps> = () => {
  const navigate = useNavigate();
  const { roomId } = useParams<{ roomId: string }>();
  const location = useLocation();

  const canvasRef = useRef<HTMLDivElement>(null);

  const [client, setClient] = useState<Client | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  const [hud, setHud] = useState<HUDProps>({
    gameMode: '',
    gameModeEndsAt: 0,
    roomName: '',
    playerId: '',
    playerName: '',
    playerLives: 0,
    playerMaxLives: 0,
    playersCount: 0,
    playersMaxCount: 0,
    messages: [],
    announce: '',
  });

  const handleActionSend = (action: Models.ActionJSON) => {
    if (!room) {
      return;
    }

    room.send(action.type, action);
  };

  const game = new Game(window.innerWidth, window.innerHeight, handleActionSend);


  useEffect(() => {
    start();

    return () => {
      stop();
    };
  }, []);

  const start = async () => {
    const isNewRoom = roomId === 'new';
    const parsedSearch = qs.parse(location.search) as Types.IRoomOptions;

    let options;
    if (isNewRoom) {
      options = {
        ...parsedSearch,
        roomMaxPlayers: Number(parsedSearch.roomMaxPlayers),
      };
    } else {
      options = {
        playerName: localStorage.getItem('playerName'),
      };
    }

    try {
      const host = window.document.location.host.replace(/:.*/, '');
      const port = process.env.NODE_ENV !== 'production' ? Constants.WS_PORT : window.location.port;
      const url = `${ window.location.protocol.replace('http', 'ws') }//${ host }${ port ? `:${ port }` : '' }`;

      const newClient = new Client(url);
      setClient(newClient);

      let newRoom;
      if (isNewRoom) {
        newRoom = await newClient.create(Constants.ROOM_NAME, options);
        window.history.replaceState(null, '', `/${ newRoom.id }`);
      } else {
        newRoom = await newClient.joinById(roomId!, options);
      }

      setRoom(newRoom);

      setHud((prev) => ({
        ...prev,
        playerId: newRoom ? newRoom.sessionId : '',
      }));

      // Set up room state listeners
      setupRoomListeners(newRoom);

      // Start game
      console.log(game, canvasRef.current);
      if (game && canvasRef.current) {
        game.start(canvasRef.current);
      }

      // Listen for inputs
      window.addEventListener('resize', handleWindowResize);

      // Start players refresh listeners
      const newTimer = setInterval(updateRoom, Constants.PLAYERS_REFRESH);
      setTimer(newTimer);
    } catch (error) {
      navigate('/');
    }
  };

  const stop = () => {
    if (room) {
      room.leave();
    }

    if (game) {
      game.stop();
    }

    window.removeEventListener('resize', handleWindowResize);

    if (timer) {
      clearInterval(timer);
    }
  };

  const setupRoomListeners = (newRoom: Room) => {
    newRoom.state.game.onChange = handleGameChange;
    newRoom.state.players.onAdd = handlePlayerAdd;
    newRoom.state.players.onRemove = handlePlayerRemove;

    newRoom.onMessage('*', handleMessage);
  };

  const handleGameChange = (attributes: any) => {
    for (const row of attributes) {
      game?.gameUpdate(row.field, row.value);
    }
  };

  const handlePlayerAdd = (player: any, playerId: string) => {
    const isMe = isPlayerIdMe(playerId);
    game?.playerAdd(playerId, player, isMe);
    updateRoom();

    player.onChange = () => {
      handlePlayerUpdate(player, playerId);
    };
  };

  const handlePlayerRemove = (playerId: string) => {
    const isMe = isPlayerIdMe(playerId);
    game?.playerRemove(playerId, isMe);
    updateRoom();
  };
  const handlePlayerUpdate = (player: any, playerId: string) => {
    const isMe = isPlayerIdMe(playerId);
    // game?.playerUpdate(playerId, player, isMe);
  };

  const handleMessage = (type: any, message: Models.MessageJSON) => {
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

    setHud((prev) => ({
      ...prev,
      messages: [...prev.messages, message].slice(-Constants.LOG_LINES_MAX),
      announce,
    }));

    updateRoom();
  };

  const handleWindowResize = () => {
    // game?.setScreenSize(window.innerWidth, window.innerHeight);
  };

  const isPlayerIdMe = (playerId: string) => {
    return hud.playerId === playerId;
  };

  const updateRoom = () => {
    const stats = game?.getStats();
    if (stats) {
      setHud((prev) => ({
        ...prev,
        ...stats,
      }));
    }
  };


  return (
    <View style={ { position: 'relative', height: '100%' } }>
      <Helmet>
        <title>{ `${ hud.roomName || hud.gameMode } [${ hud.playersCount }]` }</title>
      </Helmet>
      <div ref={ canvasRef } />
    </View>
  );
};

export default Match;

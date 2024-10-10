import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Client } from 'colyseus.js';
import qs from 'querystringify';
import {
  Box,
  Button,
  IListItem,
  Inline,
  Input,
  Room,
  Select,
  Separator,
  Space,
  Text,
  View,
} from '../components';
import { Constants, Types } from '@jouer/common';
import { RoomAvailable } from 'colyseus.js/lib/Room';



const PlayersCountList: IListItem[] = Constants.ROOM_PLAYERS_SCALES.map((value) => ({
  value,
  title: `${ value } players`,
}));

const Home: React.FC = () => {
  const [playerName, setPlayerName] = useState(localStorage.getItem('playerName') || '');
  const [hasNameChanged, setHasNameChanged] = useState(false);
  const [isNewRoom, setIsNewRoom] = useState(false);
  const [roomName, setRoomName] = useState(localStorage.getItem('roomName') || '');
  const [roomMaxPlayers, setRoomMaxPlayers] = useState(PlayersCountList[0].value);
  const [mode, setMode] = useState('');
  const [rooms, setRooms] = useState<Array<RoomAvailable<any>>>([]);
  const [client, setClient] = useState<Client | null>(null);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const setupClient = () => {
      try {
        const host = window.document.location.host.replace(/:.*/, '');
        const port = process.env.NODE_ENV !== 'production' ? Constants.WS_PORT : window.location.port;
        const url = `${ window.location.protocol.replace('http', 'ws') }//${ host }${ port ? `:${ port }` : '' }`;
        setClient(new Client(url));
      } catch (error) {
        console.error(error);
      }
    };

    setupClient();
  }, []);

  useEffect(() => {
    const timer = setInterval(updateRooms, Constants.ROOM_REFRESH);
    updateRooms();

    return () => clearInterval(timer);
  }, [client]);

  const updateRooms = async () => {
    if (!client) return;

    const availableRooms = await client.getAvailableRooms(Constants.ROOM_NAME);
    setRooms(availableRooms);
  };

  const handlePlayerNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPlayerName(event.target.value);
    setHasNameChanged(true);
  };

  const handleNameSave = () => {
    localStorage.setItem('playerName', playerName);
    setHasNameChanged(false);
  };

  const handleRoomNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newRoomName = event.target.value;
    localStorage.setItem('roomName', newRoomName);
    setRoomName(newRoomName);
  };

  const handleRoomClick = (roomId: string) => {
    navigate(`/${ roomId }`);
  };

  const handleCreateRoomClick = () => {
    const options: Types.IRoomOptions = {
      playerName,
      roomName,
      roomMaxPlayers,
      mode,
    };

    navigate(`/new${ qs.stringify(options, true) }`);
  };

  const renderName = () => (
    <Box style={ { width: 500, maxWidth: '100%' } }>
      <View flex>
        <Inline size="thin" />
        <Text>Welcome to Board Game Jouer !</Text>
        <br />
        <Text>Pick your name</Text>
      </View>
      <Space size="xs" />
      <Input
        value={ playerName }
        placeholder="Name"
        maxLength={ Constants.PLAYER_NAME_MAX }
        onChange={ handlePlayerNameChange }
      />
      { hasNameChanged && (
        <>
          <Space size="xs" />
          <Button title="Save" text="Save" onClick={ handleNameSave } />
        </>
      ) }
    </Box>
  );

  const renderNewRoom = () => (
    <View flex style={ { alignItems: 'flex-start', flexDirection: 'column' } }>
      { !isNewRoom && (
        <Button title="Create new room" text="+ New Room" onClick={ () => setIsNewRoom(true) } />
      ) }
      { isNewRoom && (
        <View style={ { width: '100%' } }>
          <Text>Name:</Text>
          <Space size="xxs" />
          <Input
            placeholder="Name"
            value={ roomName }
            maxLength={ Constants.ROOM_NAME_MAX }
            onChange={ handleRoomNameChange }
          />
          <Space size="s" />

          <Text>Max players:</Text>
          <Space size="xxs" />
          <Select
            value={ roomMaxPlayers }
            values={ PlayersCountList }
            onChange={ (event: React.ChangeEvent<HTMLSelectElement>) => {
              setRoomMaxPlayers(event.target.value);
            } }
          />
          <Space size="s" />

          <View>
            <Button title="Create room" text="Create" onClick={ handleCreateRoomClick } />
            <Space size="xs" />
            <Button title="Cancel" text="Cancel" reversed onClick={ () => setIsNewRoom(false) } />
          </View>
        </View>
      ) }
    </View>
  );

  const renderRooms = () => {
    if (!rooms || !rooms.length) {
      return (
        <View
          flex
          center
          style={ {
            borderRadius: 8,
            backgroundColor: '#efefef',
            color: 'darkgrey',
            height: 128,
          } }
        >
          No rooms yet...
        </View>
      );
    }

    return rooms.map(({ roomId, metadata, clients, maxClients }, index) => {

      return (
        <React.Fragment key={ roomId }>
          <Room
            id={ roomId }
            roomName={ metadata.roomName }
            clients={ clients }
            maxClients={ maxClients }
            mode={ metadata.mode }
            onClick={ handleRoomClick }
          />
          { index !== rooms.length - 1 && <Space size="xxs" /> }
        </React.Fragment>
      );
    });
  };

  return (
    <View flex center style={ { padding: 32, flexDirection: 'column' } }>
      <Helmet>
        <title>{ `${ Constants.APP_TITLE } - Home` }</title>
        <meta
          name="description"
          content="Welcome to Board Game Jouer, which is an open-source multiplayer game in the browser meant to be hostable, modifiable, and playable by anyone."
        />
      </Helmet>

      <View flex center column style={ { width: 700, maxWidth: '100%' } }>
        <Space size="xs" />
        <Text style={ { color: 'white', fontSize: 13 } }>
          An open-source multiplayer game in the browser meant to be hostable, modifiable, and playable by
          anyone.
        </Text>
        <Space size="xxs" />
      </View>

      <Space size="m" />
      { renderName() }
      <Space size="m" />
      <Box style={ { width: 500, maxWidth: '100%' } }>
        { renderNewRoom() }
        <Space size="xxs" />
        <Separator />
        <Space size="xxs" />
        { renderRooms() }
        <Space size="xxs" />
      </Box>
    </View>
  );
};

export default Home;

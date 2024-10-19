import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Client } from 'colyseus.js';
import qs from 'querystringify';
import { Constants, Types } from '@jouer/common';
import { RoomAvailable } from 'colyseus.js/lib/Room';


function Room(props: {
  id: string;
  roomName: string;
  clients: number;
  maxClients: number;
  mode: string;
  onClick: (id: string) => void;
}): React.ReactElement {
  const { id, roomName, clients, maxClients, mode, onClick } = props;

  return (
    <div
      className={ `flex rounded-md cursor-pointer bg-secondary bg-opacity-10 text-text gap-2 font-jmadh text-2xl` }
      onClick={ () => onClick(id) }
    >
      <div className="flex-grow flex rounded-md justify-between items-center px-2 bg-text bg-opacity-20">
        <div title="Name"  >
          { `${ roomName || `Unknown's room` }` }
        </div>
        <div title='Players' >
          { `${ clients } / ${ maxClients }` }
        </div>
      </div>
      <button
        className="ml-auto rounded-md bg-secondary text-text py-[1px] px-4 hover:bg-text hover:text-secondary"
        type="button"
      >
        Join
      </button>
    </div>
  );
}

const Face = () => <svg width="100%" height="100%" viewBox="0 0 67 67" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="33.5" cy="33.5" r="32" stroke="currentColor" strokeWidth="3" />
  <circle cx="30.485" cy="23.785" r="2.515" fill="currentColor" stroke="currentColor" />
  <circle cx="51.9249" cy="23.785" r="2.515" fill="currentColor" stroke="currentColor" />
</svg>

const PlayersCountList = Constants.ROOM_PLAYERS_SCALES.map((value) => ({
  value,
  title: `${ value } players`,
}));

const Home: React.FC = () => {
  const [playerName, setPlayerName] = useState(localStorage.getItem('playerName') || '');
  const [hasNameChanged, setHasNameChanged] = useState(false);
  const [isNewRoom, setIsNewRoom] = useState(false);
  const [roomName, setRoomName] = useState(localStorage.getItem('roomName') || 'DnD\'s happy Jouer Time');
  const [roomMaxPlayers, setRoomMaxPlayers] = useState(4);
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
    <div className='bg-primary text-text shadow-md w-full flex flex-col gap-3 px-6 py-2 rounded-md '>
      <div className='flex items-center justify-between'>
        <div className='w-16 h-16 retina:w-12'>
          <Face />
        </div>
        <div className='font-kreon mb-4 text-7xl retina:text-5xl'>𝓳  𝓸  𝓾  𝓮  𝓻</div>
      </div>
      <div className='flex font-jmadh items-center gap-3 text-2xl justify-between'>
        <div className='text-4xl mb-2 '>Name</div>
        <input
          value={ playerName }
          placeholder="Your Name"
          maxLength={ Constants.PLAYER_NAME_MAX }
          onChange={ handlePlayerNameChange }
          className='rounded-md font-jmadh w-full px-2 placeholder:text-amber-700 placeholder:text-opacity-30 bg-white text-dtext'
        />
        <div title='random one name for you' className='bg-dice min-w-8 w-8 h-8 bg-cover cursor-pointer' onClick={ () => {
          setPlayerName(Constants.NAME_LIST[Math.floor(Math.random() * Constants.NAME_LIST.length)]);
          setHasNameChanged(true);
        } } />
        { hasNameChanged && <div className='bg-secondary px-1 rounded-md w-16 min-w-16 cursor-pointer text-center' onClick={ handleNameSave }>Save</div> }
      </div>
    </div>
  );

  const renderNewRoom = () => (
    <div className='flex flex-col gap-3 font-jmadh'>
      { !isNewRoom && (
        <div title="Create new room" className='bg-secondary px-1 rounded-md h-10 text-center text-3xl cursor-pointer' onClick={ () => setIsNewRoom(true) } >
          Create Room
        </div>
      ) }
      { isNewRoom && (
        <div className='flex flex-col font-jmadh w-full text-2xl text-text gap-3'>
          <div className='flex justify-between items-center gap-3'>
            <label className='min-w-28 text-right text-3xl'>Name</label>
            <input
              placeholder="Name"
              value={ roomName }
              maxLength={ Constants.ROOM_NAME_MAX }
              onChange={ handleRoomNameChange }
              className='w-full border rounded-md leading-5 px-2 py-1 text-dtext placeholder:text-amber-700 placeholder:text-opacity-30'
            />
          </div>
          <div className='flex justify-between items-center gap-3 mb-1'>
            <label className='min-w-28 text-right text-3xl mb-2'>Max players</label>
            <select
              value={ roomMaxPlayers }
              onChange={ (event) => setRoomMaxPlayers(Number(event.target.value)) }
              className='w-full border bg-white rounded-md px-2 py-1 text-dtext placeholder:text-amber-700 placeholder:text-opacity-30'
            >
              { PlayersCountList.map(({ value, title }) => (
                <option key={ value } value={ value }>{ title }</option>
              )) }
            </select>
          </div>
          <div className='flex justify-end mt-2 gap-6'>
            <button className='bg-text text-dtext py-1 px-4 rounded' onClick={ () => setIsNewRoom(false) }>Cancel</button>
            <button className='bg-secondary text-text py-1 px-4 rounded' onClick={ handleCreateRoomClick }>Create room</button>
          </div>
        </div>
      ) }
    </div>
  );

  const renderRooms = () => {
    if (!rooms || !rooms.length) {
      return (
        <div className='flex items-center justify-center rounded-md h-24 text-2xl bg-text bg-opacity-10 font-jmadh'>
          No rooms yet...
        </div>
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
        </React.Fragment>
      );
    });
  };

  return (
    <div className='m-auto max-w-md pt-12 gap-5 flex flex-col items-center retina:max-w-sm'>
      { renderName() }
      <div className='bg-primary text-text shadow-md w-full flex flex-col gap-3 p-6 rounded-md '>
        { renderNewRoom() }
        <div className='bg-wave h-1 mb-2 mt-2 bg-contain'></div>
        { renderRooms() }
      </div>
    </div>
  );
};

export default Home;

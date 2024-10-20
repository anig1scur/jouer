import React, { Fragment } from 'react';
import { Models } from '@jouer/common';
import Draggable from 'react-draggable';
import Hand from '../../game/assets/hand.png';
import Face from '../../game/assets/face.png';
import Score from '../../game/assets/score.png';

export const Players = React.memo(
  (props: { players: Models.PlayerJSON[] }): React.ReactElement | null => {

    return (
      <Draggable>
        <div className='select-none absolute top-2 left-3 cursor-move rounded-xl backdrop-blur-sm shadow p-3 flex flex-col gap-2 retina:text-xs'>
          {
            props.players.map((player, index) => (
              <Player key={ player.id } player={ player } />
            ))
          }

        </div>
      </Draggable>
    );
  },
);

/**
 * Render a single message.
 */
function Player(props: { player: Models.PlayerJSON }): React.ReactElement {
  const { player } = props;

  return (
    <div className="pointer-events-none flex items-center justify-between text-dtext p-1 rounded-lg gap-3">
      <div className="flex items-center flex-col mr-2">
        <img src={ Face } alt="Face" className="w-12 h-12 retina:w-8 retina:h-8" />
        <div className="text-brown-700">{ player.name }</div>
      </div>
      <div className="flex flex-col items-center bg-[#DFA36E] bg-opacity-20 shadow-md gap-3 p-2 rounded-md">
        <div className="flex items-center gap-2">
          <img src={ Hand } alt="Hand" className="w-6 mr-1 retina:w-4 " />
          <div className="text-brown-700">{ player.cardCount }</div>
        </div>
        <div className="flex items-center gap-2">
          <img src={ Score } alt="Score" className="w-6 mr-1 retina:w-4" />
          <div className="text-brown-700">{ player.score }</div>
        </div>
      </div>
    </div>
  );
}
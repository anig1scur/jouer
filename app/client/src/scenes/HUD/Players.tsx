import React, { Fragment } from 'react';
import { Models } from '@jouer/common';
import Draggable from 'react-draggable';
import Hand from '../../assets/imgs/hand.png';
import Score from '../../assets/imgs/score.png';

export const Players = React.memo(
  (props: { players: Models.PlayerJSON[] }): React.ReactElement | null => {

    return (
      <Draggable>
        <div className='select-none absolute top-2 left-3 cursor-move rounded-xl backdrop-blur-sm shadow p-3 flex flex-col gap-2 retina:text-sm retina:gap-1'>
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
      <div className="flex items-center flex-col">
        <div className='bg-face w-12 h-12 retina:w-8 retina:h-8 rounded-full bg-contain' />
        <div className="text-brown-700">{ player.name }</div>
      </div>
      <div className="flex flex-col items-center bg-[#DFA36E] bg-opacity-20 shadow-md gap-2 p-2 rounded-md">
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
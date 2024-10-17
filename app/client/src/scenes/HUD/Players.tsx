import React, { Fragment } from 'react';
import { Models } from '@jouer/common';
import Draggable from 'react-draggable';

export const Players = React.memo(
  (props: { players: Models.PlayerJSON[], me: Models.PlayerJSON }): React.ReactElement | null => {

    return (
      <Draggable>
        <div className='absolute top-2 left-3 cursor-move rounded-xl backdrop-blur-md shadow p-3 bg-[#DC905A] bg-opacity-20'>
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
    <div>
      { player.name }
    </div>
  );
}

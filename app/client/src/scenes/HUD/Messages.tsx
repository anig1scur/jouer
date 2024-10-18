import React, { Fragment } from 'react';
import { Models } from '@jouer/common';
import Draggable from 'react-draggable';
/**
 * Render the messages from the server.
 */
export const Messages = React.memo(
  (props: { messages: Models.MessageJSON[] }): React.ReactElement | null => {
    const { messages } = props;
    if (!messages.length) {
      return null;
    }

    console.log("messages", messages);

    return (
      <Draggable>
        <div className='select-none absolute w-52 max-h-36 top-2 right-3 cursor-move rounded-xl backdrop-blur-sm shadow p-3 bg-[#DC905A] bg-opacity-20'>
          { messages.map((message, index) => (
            <Message key={ message.ts } message={ message } />
          )) }
        </div>
      </Draggable>
    );
  },
);

/**
 * Render a single message.
 */
function Message(props: { message: Models.MessageJSON }): React.ReactElement {
  const { message } = props;

  return (
    <div className='text-[#ffeec7] flex gap-2 items-center'>
      <div className='text-sm font-semibold text-opacity-80'>{ getMMSSFromTimestamp(message.ts) }</div>
      {/* <div className="text-sm font-semibold text-opacity-80">{ `[${ message.from }]` }</div> */ }
      <div className="text-base text-[#70422F]">{ getFormattedMessage(message) }</div>
    </div>
  );
}

function getMMSSFromTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toTimeString().slice(0, 5);
}

function getFormattedMessage(message: Models.MessageJSON): string {
  switch (message.type) {
    case 'waiting':
      return 'Waiting for other players...';
    case 'start':
      return 'Game starts!';
    case 'stop':
      return 'Game ends...';
    case 'joined':
      return `${ message.params.name } joins.`;
    case 'won':
      return `${ message.params.name } wins!`;
    case 'left':
      return `${ message.params.name } left.`;
    case 'timeout':
      return `Timeout...`;
    case 'tryBorrow':
      return `${ message.params.name } 正在借牌`;
    case 'borrow':
      return `${ message.params.name } 借走了 ${ message.params.card }`;
    case 'jouer':
      return `${ message.params.name } 想表演`;
    case 'turn':
      return `现在是 ${ message.params.name } 的回合`;
    default:
      return '';
  }
}

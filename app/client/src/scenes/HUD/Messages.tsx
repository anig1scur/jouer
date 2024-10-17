import { Inline, Space, Text, View } from '../../components';
import React, { CSSProperties, Fragment } from 'react';
import { Models } from '@jouer/common';

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
      <>
        { messages.map((message, index) => (
          <Fragment key={ index }>
            <Message key={ message.ts } message={ message } />
            { messages.length > 1 && index < messages.length - 1 ? <Space size="xs" /> : null }
          </Fragment>
        )) }
      </>
    );
  },
);

/**
 * Render a single message.
 */
function Message(props: { message: Models.MessageJSON }): React.ReactElement {
  const { message } = props;

  return (
    <div>
      <div>{ `${ message.from }:` }</div>
      <div>{ getFormattedMessage(message) }</div>
    </div>
  );
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
    default:
      return '';
  }
}

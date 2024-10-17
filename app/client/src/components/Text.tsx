import React, { CSSProperties } from 'react';

const TEXT: CSSProperties = {};

export function Text(props: { children: React.ReactNode; style?: CSSProperties }): React.ReactElement {
  const { children, style } = props;

  return (
    <p
    className='text'
      style={ {
        ...TEXT,
        ...style,
      } }
    >
      { children }
    </p>
  );
}

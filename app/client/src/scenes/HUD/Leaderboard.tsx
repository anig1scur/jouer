import React from 'react';
import { Models } from '@jouer/common';

export const Leaderboard = ({ players }: { players: Models.PlayerJSON[] }) => {

  const sortedPlayers = players.sort((a, b) => {
    const scoreA = a.borrowedCount + a.eatCount - a.cardCount;
    const scoreB = b.borrowedCount + b.eatCount - b.cardCount;
    return scoreB - scoreA;
  });


  return (
    <div className="inset-0 bg-black bg-opacity-40 flex items-center justify-center absolute z-50">
      <div className="bg-amber-100 text-dtext text-center p-6 rounded-lg shadow-md max-w-2xl w-full mx-4 relative">
        <h1 className="text-5xl text-dtext mb-4 text-center font-kreon">LEADERBOARD</h1>
        <table className="w-full border-collapse">
          <thead>
            <tr className="text-xl leading-10 font-kreon after:absolute after:bottom-0 after:left-0 after:w-full after:h-3 after:bg-bline after:bg-contain relative">
              <th className="text-center py-2  text-dtext">player</th>
              <th className="text-center py-2  text-dtext">borrowedCount</th>
              <th className="text-center py-2  text-dtext">eatCount</th>
              <th className="text-center py-2  text-dtext">hand</th>
              <th className="text-center py-2  text-dtext">score</th>
            </tr>
          </thead>
          <tbody>
            { sortedPlayers.map((player, index) => (
              <tr key={ index } className="border-b border-dtext border-dashed font-jmadh text-2xl ">
                <td className="py-2 text-dtext">{ player.name }</td>
                <td className="text-center py-2  text-dtext">{ player.borrowedCount }</td>
                <td className="text-center py-2  text-dtext">{ player.eatCount }</td>
                <td className="text-center py-2  text-dtext">{ player.cardCount }</td>
                <td className="text-center py-2  text-dtext">
                  { player.borrowedCount + player.eatCount - player.cardCount }
                </td>
              </tr>
            )) }
          </tbody>
        </table>
      </div>
    </div>
  );
};
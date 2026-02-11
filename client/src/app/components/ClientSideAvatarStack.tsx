"use client"

import React from "react";

interface ConnectedUser  {
    clientId: number;
    name:string ;
    color:string;
    avatar?:string;
}

export const ClientSideAvtarStack = ({users}: {users:ConnectedUser[]}) => {
  return (
    <div className="flex items-center -space-x-2 overflow-hidden py-1 px-2">
      {users.map((user) => (
        <div
          key={user.clientId}
          className="relative inline-block h-8 w-8 rounded-full ring-2 ring-zinc-900 bg-zinc-800 flex items-center justify-center cursor-help transition-transform hover:scale-110 hover:z-10"
          title={user.name} // Shows name on hover
          style={{ backgroundColor: user.color || "#3b82f6" }}
        >
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            <span className="text-xs font-bold text-white uppercase leading-none">
              {user.name?.charAt(0)}
            </span>
          )}
        </div>
      ))}
      
      {users.length === 0 && (
         <div className="text-zinc-500 text-xs italic px-2 opacity-50">Offline</div>
      )}
    </div>
  );
};
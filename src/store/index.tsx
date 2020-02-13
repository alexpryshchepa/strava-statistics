import React from 'react';
import initialState from './state';
import { State, Action } from './types';

export type Context = [State, React.Dispatch<Action>];

const AppContext = React.createContext<Context>([initialState, () => {}]);

export const AppContextProvider = AppContext.Provider;
export const AppContextConsumer = AppContext.Consumer;

export default AppContext;

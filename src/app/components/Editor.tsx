import { useEffect,useRef } from "react";
import Editor from '@monaco-editor/react';
import * as y from 'yjs';
import { WebSocketProvider } from 'y-websocket';
import {MonacoBinding} from 'y-monaco'

export const ColabrativeEditor =({})
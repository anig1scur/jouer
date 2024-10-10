import * as PIXI from 'pixi.js';
import { SCALE_MODES } from '@pixi/core';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import "./style.css"
// PIXI.settings.SCALE_MODE = SCALE_MODES.NEAREST;
// PIXI.settings.ROUND_PIXELS = true;

ReactDOM.render(<App />, document.getElementById('root'));

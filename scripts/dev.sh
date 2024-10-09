#!/bin/bash

yarn concurrently --kill-others-on-fail \
    "yarn build" \
    "yarn nodemon ./app/server/dist/index.js" \
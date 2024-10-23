#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("source-map-support/register");
const cdk = require("aws-cdk-lib");
const bot_stack_1 = require("../lib/bot-stack");
const app = new cdk.App();
new bot_stack_1.BotStack(app, 'BotStack', {
    env: { account: '533266980557', region: 'us-east-1' },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYm90LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYm90LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUNBLHVDQUFxQztBQUNyQyxtQ0FBbUM7QUFDbkMsZ0RBQTRDO0FBRTVDLE1BQU0sR0FBRyxHQUFHLElBQUksR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBQzFCLElBQUksb0JBQVEsQ0FBQyxHQUFHLEVBQUUsVUFBVSxFQUFFO0lBQzVCLEdBQUcsRUFBRSxFQUFFLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSxFQUFFLFdBQVcsRUFBRTtDQUV0RCxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIjIS91c3IvYmluL2VudiBub2RlXG5pbXBvcnQgJ3NvdXJjZS1tYXAtc3VwcG9ydC9yZWdpc3Rlcic7XG5pbXBvcnQgKiBhcyBjZGsgZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0IHsgQm90U3RhY2sgfSBmcm9tICcuLi9saWIvYm90LXN0YWNrJztcblxuY29uc3QgYXBwID0gbmV3IGNkay5BcHAoKTtcbm5ldyBCb3RTdGFjayhhcHAsICdCb3RTdGFjaycsIHtcbiAgZW52OiB7IGFjY291bnQ6ICc1MzMyNjY5ODA1NTcnLCByZWdpb246ICd1cy1lYXN0LTEnIH0sXG5cbn0pOyJdfQ==
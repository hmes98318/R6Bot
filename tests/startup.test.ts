import assert from 'node:assert/strict';
import {test} from 'node:test';
import {setImmediate} from 'node:timers/promises';

import {Client, Events, Status} from 'discord.js';

import {loginBot} from '../src/bot.ts';

await test('waits for clientReady when login resolves first', async (context) => {
    const client = new Client({intents: []});
    context.after(() => client.destroy());
    context.mock.method(client, 'login', () => Promise.resolve('test-token'));
    let settled = false;
    const login = loginBot(client, 'test-token').then((readyClient) => {
        settled = true;
        return readyClient;
    });
    await setImmediate();
    assert.equal(settled, false);
    assert.equal(client.isReady(), false);

    client.ws.status = Status.Ready;
    assert.ok(client.isReady());
    client.emit(Events.ClientReady, client);
    assert.equal(await login, client);
    assert.equal(client.listenerCount(Events.ClientReady), 0);
});

await test('removes readiness listeners after a failed login', async (context) => {
    const client = new Client({intents: []});
    context.after(() => client.destroy());
    context.mock.method(client, 'login', () =>
        Promise.reject(new Error('Example login failure')));

    await assert.rejects(loginBot(client, 'test-token'), /Example login failure/u);
    assert.equal(client.listenerCount(Events.ClientReady), 0);
    assert.equal(client.listenerCount(Events.Error), 0);
});

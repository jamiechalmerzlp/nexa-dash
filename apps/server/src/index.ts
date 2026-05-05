import { readFileSync } from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { urlJoin } from '@nexadash/common';
import compression from 'compression';
import cors from 'cors';
import express from 'express';
import { lookup as mimeLookup } from 'mime-types';
import type { Unsubscribable } from 'rxjs';
import { Server } from 'socket.io';
import { CONFIG } from './config';
import { getDynamicServerInfo } from './dynamic-info';
import {
  setupHostSpecific,
  setupNetworking,
  setupOsVersion,
  tearDownHostSpecific,
} from './setup';
import {
  getStaticServerInfo,
  getStaticServerInfoObs,
  loadStaticServerInfo,
} from './static-info';

const app = express();
const router = express.Router();
const server = http.createServer(app);
const viewIndexPath = path.join(__dirname, '../../view/dist/index.html');
const io = new Server(server, {
  cors: CONFIG.disable_integrations
    ? {}
    : {
        origin: '*',
      },
  path: `/${urlJoin(CONFIG.routing_path, '/socket')}`,
});

if (!CONFIG.disable_integrations) {
  app.use(cors());
}

app.use(compression());
app.use(CONFIG.routing_path, router);

if (process.env.NODE_ENV === 'production') {
  // Serve static files from the React app
  router.use(
    express.static(path.join(__dirname, '../../view/dist'), {
      maxAge: '1y',
      setHeaders: (res, path) => {
        if (mimeLookup(path) === 'text/html') {
          res.setHeader('Cache-Control', 'public, max-age=0');
        }
      },
    }),
  );
}

// Allow integrations
if (!CONFIG.disable_integrations) {
  const getVersionFile = () => {
    try {
      return JSON.parse(
        readFileSync(path.join(__dirname, '../../../version.json'), 'utf-8'),
      );
    } catch (_e) {
      console.warn(
        'Version file not found. This is normal on from-source builds.',
      );
      return {};
    }
  };

  const versionFile = getVersionFile();
  router.get('/config', (_, res) => {
    res.send({
      config: {
        ...CONFIG,
        overrides: undefined,
      },
      version: versionFile.version,
      buildhash: versionFile.buildhash,
    });
  });

  router.get('/info', (_, res) => {
    res.send({ ...getStaticServerInfo(), config: undefined });
  });
}

// Launch the server
server.listen(CONFIG.port, async () => {
  console.log(`listening on *:${CONFIG.port}`);

  await setupHostSpecific();
  await setupNetworking();
  await setupOsVersion();
  await loadStaticServerInfo();
  const obs = getDynamicServerInfo();

  // Allow integrations
  if (!CONFIG.disable_integrations) {
    router.get('/load/cpu', async (_, res) => {
      res.send(await obs.cpu.getCurrentValue());
    });
    router.get('/load/ram', async (_, res) => {
      res.send({ load: await obs.ram.getCurrentValue() });
    });
    router.get('/load/storage', async (_, res) => {
      res.send(await obs.storage.getCurrentValue());
    });
    router.get('/load/network', async (_, res) => {
      res.send(await obs.network.getCurrentValue());
    });
    router.get('/load/gpu', async (_, res) => {
      res.send(await obs.gpu.getCurrentValue());
    });
  }

  if (process.env.NODE_ENV === 'production') {
    // Serve the SPA shell for any unmatched GET request under the routing path.
    router.use((req, res, next) => {
      if (req.method !== 'GET') {
        next();
        return;
      }

      res.setHeader('Cache-Control', 'public, max-age=0');
      res.sendFile(viewIndexPath);
    });
  }

  // Send current system status
  io.on('connection', (socket) => {
    const subscriptions: Unsubscribable[] = [];

    subscriptions.push(
      getStaticServerInfoObs().subscribe((staticInfo) => {
        socket.emit('static-info', staticInfo);
      }),
    );

    subscriptions.push(
      obs.cpu.subscribe((cpu) => {
        socket.emit('cpu-load', cpu);
      }),
    );

    subscriptions.push(
      obs.ram.subscribe((ram) => {
        socket.emit('ram-load', ram);
      }),
    );

    subscriptions.push(
      obs.storage.subscribe(async (storage) => {
        socket.emit('storage-load', storage);
      }),
    );

    subscriptions.push(
      obs.network.subscribe(async (network) => {
        socket.emit('network-load', network);
      }),
    );

    subscriptions.push(
      obs.gpu.subscribe(async (gpu) => {
        socket.emit('gpu-load', gpu);
      }),
    );
    socket.on('disconnect', () => {
      subscriptions.forEach((sub) => {
        sub.unsubscribe();
      });
    });
  });

});

server.on('error', console.error);

process.on('uncaughtException', (e) => {
  console.error(e);
  tearDownHostSpecific();
  process.exit(1);
});

process.on('unhandledRejection', (e) => {
  console.error(e);
  tearDownHostSpecific();
  process.exit(1);
});

process.on('SIGINT', () => {
  console.info('SIGINT signal received.');
  process.exit(0);
});

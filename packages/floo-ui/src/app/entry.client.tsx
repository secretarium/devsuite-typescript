import { RemixBrowser } from '@remix-run/react';
import { hydrateRoot } from 'react-dom/client';

const container = document;
hydrateRoot(container, <RemixBrowser />);

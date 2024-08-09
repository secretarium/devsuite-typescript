/* prettier-ignore-start */

/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file is auto-generated by TanStack Router

import { createFileRoute } from '@tanstack/react-router'

// Import Routes

import { Route as rootRoute } from './routes/__root'

// Create Virtual Routes

const IndexLazyImport = createFileRoute('/')()
const LoginIndexLazyImport = createFileRoute('/login/')()
const LoginTotpLazyImport = createFileRoute('/login/totp')()
const LoginEcodeLazyImport = createFileRoute('/login/ecode')()

// Create/Update Routes

const IndexLazyRoute = IndexLazyImport.update({
  path: '/',
  getParentRoute: () => rootRoute,
} as any).lazy(() => import('./routes/index.lazy').then((d) => d.Route))

const LoginIndexLazyRoute = LoginIndexLazyImport.update({
  path: '/login/',
  getParentRoute: () => rootRoute,
} as any).lazy(() => import('./routes/login/index.lazy').then((d) => d.Route))

const LoginTotpLazyRoute = LoginTotpLazyImport.update({
  path: '/login/totp',
  getParentRoute: () => rootRoute,
} as any).lazy(() => import('./routes/login/totp.lazy').then((d) => d.Route))

const LoginEcodeLazyRoute = LoginEcodeLazyImport.update({
  path: '/login/ecode',
  getParentRoute: () => rootRoute,
} as any).lazy(() => import('./routes/login/ecode.lazy').then((d) => d.Route))

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexLazyImport
      parentRoute: typeof rootRoute
    }
    '/login/ecode': {
      id: '/login/ecode'
      path: '/login/ecode'
      fullPath: '/login/ecode'
      preLoaderRoute: typeof LoginEcodeLazyImport
      parentRoute: typeof rootRoute
    }
    '/login/totp': {
      id: '/login/totp'
      path: '/login/totp'
      fullPath: '/login/totp'
      preLoaderRoute: typeof LoginTotpLazyImport
      parentRoute: typeof rootRoute
    }
    '/login/': {
      id: '/login/'
      path: '/login'
      fullPath: '/login'
      preLoaderRoute: typeof LoginIndexLazyImport
      parentRoute: typeof rootRoute
    }
  }
}

// Create and export the route tree

export const routeTree = rootRoute.addChildren({
  IndexLazyRoute,
  LoginEcodeLazyRoute,
  LoginTotpLazyRoute,
  LoginIndexLazyRoute,
})

/* prettier-ignore-end */

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/",
        "/login/ecode",
        "/login/totp",
        "/login/"
      ]
    },
    "/": {
      "filePath": "index.lazy.tsx"
    },
    "/login/ecode": {
      "filePath": "login/ecode.lazy.tsx"
    },
    "/login/totp": {
      "filePath": "login/totp.lazy.tsx"
    },
    "/login/": {
      "filePath": "login/index.lazy.tsx"
    }
  }
}
ROUTE_MANIFEST_END */

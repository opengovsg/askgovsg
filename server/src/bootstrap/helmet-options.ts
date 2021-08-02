import { baseConfig } from './config/base'

export const helmetOptions = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com/'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com/'],
      imgSrc: [
        "'self'",
        'data:',
        'https://www.google-analytics.com/',
        'https://www.googletagmanager.com/',
        'https://stats.g.doubleclick.net/',
        'https://secure.gravatar.com/',
        baseConfig.logoHost,
      ],
      scriptSrc: [
        "'self'",
        'https://www.google-analytics.com/',
        'https://ssl.google-analytics.com/',
        'https://www.googletagmanager.com/',
        'https://*.google.com',
        'https://www.gstatic.com',
        'https://edge.fullstory.com',
        // TODO: Remove this by removing script entries in index.html
        'https://code.jquery.com',
        'https://cdnjs.cloudflare.com',
        'https://maxcdn.bootstrapcdn.com',
        // TODO: Remove this by removing stack-icons and boxicons
        'https://unpkg.com',
      ],
      connectSrc: [
        "'self'",
        'https://www.google-analytics.com/',
        'https://ssl.google-analytics.com/',
        'https://www.googletagmanager.com/',
        'https://rs.fullstory.com',
        // TODO: Remove this by removing stack-icons and boxicons
        'https://unpkg.com',
      ],
      frameAncestors: ["'self'"],
      upgradeInsecureRequests: [],
    },
    reportOnly: false,
  },
}

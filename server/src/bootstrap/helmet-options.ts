import type { HelmetOptions } from 'helmet'
import { baseConfig } from './config/base'
import { fileConfig } from './config/file'

export const helmetOptions: HelmetOptions = {
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
        `https://${fileConfig.fileBucketName}/`,
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
      ],
      connectSrc: [
        "'self'",
        'https://www.google-analytics.com/',
        'https://ssl.google-analytics.com/',
        'https://www.googletagmanager.com/',
        'https://rs.fullstory.com',
      ],
      frameSrc: ["'self'", 'https://www.google.com'],
      frameAncestors: ["'self'"],
      upgradeInsecureRequests: [],
    },
    reportOnly: false,
  },
  crossOriginResourcePolicy: { policy: 'same-site' },
}

//TODO FALTA AÑADIR EL .env correctamente en este fichero.

export default () => {
  // Fallback para desarrollo local si no se carga el .env
  const mongoUri = 'mongodb://localhost:27017/project-base-dev';

  return {
    port: parseInt(process.env.PORT || '3000', 10),
    database: {
      uri: mongoUri,
    },
    jwt: {
      secret: 'your-super-secret-jwt-key-change-in-production',
      expiresIn: '1h',
      refreshExpiresIn: '7d',
    },
    google: {
      clientId: 'your-google-client-id',
      clientSecret: 'your-google-client-secret',
    },
    cors: {
      origin: 'http://localhost:4200',
    },
  };
};

/* 

export default () => {
  console.log('🔍 DEBUG - MONGODB_URI from env:', process.env.MONGODB_URI);

  // Fallback para desarrollo local si no se carga el .env
  const mongoUri =
    process.env.MONGODB_URI || 'mongodb://localhost:27017/project-base-dev';

  console.log('🚀 Using MongoDB URI:', mongoUri.substring(0, 50) + '...');

  return {
    port: parseInt(process.env.PORT || '3000', 10),
    database: {
      uri: mongoUri,
    },
    jwt: {
      secret:
        process.env.JWT_SECRET ||
        'your-super-secret-jwt-key-change-in-production',
      expiresIn: process.env.JWT_EXPIRES_IN || '1h',
      refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || 'your-google-client-id',
      clientSecret:
        process.env.GOOGLE_CLIENT_SECRET || 'your-google-client-secret',
    },
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:4200',
    },
  };
};
 */

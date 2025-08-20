export default () => {
  return {
    port: 3000,
    database: {
      uri: 'mongodb://localhost:27017/project-base-dev',
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

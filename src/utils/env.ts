export default () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  mongoUrl: process.env.MONGO_URL || 'mongodb://localhost:27017/learn-nest-basics',
});

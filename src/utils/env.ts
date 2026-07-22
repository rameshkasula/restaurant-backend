export default () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  mongoUrl:
    process.env.MONGO_URL ||
    'mongodb+srv://zentra421_db_user:vQv3TpoLlNhmlEza@cluster0.tfgcuuh.mongodb.net/restroos?appName=Cluster0',
  mail: {
    host: process.env.MAIL_HOST || 'smtp-relay.brevo.com',
    port: parseInt(process.env.MAIL_PORT || '587', 10),
    user: process.env.MAIL_USER || '',
    pass: process.env.MAIL_PASS || '',
    from:
      process.env.MAIL_FROM ||
      '"TheSmartBills Support" <noreply@thesmartbills.com>',
  },
});

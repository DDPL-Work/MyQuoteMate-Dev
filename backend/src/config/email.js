const Joi = require('joi');
const dotenv = require('dotenv');

dotenv.config();

const envVarsSchema = Joi.object({
    SMTP_HOST: Joi.string().hostname().default('smtp.example.com'),
    SMTP_PORT: Joi.number().default(587),
    SMTP_USER: Joi.string().default('user'),
    SMTP_PASS: Joi.string().default('pass'),
    SMTP_FROM_EMAIL: Joi.string().email().default('noreply@myquotemate.com'),
    SMTP_FROM_NAME: Joi.string().default('MyQuoteMate'),
}).unknown().required();

const { value: envVars, error } = envVarsSchema.validate(process.env);

if (error) {
    throw new Error(`Config validation error: ${error.message}`);
}

module.exports = {
    host: envVars.SMTP_HOST,
    port: envVars.SMTP_PORT,
    auth: {
        user: envVars.SMTP_USER,
        pass: envVars.SMTP_PASS,
    },
    from: {
        email: envVars.SMTP_FROM_EMAIL,
        name: envVars.SMTP_FROM_NAME,
    },
};

const jwt = require("jsonwebtoken")

export const generateJwt = async (_id: string) => {
  try {
    const payload = { _id };
    const token = jwt.sign(payload, process.env.key_Token, {
      expiresIn: '24h',
    });
    return { error: false, token: token };
  } catch (error) {
    return { error: true };
  }
};

const bcrypt = require("bcrypt")

export async function passwordencrypt(password: string) {
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);
  return passwordHash;
}

export async function passwordvalidation(password: string) {
  const passvalid = /^[a-zA-Z0-9@#$&%]+$/;
  return passvalid.test(password);
}

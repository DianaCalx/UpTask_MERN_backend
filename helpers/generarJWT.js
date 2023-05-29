import jwt from "jsonwebtoken";

const generarJWT = (id) => {
  return jwt.sign(  //sign permite generar un JWT
    { id },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
}

export default generarJWT;

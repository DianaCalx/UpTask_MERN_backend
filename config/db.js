import mongoose from "mongoose";

const conectarBD = async () => {
  console.log(process.env.MONGO_URI)
  try {
    const connection = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log(connection.connection.host)

    const url = `${connection.connection.host}:${connection.connection.port}`;

    console.log(`MongoDB conectado en: ${url}`);

  } catch (error) {
    console.log(`error: ${error.message}`);
    process.exit(1); //finalizar el proceso de conexion a la BD
  }
}

export default conectarBD;
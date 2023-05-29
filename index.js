import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import conectarBD from "./config/db.js";
import usuarioRoutes from "./routes/usuarioRoutes.js"
import proyectoRoutes from "./routes/proyectoRoutes.js"
import tareaRoutes from "./routes/tareaRoutes.js"

const app = express();
app.use(express.json()); //Las request ya van a poder procesar la info de tipo json

dotenv.config(); //va a buscar el archivo .env

conectarBD();

//Configurar cors
const whiteList = [process.env.FRONTEND_URL];

const corsOptions = {
  origin: function (origin, callback) {
    if (whiteList.includes(origin)) {
      //Puede consultar la api
      callback(null, true); // No hay error pero le damos el acceso con un true
    } else {
      //No está permitido
      callback(new Error("Error de Cors"));
    }
  }
}

app.use(cors(corsOptions));

//Routing
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/proyectos", proyectoRoutes);
app.use("/api/tareas", tareaRoutes);

const PORT = process.env.PORT || 4000; //procees.env.PORT se genera en produccion y si no existe se usa el 4000

const servidor = app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`)
});

//Socket.io
import { Server } from 'socket.io'

const io = new Server(servidor, {
  pingTimeout: 60000,
  cors: {
    origin: process.env.FRONTEND_URL,
  }
})

io.on('connection', (socket) => {
  // console.log('Conectado a socket.io');

  //Definir los eventos de socket io
  socket.on('abrir proyecto', (proyecto) => {
    socket.join(proyecto)
  })

  socket.on('nueva tarea', (tarea) => {
    const proyecto = tarea.proyecto
    socket.to(proyecto).emit('tarea agregada', tarea)
  })

  socket.on('eliminar tarea', (tarea) => {
    const proyecto = tarea.proyecto
    socket.to(proyecto).emit('tarea eliminada', tarea)
  })

  socket.on('actualizar tarea', tarea => {

    const proyecto = tarea.proyecto
    socket.to(proyecto).emit('tarea actualizada', tarea)
  })

  socket.on('cambiar estado', tarea => {
    const proyecto = tarea.proyecto._id
    socket.to(proyecto).emit('nuevo estado', tarea)
  })
})
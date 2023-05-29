import Proyecto from "../models/Proyecto.js"
import Tarea from "../models/Tarea.js"
import Usuario from "../models/Usuario.js"

const obtenerProyectos = async (req, res) => {

  console.log(req.usuario)

  const proyectos = await Proyecto.find({
    '$or': [
      { colaboradores: { $in: req.usuario } }, // traer los proyectos en los que soy colaborador
      { creador: { $in: req.usuario } } //obtener los proyectos en los que soy creador
    ]
  })
    .select('-tareas');

  res.json(proyectos)
}

const nuevoProyecto = async (req, res) => {
  const proyecto = new Proyecto(req.body);
  proyecto.creador = req.usuario._id

  try {
    const proyectoAlmacenado = await proyecto.save();
    res.json(proyectoAlmacenado);
  } catch (error) {
    console.log(error);
  }

}

const obtenerProyecto = async (req, res) => {

  const { id } = req.params;

  const buscarProyectoExistente = async (id) => {
    try {
      const busqueda = await Proyecto
        .findById(id)
        .populate({ path: 'tareas', populate: { path: 'completado', select: "nombre" } }) // traer las tareas del proyecto y quien las completo
        .populate('colaboradores', "nombre email");

      if (!busqueda) return;
      return busqueda;

    } catch (error) {
      return null;
    }
  };

  const proyecto = await buscarProyectoExistente(id);

  if (!proyecto) {
    const error = new Error("Proyecto no encontrado");
    return res.status(401).json({ msg: error.message });
  }

  //Verificar que la persona que esta tratando de acceder al proyecto es quien lo creo
  if (proyecto.creador.toString() !== req.usuario._id.toString()
    && !proyecto.colaboradores.some(colaborador => colaborador._id.toString() === req.usuario._id.toString())) {
    const error = new Error("Acción no válida");
    return res.status(401).json({ msg: error.message });
  }

  //Obtener tareas del proyecto tambien

  res.json(proyecto);
}

const editarProyecto = async (req, res) => {

  const { id } = req.params;

  const proyecto = await Proyecto.findById(id);

  if (!proyecto) {
    const error = new Error("No encontrado");
    return res.status(404).json({ msg: error.message });
  }

  //Solo la persona que lo creo puede modificarlo
  if (proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error("Acción no válida");
    return res.status(401).json({ msg: error.message });
  }

  // proyecto.nombre = req.body.nombre || proyecto.nombre
  // proyecto.descripcion = req.body.descripcion || proyecto.descripcion
  // proyecto.fechaEntrega = req.body.fechaEntrega || proyecto.fechaEntrega
  // proyecto.cliente = req.body.cliente || proyecto.cliente}

  try {
    // const proyecto = await proyecto.save();
    const proyectoActualizar = await Proyecto.findByIdAndUpdate(id, req.body, { new: true });
    res.json(proyectoActualizar);
  } catch (error) {
    console.log(error)
  }

}

const eliminarProyecto = async (req, res) => {
  const { id } = req.params;

  const proyecto = await Proyecto.findById(id);

  if (!proyecto) {
    const error = new Error("No encontrado");
    return res.status(404).json({ msg: error.message });
  }

  //Solo lo puede eliminar la persona que lo creo
  if (proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error("Acción no válida");
    return res.status(401).json({ msg: error.message });
  }

  try {
    await proyecto.deleteOne();
    res.json({ msg: "Proyecto Eliminado" });
  } catch (error) {
    console.log(error)
  }
}

const buscarColaborador = async (req, res) => {
  const { email } = req.body

  const usuario = await Usuario.findOne({ email }).select('-confirmado -createdAt -password -token -updatedAt -__v')

  if (!usuario) {
    const error = new Error('Usuario no encontrado')
    return res.status(404).json({ msg: error.message })
  }

  res.json(usuario)

}

const agregarColaborador = async (req, res) => {
  const proyecto = await Proyecto.findById(req.params.id)

  if (!proyecto) {
    const error = new Error("Proyecto No Encontrado")
    return res.status(404).json({ msg: error.message })
  }

  if (proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error("Acción no válida")
    return res.status(404).json({ msg: error.message })
  }

  const { email } = req.body

  const usuario = await Usuario.findOne({ email }).select('-confirmado -createdAt -password -token -updatedAt -__v')

  if (!usuario) {
    const error = new Error('Usuario no encontrado')
    return res.status(404).json({ msg: error.message })
  }

  //Verificar que el colaborador no sea el amdin
  if (proyecto.creador.toString() === usuario._id.toString()) {
    const error = new Error('El creador del proyecto no puede ser colaborador')
    return res.status(404).json({ msg: error.message })
  }

  //Revisar que el colaborador no esté agregado
  if (proyecto.colaboradores.includes(usuario._id)) {
    const error = new Error('El usuario ya pertenece al proyecto')
    return res.status(404).json({ msg: error.message })
  }

  proyecto.colaboradores.push(usuario._id)
  await proyecto.save()
  res.json({ msg: 'Colaborador agregado correctamente' })
}

const eliminarColaborador = async (req, res) => {
  const proyecto = await Proyecto.findById(req.params.id)

  if (!proyecto) {
    const error = new Error("Proyecto No Encontrado")
    return res.status(404).json({ msg: error.message })
  }

  if (proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error("Acción no válida")
    return res.status(404).json({ msg: error.message })
  }

  proyecto.colaboradores.pull(req.body.id)
  await proyecto.save()
  res.json({ msg: 'Colaborador eliminado correctamente' })
}

const obtenerTareas = async (req, res) => {
  const { id } = req.params;

  const existeProyecto = await Proyecto.findById(id);

  if (!existeProyecto) {
    const error = new Error("No encontrado");
    return res.status(404).json({ msg: error.message });
  }

  //Tienes que ser creador o colaborador
  const tareas = await Tarea.find().where('proyecto').equals(id);
  res.json(tareas);
}

export {
  obtenerProyectos,
  obtenerProyecto,
  nuevoProyecto,
  editarProyecto,
  eliminarProyecto,
  buscarColaborador,
  agregarColaborador,
  eliminarColaborador,
  obtenerTareas
}
const generarId = () => {
  const random = Math.random().toString(32).substring(2); //Substring quita los primeros 2 caracteres
  const fecha = Date.now().toString(32);
  return random + fecha;
}

export default generarId;
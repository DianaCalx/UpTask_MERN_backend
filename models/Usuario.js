import mongoose from "mongoose";
import bcrypt from "bcrypt"; //Dependencia para encriptar passwords

const usuarioSchema = mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  token: {
    type: String
  },
  confirmado: {
    type: Boolean,
    default: false,
  }
},
  {
    timestamps: true, //crea dos columnas una de creado y de actualizado
  }
);
//Pre es un middleware
usuarioSchema.pre('save', async function (next) {
  console.log(this.isModified('password'));

  if (!this.isModified('password')) { //Verifica si el password ya esta hasheado
    next(); //no ejecutes lo siguiente, vete al siguiente middleware
  }
  //Hash
  const salt = await bcrypt.genSalt(10); //10 rondas parea crear el hash
  this.password = await bcrypt.hash(this.password, salt);
});

usuarioSchema.methods.comprobarPassword = async function (passwordFormulario) {
  return await bcrypt.compare(passwordFormulario, this.password)
}

const Usuario = mongoose.model("Usuario", usuarioSchema);
export default Usuario;
import nodemailer from 'nodemailer';

export const emailRegistro = async (datos) => {
  const { nombre, email, token } = datos;

  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  //Informacion Email

  const info = await transport.sendMail({
    from: '"UpTask - Administrador de proyectos" <cuentas@uptask.com>',
    to: email,
    subject: "UpTaskk - Comprueba tu cuenta",
    text: "Comprueba tu cuenta en UpTask",
    html: `
      <p>Hola: ${nombre} Comprueba tu cuenta en UpTask </p>
      <p>Tu cuenta ya está casi lista, solo debes comprobarla en el siguiente enlace:</p>

      <a href="${process.env.FRONTEND_URL}/confirmar/${token}">Comprobar cuenta</a>

      <p>Si tu no creaste esta cuenta, puedes ignorar el mensaje</p>
      
    `
  })
};

export const emailOlvidePassword = async (datos) => {
  const { nombre, email, token } = datos;

  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  //Informacion Email

  const info = await transport.sendMail({
    from: '"UpTask - Administrador de proyectos" <cuentas@uptask.com>',
    to: email,
    subject: "UpTaskk - Restablece tu Password",
    text: "Restablece tu Password",
    html: `
      <p>Hola: ${nombre} has solicitado restablecer tu password </p>
      <p>Clic en el siguiente enlace para generar un nuevo password:</p>

      <a href="${process.env.FRONTEND_URL}/olvide-password/${token}">Restablecer Password</a>

      <p>Si tu no solicitaste este email, puedes ignorar el mensaje</p>
      
    `
  })
};
// Reglas de los formularios de login y registro. Son las mismas del backend,
// para avisar antes de enviar; aun así, el backend vuelve a validar todo.

const EMAIL_FORMAT = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateEmail = (value: string): string | undefined => {
  if (!value.trim()) return "Escribe tu email.";
  if (!EMAIL_FORMAT.test(value.trim()))
    return "Escribe un email válido, por ejemplo ana@correo.com.";
  return undefined;
};

export const validateLoginPassword = (value: string): string | undefined =>
  value ? undefined : "Escribe tu contraseña.";

export const validateNombre = (value: string): string | undefined => {
  const nombre = value.trim();
  if (!nombre) return "Escribe tu nombre.";
  if (nombre.length < 2) return "El nombre debe tener al menos 2 caracteres.";
  if (nombre.length > 100) return "El nombre no puede tener más de 100 caracteres.";
  return undefined;
};

export const PASSWORD_HINT = "Mínimo 8 caracteres, con mayúscula, minúscula y número.";

export const validateNewPassword = (value: string): string | undefined => {
  if (!value) return "Escribe una contraseña.";
  if (value.length < 8) return "La contraseña debe tener al menos 8 caracteres.";
  if (value.length > 72) return "La contraseña no puede tener más de 72 caracteres.";
  if (!/[a-z]/.test(value) || !/[A-Z]/.test(value) || !/\d/.test(value)) {
    return "La contraseña debe tener al menos una mayúscula, una minúscula y un número.";
  }
  return undefined;
};

export const validateConfirmation = (
  password: string,
  confirmation: string,
): string | undefined => {
  if (!confirmation) return "Repite la contraseña.";
  if (password !== confirmation) return "Las contraseñas no coinciden.";
  return undefined;
};

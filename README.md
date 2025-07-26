# 🏆 Goalify

Prototipo para una aplicación de seguimiento y evaluación de objetivos diarios.  
Desarrollado como parte de un trabajo obligatorio para el taller de desarrollo web.

## 📌 Objetivo

El objetivo de este obligatorio es aplicar los conceptos del taller desarrollando una pequeña aplicación web. Esta aplicación permitirá a un usuario registrar y visualizar autoevaluaciones de sus objetivos diarios.

La persistencia de datos se realizará a través de una API REST proporcionada por el equipo docente. Esta API **no cuenta con control de errores**, por lo que la validación y el manejo adecuado de los datos son responsabilidad del desarrollador.

---

## 🚀 Funcionalidades requeridas

### 1. Registro de usuario
- Se debe ingresar usuario, contraseña y país de residencia.
- En caso de éxito, se devuelve un token e ID del usuario.
- El usuario debe iniciar sesión automáticamente al registrarse.
- La sesión debe mantenerse activa incluso al cerrar y abrir el navegador (usando `localStorage`).
- En caso de error, debe mostrarse el mensaje en la interfaz.

### 2. Inicio de sesión
- Devuelve token actualizado e ID del usuario.
- Deben incluirse en todos los llamados a la API.
- En caso de error, debe mostrarse el mensaje correspondiente.

### 3. Cierre de sesión (Logout)
- El usuario debe poder cerrar sesión para permitir que otro se conecte.

### 4. Agregar evaluación
- Permite registrar una nueva evaluación asociada al usuario.
- Datos requeridos:
  - **Objetivo** (se almacena el ID).
  - **Calificación**: número entero entre -5 (muy malo) y 5 (muy bueno).
  - **Fecha**: día de la evaluación (hoy o días anteriores, no posteriores).

### 5. Listado de evaluaciones
- Se deben listar todas las evaluaciones del usuario.
- Cada objetivo debe mostrar el emoji correspondiente.

### 6. Eliminar evaluación
- Cada evaluación debe tener un botón para eliminarla.

### 7. Filtro por fecha
- Permite filtrar evaluaciones por:
  - Última semana
  - Último mes
  - Todo el historial

### 8. Informe de cumplimiento de objetivos
- **Puntaje global**: promedio de todas las calificaciones del usuario.
- **Puntaje diario**: promedio de las calificaciones del día actual.

### 9. Mapa de usuarios por país
- Muestra 10 "markers" en un mapa.
- Cada marcador muestra un tooltip con la cantidad de usuarios registrados en ese país.

---

## 🛠️ Tecnologías sugeridas

- HTML, CSS y JavaScript
- Framework/librería de tu preferencia (ej. Ionic, React, Vue, etc.)
- API REST proporcionada por el equipo docente

---

## ⚠️ Importante

- **Todos los llamados a la API requieren el token e ID del usuario.**
- **La API no realiza validaciones**, por lo que deben realizarse desde el frontend.
- El endpoint de la API será publicado en Aulas.

---

## 🏫 Facultad de Ingeniería – Universidad ORT Uruguay

Bernard Wand-Polak  
Cuareim 1451  
11.100 Montevideo, Uruguay  
Tel: 2902 15 05 | Fax: 2908 13 70  
[www.ort.edu.uy](https://www.ort.edu.uy)

---

> Proyecto realizado como parte del curso de Taller de Desarrollo Web.

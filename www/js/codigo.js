const MENU = document.querySelector("#menu");
const ROUTER = document.querySelector("#ruteo");
const HOME = document.querySelector("#pantalla-home");
const REGISTRO = document.querySelector("#pantalla-registro");
const LOGIN = document.querySelector("#pantalla-login");
const AGREGAR_EVALUACIONES = document.querySelector("#pantalla-agregar-evaluaciones");
const LISTAR_EVALUACIONES = document.querySelector("#pantalla-listar-evaluaciones");
const NAV = document.querySelector("ion-nav");
const MAPA = document.querySelector("#pantalla-mapa");

Inicio();

function CerrarMenu() {
    MENU.close();
}

function Inicio() {
    Eventos();
    ArmarMenu();
}

function ArmarMenu() {
    let token = localStorage.getItem("token");
    let html = `<ion-item href="/" onclick="CerrarMenu()">HOME</ion-item>`;
    if (token) {
        html += `    <ion-item href="/agregar-evaluaciones" onclick="CerrarMenu()">AGREGAR EVALUACIONES</ion-item>
                     <ion-item href="/listar-evaluaciones" onclick="CerrarMenu()">LISTAR EVALUACIONES</ion-item>
                     <ion-item  onclick="Logout()">LOGOUT</ion-item>
                    `
    } else {
        html += `     <ion-item href="/registro" onclick="CerrarMenu()">REGISTRO</ion-item>
                    <ion-item href="/login" onclick="CerrarMenu()">LOGIN</ion-item>`
    }

    document.querySelector("#menu-opciones").innerHTML = html;
}

function Eventos() {
    ROUTER.addEventListener('ionRouteDidChange', Navegar);
    document.querySelector("#btnRegistrar").addEventListener('click', TomarDatosRegistro);
    document.querySelector("#btnLogin").addEventListener('click', TomarDatosLogin);
    document.querySelector("#btnAgregarEvaluacion").addEventListener('click', AgregarEvaluacion);
}

async function TomarDatosRegistro() {
    let u = document.querySelector("#txtRegistroUser").value;
    let p = document.querySelector("#txtRegistroPassword").value;
    let idPais = document.querySelector("#slcPais").value;

    //Validar que los campos no esten vacios
    if (u === '' || p === '') {
        alert("Por favor complete todos los campos");
        return;
    }

    let loginObj = new Object();
    loginObj.usuario = u;
    loginObj.password = p;
    loginObj.idPais = idPais;

    let response = await fetch(`https://goalify.develotion.com/usuarios.php`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginObj),
    });

    let body = await response.json();

    if (body.codigo == 200) {

        localStorage.setItem("token", body.token);
        localStorage.setItem("iduser", body.id);

        ArmarMenu();
        NAV.push("page-home");

    } else {
        alert("Error");
    }

}

async function TomarDatosLogin() {

    let u = document.querySelector("#txtLoginUser").value;
    let p = document.querySelector("#txtLoginPassword").value;

    let loginObj = new Object();
    loginObj.usuario = u;
    loginObj.password = p;

    let response = await fetch(`https://goalify.develotion.com/login.php`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginObj),
    });

    let body = await response.json();

    if (body.codigo == 200) {

        localStorage.setItem("token", body.token);
        localStorage.setItem("iduser", body.id);

        ArmarMenu();
        NAV.push("page-home");

    } else {
        alert("Error");
    }

}

function Navegar(evt) {
    OcultarPantallas();
    let ruta = evt.detail.to;

    if (ruta == "/") {
        HOME.style.display = "block";
    } else if (ruta == "/registro") {
        REGISTRO.style.display = "block";
        PoblarSelectPaises();
    } else if (ruta == "/login") {
        LOGIN.style.display = "block";
    } else if (ruta == "/agregar-evaluaciones") {
        AGREGAR_EVALUACIONES.style.display = "block";
        ObtenerPuntuaciones();
        ObtenerObjetivos();
    } else if (ruta == "/listar-evaluaciones") {
        LISTAR_EVALUACIONES.style.display = "block";
        ObtenerObjetivos();
        listadoEvaluaciones();
    } else if (ruta == "/mapa") {
        MAPA.style.display = "block";
    }

}

async function PoblarSelectPaises() {

    let response = await fetch("https://goalify.develotion.com/paises.php");
    let body = await response.json();

    let html = ``;
    for (let pais of body.paises) {
        html += ` <ion-select-option value="${pais.id}">${pais.name}</ion-select-option>`
    }
    document.querySelector("#slcPais").innerHTML = html;

}

function Logout() {
    localStorage.clear();
    MENU.close();
    ArmarMenu();
    NAV.push("page-home");
}


function OcultarPantallas() {

    HOME.style.display = "none";
    REGISTRO.style.display = "none";
    LOGIN.style.display = "none";
    AGREGAR_EVALUACIONES.style.display = "none";
    LISTAR_EVALUACIONES.style.display = "none";
    MAPA.style.display = "none";
}

/*#############################################################################
Metodo: AgregarEvaluacion
Descripcion: Este metodo obtiene los datos del formulario de evaluacion y los envia a la API
#############################################################################*/
let ListaDeObjetivos = [];

async function ObtenerObjetivos() {
    let response = await fetch('https://goalify.develotion.com/objetivos.php', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'token': localStorage.getItem("token"),
            'iduser': localStorage.getItem("iduser")
        },
    });
    let body = await response.json();
    let option = ``;
    for (objetivo of body.objetivos) {
        option += ` <ion-select-option value="${objetivo.id}">${objetivo.nombre}</ion-select-option>`;
        ListaDeObjetivos.push(objetivo);
    }
    document.querySelector('#slcObjetivo').innerHTML = option;
}

function ObtenerPuntuaciones() {
    let puntuacion = ``;
    for (let i = -5; i <= 5; i++) {
        puntuacion += `<ion-select-option value="${i}">${i}</ion-select-option>`;
    }
    document.querySelector('#slcPuntuacion').innerHTML = puntuacion;
}

async function AgregarEvaluacion() {
    let fechaStr = document.querySelector('#datetime').value;
    let objetivoSeleccionado = document.querySelector('#slcObjetivo').value;
    let puntuacionSeleccionada = document.querySelector('#slcPuntuacion').value;

    // Validar que los campos no esten vacios
    if (fechaStr === undefined || objetivoSeleccionado === undefined || puntuacionSeleccionada === undefined) {
        alert('Por favor, complete todos los campos.');
        return;
    }

    let fechaIngresada = new Date(fechaStr);
    // Obtener la fecha actual sin hora (solo yyyy-mm-dd)
    let hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    if (fechaIngresada > hoy) {
        alert('La fecha no puede ser posterior a hoy.');
        return;
    } else {
        let objetivoEvaluado = new Object();
        objetivoEvaluado.idObjetivo = objetivoSeleccionado;
        objetivoEvaluado.idUsuario = localStorage.getItem("iduser");
        objetivoEvaluado.calificacion = parseInt(puntuacionSeleccionada);
        objetivoEvaluado.fecha = fechaStr;
        // Enviar los datos al servidor
        let response = await fetch('https://goalify.develotion.com/evaluaciones.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'token': localStorage.getItem("token"),
                'iduser': localStorage.getItem("iduser")
            },
            body: JSON.stringify(objetivoEvaluado)
        });
        let body = await response.json();
        if (body.codigo === 200) {
            alert('Evaluación agregada correctamente.');
            listadoEvaluaciones(); // Actualizar la lista de evaluaciones
        } else {
            alert('Error al agregar la evaluación.');
        }
    }
}

/*#############################################################################
Metodo: listadoEvaluaciones
Descripcion: Este metodo obtiene las evaluaciones del usuario y las muestra en una tabla
#############################################################################*/
async function listadoEvaluaciones() {
    let response = await fetch(`https://goalify.develotion.com/evaluaciones.php?idUsuario=${localStorage.getItem("iduser")}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'token': localStorage.getItem("token"),
            'iduser': localStorage.getItem("iduser")
        }
    });
    let body = await response.json();
    if (body.codigo !== 200) {
        alert('Error al obtener las evaluaciones.');
        return;
    }
    let lista = document.querySelector('#listadoEvaluaciones');
    lista.innerHTML = '';
    let fila = '';
    for (evaluacion of body.evaluaciones) {
        for (objetivo of ListaDeObjetivos) {
            if (evaluacion.idObjetivo === objetivo.id) {
                evaluacion.nombre = objetivo.nombre;
                evaluacion.emoji = objetivo.emoji;
            }
        }
        fila += `
            <ion-card>
            <ion-card-header>
                <ion-card-title>${evaluacion.emoji} ${evaluacion.nombre}</ion-card-title>
            </ion-card-header>

            <ion-card-content>
                Fecha: ${evaluacion.fecha}
                <br>
                Calificación: ${evaluacion.calificacion}
            </ion-card-content>
            <ion-card-header id="evaluacion-${evaluacion.id}">
                <ion-button onclick="EliminarEvaluacion(${evaluacion.id})" shape="round">
                    <ion-icon slot="icon-only" name="trash"></ion-icon>
                </ion-button>
            </ion-card-header>
            </ion-card>
        `;
    }
    lista.innerHTML = fila;
}

async function EliminarEvaluacion(idEvaluacion) {
    let response = await fetch(`https://goalify.develotion.com/evaluaciones.php?idEvaluacion=${idEvaluacion}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'token': localStorage.getItem("token"),
            'iduser': localStorage.getItem("iduser")
        }
    });
    let body = await response.json();
    if (body.codigo === 200) {
        alert('Evaluación eliminada correctamente.');
        listadoEvaluaciones(); // Actualizar la lista de evaluaciones
    } else {
        alert('Error al eliminar la evaluación.');
    }
}
const MENU = document.querySelector("#menu");
const ROUTER = document.querySelector("#ruteo");
const HOME = document.querySelector("#pantalla-home");
const REGISTRO = document.querySelector("#pantalla-registro");
const LOGIN = document.querySelector("#pantalla-login");
const AGREGAR_EVALUACIONES = document.querySelector("#pantalla-agregar-evaluaciones");
const LISTAR_EVALUACIONES = document.querySelector("#pantalla-listar-evaluaciones");
const NAV = document.querySelector("ion-nav");
const MAPA = document.querySelector("#pantalla-mapa");
const URL_BASE = "https://goalify.develotion.com/";


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
                     <ion-item href="/mapa" onclick="CerrarMenu()">MAPA</ion-item>
                     <ion-item href="/" onclick="Logout()">LOGOUT</ion-item>
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
    let u = document.querySelector("#txtRegistroUser").value?.trim();
    let p = document.querySelector("#txtRegistroPassword").value?.trim();
    let idPais = document.querySelector("#slcPais").value;

    //Validar que los campos no esten vacios
    if (!u || !p || !idPais || idPais === "") {
        MostrarToast("Por favor complete todos los campos", 3000);
        return;
    }

    let loginObj = new Object();
    loginObj.usuario = u;
    loginObj.password = p;
    loginObj.idPais = idPais;


    PrenderLoading("Procesando registro...");
    let response = await fetch(`${URL_BASE}usuarios.php`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginObj),
    });

    let body = await response.json();

    if (body.codigo === 200) {

        localStorage.setItem("token", body.token);
        localStorage.setItem("iduser", body.id);

        ArmarMenu();
        NAV.push("page-home");
        MostrarToast('Inicio de sesión exitoso.', 3000);
    }
    else if (body.codigo === 409) {
        Alertar("Error", "Error al crear usuario", "El usuario ya existe. Elija otro nombre.");
    }
    else if (body.codigo === 400) {
        Alertar("Error", "Error al crear usuario", "Debe completar todos los campos.");
    }
    else {
        Alertar("Error", "Error al crear usuario", body.mensaje);
    }
    ApagarLoading();
}

async function TomarDatosLogin() {

    let u = document.querySelector("#txtLoginUser").value;
    let p = document.querySelector("#txtLoginPassword").value;

    let loginObj = new Object();
    loginObj.usuario = u;
    loginObj.password = p;
    PrenderLoading("Iniciando sesión...");
    let response = await fetch(`${URL_BASE}login.php`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginObj),
    });

    let body = await response.json();

    if (body.codigo === 200) {

        localStorage.setItem("token", body.token);
        localStorage.setItem("iduser", body.id);

        ArmarMenu();
        NAV.push("page-home");
        MostrarToast('Inicio de sesión exitoso.', 3000);
    }
    else if (body.codigo === 401) {
        Alertar("Error", "Error de autenticación", "Usuario o contraseña incorrectos.");
    }
    else if (body.codigo === 400) {
        Alertar("Error", "Error de autenticación", "Debe completar todos los campos.");
    }
    else {
        Alertar("Error", "Error de autenticación", body.mensaje);
    }
    ApagarLoading();
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
        LimpiarListaEvaluaciones();
        listadoEvaluaciones();
    } else if (ruta == "/mapa") {
        CargarMapa();
        MAPA.style.display = "block";
    }

}

async function PoblarSelectPaises() {
    PrenderLoading("Cargando países...");
    let response = await fetch(`${URL_BASE}paises.php`);
    let body = await response.json();

    let html = ``;
    for (let pais of body.paises) {
        html += ` <ion-select-option value="${pais.id}">${pais.name}</ion-select-option>`
    }
    document.querySelector("#slcPais").innerHTML = html;
    ApagarLoading();
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
    try{
         PrenderLoading("Cargando objetivos...");
        let response = await fetch(`${URL_BASE}objetivos.php`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'token': localStorage.getItem("token"),
                'iduser': localStorage.getItem("iduser")
            },
        });
        if(response.status == 401){
            throw 401;
        }
        if(response.status == 403){
            throw 403;
        }
        let body = await response.json();

        if (body.codigo !== 200) {
            Alertar("Error", "", "Error al obtener objetivos.");
            return;
        }

        ListaDeObjetivos = [];
        let option = ``;
        for (let objetivo of body.objetivos) {
            option += ` <ion-select-option value="${objetivo.id}">${objetivo.nombre}</ion-select-option>`;
            ListaDeObjetivos.push(objetivo);
        }
        document.querySelector('#slcObjetivo').innerHTML = option;
    }
    catch (e) {
        if (e === 401) {
            localStorage.clear();
            ArmarMenu(); 
            NAV.push("page-login");
        } else if (e === 403) {
            Alertar("Error","", "No tiene permisos para este recurso", "");
        } else {
            Alertar("Error", "", "Error inesperado", "");
        }    
    }
    finally {
        ApagarLoading();
    }

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
        MostrarToast('Por favor, complete todos los campos.', 3000);
        return;
    }

    let fechaIngresadaStr = formatearFecha(new Date(fechaStr));
    let hoyStr = formatearFecha(new Date());
    if (fechaIngresadaStr > hoyStr) {
        Alertar("Error", "", "La fecha no puede ser posterior a hoy.");
        return;
    } 
    else {
        let objetivoEvaluado = new Object();
        objetivoEvaluado.idObjetivo = objetivoSeleccionado;
        objetivoEvaluado.idUsuario = localStorage.getItem("iduser");
        objetivoEvaluado.calificacion = parseInt(puntuacionSeleccionada);
        objetivoEvaluado.fecha = fechaIngresadaStr;
        try{
            PrenderLoading("Agregando evaluación...");
            // Enviar los datos al servidor
            let response = await fetch(`${URL_BASE}evaluaciones.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'token': localStorage.getItem("token"),
                    'iduser': localStorage.getItem("iduser")
                },
                body: JSON.stringify(objetivoEvaluado)
            });
            if(response.status == 401){
                throw 401;
            }
            if(response.status == 403){
                throw 403;
            }
            let body = await response.json();

            if (body.codigo === 200) {
                MostrarToast('Evaluación agregada correctamente.', 3000);
                listadoEvaluaciones(); // Actualizar la lista de evaluaciones
            } else {
                Alertar("Error", "", "Error al agregar la evaluación.");
            }
        }   
        catch (e) {
            if (e === 401) {
                localStorage.clear();
                ArmarMenu(); 
                NAV.push("page-login");
            } else if (e === 403) {
                Alertar("Error","", "No tiene permisos para este recurso", "");
            } else {
                Alertar("Error", "", "Error inesperado", "");
            }  
        }  
        finally {
            ApagarLoading();
        }
    }
}


function formatearFecha(fecha) {
    return fecha.toISOString().split("T")[0];
}


/*#############################################################################
Metodo: listadoEvaluaciones
Descripcion: Este metodo obtiene las evaluaciones del usuario y las muestra en una tabla
#############################################################################*/
async function ObtenerEvaluaciones() {
    try{
        let response = await fetch(`${URL_BASE}evaluaciones.php?idUsuario=${localStorage.getItem("iduser")}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'token': localStorage.getItem("token"),
                'iduser': localStorage.getItem("iduser")
            }
        });
        if(response.status == 401){
            throw 401;
        }
        if(response.status == 403){
            throw 403;
        }
        let body = await response.json();
        if (body.codigo !== 200) {
            Alertar("Error", "", "Error al obtener las evaluaciones.");
            return;
        }
        return body;
    }
    catch (e) {
        if (e === 401) {
            localStorage.clear();
            ArmarMenu(); 
            NAV.push("page-login");
        } else if (e === 403) {
            Alertar("Error","", "No tiene permisos para este recurso", "");
        } else {
            Alertar("Error", "", "Error inesperado", "");
        }  
    }  
    finally {
        ApagarLoading();
    }
}

let lista = document.querySelector('#listadoEvaluaciones');

async function listadoEvaluaciones() {
    PrenderLoading("Cargando evaluaciones...");
    let body = await ObtenerEvaluaciones();
    if (!body.evaluaciones || body.evaluaciones.length === 0) {
        lista.innerHTML = `
          <ion-card color="warning">
            <ion-card-header>
              <ion-card-title>⚠️ Sin evaluaciones</ion-card-title>
            </ion-card-header>
            <ion-card-content>
              Aún no has registrado ninguna evaluación.<br>
              ¡Agrega una para empezar!
            </ion-card-content>
          </ion-card>
        `;
        ActualizarPuntajes([]);
        ApagarLoading();
        return;
    }
    FiltrarEvaluaciones();
    //ActualizarPuntajes(body.evaluaciones);
    ApagarLoading();
}

function ActualizarPuntajes(evaluaciones) {
    let hoyStr = formatearFecha(new Date());
    let puntajeGlobal = 0;
    let puntajeDiario = 0;

    // Calcular promedio global
    let sumaTotal = 0;
    for (let e of evaluaciones){
        sumaTotal += Number(e.calificacion);
    } 
    if(evaluaciones.length > 0){
      puntajeGlobal = (sumaTotal / evaluaciones.length).toFixed(2);
    }
  
    // Obtener evaluaciones del día de hoy
    let evaluacionesHoy = [];
    for (let e of evaluaciones) {
        if (e.fecha === hoyStr) {
            evaluacionesHoy.push(e);
        }
    }

    // Calcular promedio diario
    let sumaHoy = 0;
    for (let e of evaluacionesHoy) {
        sumaHoy += Number(e.calificacion);
    }

    if(evaluacionesHoy.length > 0){
      puntajeDiario = (sumaHoy / evaluacionesHoy.length).toFixed(2);
    }

    lista.innerHTML = `
        <ion-card color="light">
            <ion-card-header>
                <ion-card-title>Informe de Cumplimiento</ion-card-title>
            </ion-card-header>
            <ion-card-content>
                <p><b>Puntaje Global:</b> ${puntajeGlobal}</p>
                <p><b>Puntaje Diario:</b> ${puntajeDiario}</p>
            </ion-card-content>
        </ion-card>
    ` + lista.innerHTML;
}

function LimpiarListaEvaluaciones() {
    lista.innerHTML = `<ion-button expand="block" onclick="FiltrarEvaluaciones('todas')" id="btnVerTodas">Todas las evaluaciones</ion-button>
    <ion-button expand="block" onclick="FiltrarEvaluaciones('mes')" id="btnVerMes">Evaluaciones del último mes</ion-button>
    <ion-button expand="block" onclick="FiltrarEvaluaciones('semana')" id="btnVerUltimaSem">Evaluaciones de la última semana</ion-button>`;
}

async function FiltrarEvaluaciones(tipo = 'todas') {
    PrenderLoading("Filtrando evaluaciones...");
    let body = await ObtenerEvaluaciones();
    let fila = '';
 
    LimpiarListaEvaluaciones();
 
    for (evaluacion of body.evaluaciones) {
        for (objetivo of ListaDeObjetivos) {
            if (evaluacion.idObjetivo === objetivo.id) {
                evaluacion.nombre = objetivo.nombre;
                evaluacion.emoji = objetivo.emoji;
            }
        }
        // Filtrar por tipo
        let fechaDeHoy = new Date();
        if (tipo === 'todas') {
            //LimpiarListaEvaluaciones();
            fila += `
                <ion-item-sliding>
                    <ion-item-options side="start">
                        <ion-item-option color="danger" id="evaluacion-${evaluacion.id}" onclick="EliminarEvaluacion(${evaluacion.id})">Eliminar</ion-item-option>
                    </ion-item-options>

                    <ion-item>
                        <ion-label>${evaluacion.emoji} ${evaluacion.nombre} (${evaluacion.calificacion})</ion-label>
                        <ion-note slot="end">${evaluacion.fecha}</ion-note>
                    </ion-item>
                </ion-item-sliding>
        `;
        } else if (tipo === 'mes') {
            //LimpiarListaEvaluaciones();
            let fechaEvaluacion = new Date(evaluacion.fecha);
            let unMesAtras = new Date(fechaDeHoy.setMonth(fechaDeHoy.getMonth() - 1));
            if (fechaEvaluacion >= unMesAtras) {
                fila += `
                    <ion-item-sliding>
                        <ion-item-options side="start">
                            <ion-item-option color="danger" id="evaluacion-${evaluacion.id}" onclick="EliminarEvaluacion(${evaluacion.id})">Eliminar</ion-item-option>
                        </ion-item-options>

                        <ion-item>
                            <ion-label>${evaluacion.emoji} ${evaluacion.nombre} (${evaluacion.calificacion})</ion-label>
                            <ion-note slot="end">${evaluacion.fecha}</ion-note>
                        </ion-item>
                    </ion-item-sliding>
                `;
            }
        } else if (tipo === 'semana') {
            //LimpiarListaEvaluaciones();
            let fechaEvaluacion = new Date(evaluacion.fecha);
            let unaSemanaAtras = new Date(fechaDeHoy.setDate(fechaDeHoy.getDate() - 7));
            if (fechaEvaluacion >= unaSemanaAtras) {
                fila += `
                    <ion-item-sliding>
                        <ion-item-options side="start">
                            <ion-item-option color="danger" id="evaluacion-${evaluacion.id}" onclick="EliminarEvaluacion(${evaluacion.id})">Eliminar</ion-item-option>
                        </ion-item-options>

                        <ion-item>
                            <ion-label>${evaluacion.emoji} ${evaluacion.nombre} (${evaluacion.calificacion})</ion-label>
                            <ion-note slot="end">${evaluacion.fecha}</ion-note>
                        </ion-item>
                    </ion-item-sliding>
                `;
            }
        }

    }
    lista.innerHTML += fila;
    ActualizarPuntajes(body.evaluaciones);
    ApagarLoading();
}

async function EliminarEvaluacion(idEvaluacion) {
    try{
        PrenderLoading("Eliminando evaluación...");
        let response = await fetch(`${URL_BASE}evaluaciones.php?idEvaluacion=${idEvaluacion}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'token': localStorage.getItem("token"),
                'iduser': localStorage.getItem("iduser")
            }
        });
        if(response.status == 401){
            throw 401;
        }
        if(response.status == 403){
            throw 403;
        }
        let body = await response.json();
        if (body.codigo === 200) {
            MostrarToast('Evaluación eliminada correctamente.', 3000);
            listadoEvaluaciones(); // Actualizar la lista de evaluaciones
        } else {
            Alertar('Hubo un error', '', 'Error al eliminar la evaluación.');
        }
    }
    catch (e) {
        if (e === 401) {
            localStorage.clear();
            ArmarMenu(); 
            NAV.push("page-login");
        } else if (e === 403) {
            Alertar("Error","", "No tiene permisos para este recurso", "");
        } else {
            Alertar("Error", "", "Error inesperado", "");
        }  
    }  
    finally {
        ApagarLoading();
    }
}

function Alertar(titulo, subtitulo, mensaje) {
    const alert = document.createElement('ion-alert');
    alert.cssClass = 'my-custom-class';
    alert.header = titulo;
    alert.subHeader = subtitulo;
    alert.message = mensaje;
    alert.buttons = ['OK'];
    document.body.appendChild(alert);
    alert.present();
}

const loading = document.createElement('ion-loading');
function PrenderLoading(texto) {
    loading.cssClass = 'my-custom-class';
    loading.message = texto;
    //loading.duration = 2000;
    document.body.appendChild(loading);
    loading.present();
}

function ApagarLoading() {
    loading.dismiss();
}

function MostrarToast(mensaje, duracion) {
    const toast = document.createElement('ion-toast');
    toast.message = mensaje;
    toast.duration = duracion;

    document.body.appendChild(toast);
    toast.present();
}

function CargarMapa(){
    if(map!=null){
        map.remove();
    }
    setTimeout(function(){CrearMapa()},200)
}

var map = null;
async function CrearMapa() {

    map = L.map('map').setView([-15, -60], 3);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        minZoom: 1,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    PrenderLoading("Cargando datos del mapa...");

    let dataUsuariosPorPais = await ObtenerUsuariosPorPais();
    let dataPaises = await ObtenerPaises();

    ApagarLoading();

    if (!dataUsuariosPorPais || dataUsuariosPorPais.codigo !== 200) {
        Alertar("Error", "", "No se pudieron obtener los usuarios por país.");
        return;
    }
    if (!dataPaises) {
        Alertar("Error", "", "No se pudieron obtener los países.");
        return;
    }

    for (let usuarios of dataUsuariosPorPais.paises) {
        for (let p of dataPaises.paises) {
            if (Number(p.id) === Number(usuarios.id)) {
                if (p.latitude && p.longitude) {
                    L.marker([p.latitude, p.longitude]).addTo(map).bindTooltip(`<b>${p.name}</b><br> ${usuarios.cantidadDeUsuarios} usuarios registrados`);
                }
            }
        }
    }    
}

async function ObtenerUsuariosPorPais() {
    try{
        PrenderLoading("Obteniendo usuarios por pais...");
        let response = await fetch(`${URL_BASE}usuariosPorPais.php`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'token': localStorage.getItem("token"),
                'iduser': localStorage.getItem("iduser")
            },
        });
        if(response.status == 401){
            throw 401;
        }
        if(response.status == 403){
            throw 403;
        }
        let body = await response.json();
        if (body.codigo !== 200) {
            Alertar("Error", "", "Error al obtener usuarios por pais.");
            return null;
        }
        return body;
    }
    catch (e) {
        if (e === 401) {
            localStorage.clear();
            ArmarMenu(); 
            NAV.push("page-login");
        } else if (e === 403) {
            Alertar("Error","", "No tiene permisos para este recurso", "");
        } else {
            Alertar("Error", "", "Error inesperado", "");
        }  
    }  
    finally {
        ApagarLoading();
    }
}

async function ObtenerPaises() {
    PrenderLoading("Cargando países...");
    let response = await fetch(`${URL_BASE}paises.php`);
    let body = await response.json();
    ApagarLoading();
    return body;
}